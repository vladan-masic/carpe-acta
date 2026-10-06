// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { activityLevel, calendarDays, progressDays, summarizeProgress } from "../src/utils/progress";
import { ProgressView } from "../src/components/ProgressView";
import { tips } from "../src/data/tips";
import { localizeTip } from "../src/i18n/localizeTip";
const now = new Date(2026, 9, 1, 12);
const record = (id: string, date: Date, tipId = "two-minute-start") => ({ id, tipId, completedAt: date.toISOString() });
afterEach(cleanup);
it("includes seven local calendar dates crossing the month boundary", () => {
  const days = progressDays(now);
  expect(days).toHaveLength(7);
  expect(new Date(days[0].date).getDate()).toBe(25);
  expect(new Date(days[6].date).getDate()).toBe(1);
  expect(days.every((day) => new Date(day.date).getHours() === 0)).toBe(true);
});
it("counts repeats separately, deduplicates IDs, and excludes future or invalid timestamps", () => {
  const first = record("one", now);
  const result = summarizeProgress([first, first, record("two", now), record("future", new Date(2027, 0, 1)), { ...first, id: "bad", completedAt: "bad" }], now);
  expect(result.days[6].count).toBe(2);
  expect(result.recent).toHaveLength(2);
});
it("includes the first midnight and excludes the instant before it from week totals", () => {
  const start = new Date(progressDays(now)[0].date);
  const result = summarizeProgress([record("in", start), record("out", new Date(start.getTime() - 1))], now);
  expect(result.days[0].count).toBe(1);
  expect(result.recent).toHaveLength(2);
});
it("limits recent records to ten with newest first while retaining full weekly totals", () => {
  const records = Array.from({ length: 15 }, (_, index) => record(String(index), new Date(now.getTime() - index * 1000)));
  const result = summarizeProgress(records, now);
  expect(result.days[6].count).toBe(15);
  expect(result.recent.map((entry) => entry.id)).toEqual(records.slice(0, 10).map((entry) => entry.id));
});
it("uses consecutive calendar dates through daylight-saving transitions", () => {
  const days = progressDays(new Date(2026, 2, 31, 12));
  expect(days.map((day) => new Date(day.date).getDate())).toEqual([25, 26, 27, 28, 29, 30, 31]);
});
it.each(["en", "sr-Latn"] as const)("renders localized actions, timestamps and unknown tips in %s", (locale) => {
  const progress = summarizeProgress([record("one", now), record("retired", now, "retired")], now);
  const localized = tips.map((tip) => localizeTip(tip, locale));
  render(<ProgressView progress={progress} locale={locale} tips={localized} busy={false} />);
  expect(screen.getByText(localized[0].title)).toBeTruthy();
  expect(screen.getByText(localized[0].action)).toBeTruthy();
  expect(screen.getByText(locale === "en" ? "Previously available tip" : "Ranije dostupan savet")).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});
it("distinguishes loading and unavailable history from a genuine empty history", () => {
  const { rerender } = render(<ProgressView progress={null} locale="en" tips={[]} busy />);
  expect(screen.getByText("Loading your progress…")).toBeTruthy();
  rerender(<ProgressView progress={null} locale="en" tips={[]} busy={false} />);
  expect(screen.getByText(/Progress is unavailable/)).toBeTruthy();
  rerender(<ProgressView progress={summarizeProgress([], now)} locale="en" tips={[]} busy={false} />);
  expect(screen.getByText(/One small action/)).toBeTruthy();
});


it.each([new Date(2026, 0, 1, 12), new Date(2026, 2, 31, 12), new Date(2026, 9, 26, 12)])("builds twelve Monday-aligned weeks through today across year and DST boundaries: %s", (date) => {
  const days = calendarDays(date);
  expect(days.length).toBe(78 + (date.getDay() + 6) % 7);
  expect(new Date(days[0].date).getDay()).toBe(1);
  expect(new Date(days.at(-1)!.date).toDateString()).toBe(date.toDateString());
  days.forEach((day, index) => {
    expect(new Date(day.date).getHours()).toBe(0);
    if (index) {
      const previous = new Date(days[index - 1].date);
      previous.setDate(previous.getDate() + 1);
      expect(new Date(day.date).getTime()).toBe(previous.getTime());
    }
  });
});

it("retains older calendar actions independently of the recent-ten limit and weekly summary", () => {
  const start = new Date(calendarDays(now)[0].date);
  const records = Array.from({ length: 15 }, (_, index) => record(String(index), start));
  const result = summarizeProgress([...records, records[0], record("outside", new Date(start.getTime() - 1)), record("today", now)], now);
  expect(result.calendar[0].count).toBe(15);
  expect(result.calendar[0].records).toHaveLength(15);
  expect(result.days.reduce((total, day) => total + day.count, 0)).toBe(1);
  expect(result.recent).toHaveLength(10);
  expect(result.calendar.at(-1)!.count).toBe(1);
  expect([0, 1, 2, 3, 4, 5, 100].map(activityLevel)).toEqual([0, 1, 2, 3, 3, 4, 4]);
});

it.each(["en", "sr-Latn"] as const)("supports focus, hover, keyboard and day selection, including empty days and Undo updates in %s", (locale) => {
  const firstDate = new Date(calendarDays(now)[0].date);
  const records = Array.from({ length: 12 }, (_, index) => record(String(index), firstDate));
  const localized = tips.map(tip => localizeTip(tip, locale));
  const props = { locale, tips: localized, busy: false };
  const { rerender } = render(<ProgressView {...props} progress={summarizeProgress(records, now)} />);
  const group = screen.getByRole("group");
  const squares = within(group).getAllByRole("button");
  expect(squares.filter(button => button.tabIndex === 0)).toHaveLength(1);
  expect(squares.at(-1)!.getAttribute("aria-current")).toBe("date");
  fireEvent.mouseEnter(squares[0]);
  expect(screen.getByRole("tooltip").textContent).toBe(squares[0].getAttribute("aria-label"));
  act(() => squares.at(-1)!.focus());
  fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
  expect(document.activeElement).toBe(squares[squares.length - 8]);
  fireEvent.keyDown(document.activeElement!, { key: "Home", ctrlKey: true });
  expect(document.activeElement).toBe(squares[0]);
  fireEvent.keyDown(squares[0], { key: "Escape" });
  expect(screen.getByRole("tooltip").textContent?.trim()).toBe("");
  fireEvent.click(squares[0]);
  expect(squares[0].getAttribute("aria-pressed")).toBe("true");
  expect(screen.getAllByRole("listitem")).toHaveLength(12);
  rerender(<ProgressView {...props} progress={summarizeProgress(records.slice(1), now)} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(11);
  fireEvent.click(squares[1]);
  expect(screen.getByText(locale === "en" ? "No completed actions on this day." : "Nema završenih radnji ovog dana.")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: locale === "en" ? "Show recent actions" : "Prikaži nedavne radnje" }));
  expect(screen.getAllByRole("listitem")).toHaveLength(10);
});
