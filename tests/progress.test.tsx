// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { progressDays, summarizeProgress } from "../src/utils/progress";
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
  expect(screen.getAllByRole("listitem")).toHaveLength(9);
});
it("distinguishes loading and unavailable history from a genuine empty history", () => {
  const { rerender } = render(<ProgressView progress={null} locale="en" tips={[]} busy />);
  expect(screen.getByText("Loading your progress…")).toBeTruthy();
  rerender(<ProgressView progress={null} locale="en" tips={[]} busy={false} />);
  expect(screen.getByText(/Progress is unavailable/)).toBeTruthy();
  rerender(<ProgressView progress={summarizeProgress([], now)} locale="en" tips={[]} busy={false} />);
  expect(screen.getByText(/One small action/)).toBeTruthy();
});
