// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeProgress, summarizeYear, yearStart } from "../src/utils/progress";
import { fetchCalendarYear } from "../src/completions/api";
import { useCalendarHistory } from "../src/hooks/useCalendarHistory";
import { ProgressView } from "../src/components/ProgressView";
import { ActivityCalendar } from "../src/components/ActivityCalendar";
import { progressMessages } from "../src/i18n/progress";
vi.mock("../src/completions/api", () => ({ fetchCalendarYear: vi.fn() }));
const now = new Date(2026, 9, 6, 12);
const record = { id: "old", tipId: "old-tip", completedAt: new Date(2024, 1, 29, 12).toISOString() };
const guest = { records: [record], readable: true };
const progress = summarizeProgress([], now);
const source = { client: {} as SupabaseClient, owner: "alice" as string | null, loading: false, guest, progress, busy: false };
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

it("includes leap days, year boundaries and future placeholders without accepting future completions", () => {
  const days = summarizeYear([record, record, { ...record, id: "outside", completedAt: yearStart(2025).toISOString() }], 2024, now);
  expect(days).toHaveLength(366);
  expect(new Date(days[0].date).getMonth()).toBe(0);
  expect(new Date(days.at(-1)!.date).getMonth()).toBe(11);
  expect(days.find(day => new Date(day.date).getMonth() === 1 && new Date(day.date).getDate() === 29)?.count).toBe(1);
  const current = summarizeYear([{ ...record, completedAt: new Date(2026, 11, 31).toISOString() }], 2026, now);
  expect(current).toHaveLength(365);
  expect(current.at(-1)?.future).toBe(true);
  expect(current.reduce((count, day) => count + day.count, 0)).toBe(0);
  expect(yearStart(1).getFullYear()).toBe(1);
});

it("aligns January to weekdays, handles 54-column leap years, and never marks a historical last day as today", () => {
  const days = summarizeYear([], 2012, now); // Leap year beginning on Sunday.
  const { container } = render(<ActivityCalendar days={days} year={2012} today={yearStart(2026).toISOString()} locale="en" selected={null} onSelect={() => {}} />);
  expect(container.querySelector('.calendar-layout')?.getAttribute('style')).toContain('--calendar-weeks: 54');
  const buttons = screen.getAllByRole("button");
  expect(buttons).toHaveLength(366);
  expect(buttons.every(button => !button.hasAttribute("aria-current"))).toBe(true);
  act(() => buttons[0].focus());
  fireEvent.keyDown(buttons[0], { key: "End" });
  expect(document.activeElement).toBe(buttons[0]); // Jan 1 is the Sunday at the end of its column.
  fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
  expect(document.activeElement).toBe(buttons[7]);
});

it("does not fetch in twelve-week or guest views and includes old guest records", () => {
  const { result, rerender } = renderHook(props => useCalendarHistory(props), { initialProps: source });
  expect(fetchCalendarYear).not.toHaveBeenCalled();
  rerender({ ...source, owner: null });
  act(() => result.current.setYear(2024));
  expect(result.current.days?.reduce((count, day) => count + day.count, 0)).toBe(1);
  expect(fetchCalendarYear).not.toHaveBeenCalled();
});

it("discards stale year and owner responses and refreshes after a progress change", async () => {
  let resolveOld!: (records: typeof guest.records) => void;
  vi.mocked(fetchCalendarYear).mockImplementationOnce(() => new Promise(done => { resolveOld = done; }))
    .mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([record]);
  const { result, rerender } = renderHook(props => useCalendarHistory(props), { initialProps: source });
  act(() => result.current.setYear(2024));
  expect(result.current.loading).toBe(true);
  act(() => result.current.setYear(2025));
  await waitFor(() => expect(result.current.days).not.toBeNull());
  await act(async () => resolveOld([record]));
  expect(new Date(result.current.days![0].date).getFullYear()).toBe(2025);
  rerender({ ...source, owner: "bob" });
  expect(result.current.days).toBeNull();
  await waitFor(() => expect(fetchCalendarYear).toHaveBeenCalledWith(source.client, "bob", 2025));
  await waitFor(() => expect(result.current.loading).toBe(false));
  rerender({ ...source, owner: "bob", progress: summarizeProgress([], now) });
  await waitFor(() => expect(fetchCalendarYear).toHaveBeenCalledTimes(4));
});

it("reports year-load failures without presenting an empty calendar and supports retry", async () => {
  vi.mocked(fetchCalendarYear).mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
  const { result } = renderHook(() => useCalendarHistory(source));
  act(() => result.current.setYear(2025));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.days).toBeNull();
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.days).toHaveLength(365));
  expect(result.current.error).toBe(false);
});

it.each(["en", "sr-Latn"] as const)("switches ranges, limits future navigation and returns to recent history in %s", locale => {
  const copy = progressMessages[locale];
  function View() {
    const history = useCalendarHistory({ ...source, owner: null });
    return <ProgressView progress={progress} calendarHistory={history} locale={locale} tips={[]} busy={false} />;
  }
  render(<View />);
  fireEvent.change(screen.getByLabelText(copy.view), { target: { value: "year" } });
  expect((screen.getByRole("button", { name: copy.nextYear }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: copy.previousYear }));
  expect((screen.getByRole("button", { name: copy.nextYear }) as HTMLButtonElement).disabled).toBe(false);
  const group = screen.getByRole("group");
  fireEvent.click(within(group).getAllByRole("button")[0]);
  expect(screen.getByRole("button", { name: copy.clearDay })).toBeTruthy();
  fireEvent.change(screen.getByLabelText(copy.view), { target: { value: "weeks" } });
  expect(screen.queryByRole("button", { name: copy.clearDay })).toBeNull();
  expect(screen.getByRole("group", { name: copy.calendar })).toBeTruthy();
});

it("ignores an in-flight response after account switching or a write starts", async () => {
  const resolve: Array<(records: typeof guest.records) => void> = [];
  vi.mocked(fetchCalendarYear).mockImplementation(() => new Promise(done => resolve.push(done)));
  const { result, rerender } = renderHook(props => useCalendarHistory(props), { initialProps: source });
  act(() => result.current.setYear(2024));
  rerender({ ...source, owner: "bob" });
  await act(async () => resolve[0]([record]));
  expect(result.current.days).toBeNull();
  rerender({ ...source, owner: "bob", busy: true });
  await act(async () => resolve[1]([record]));
  expect(result.current.days).toBeNull();
  rerender({ ...source, owner: "bob", busy: false });
  await act(async () => resolve[2]([]));
  expect(result.current.days?.reduce((sum, day) => sum + day.count, 0)).toBe(0);
});
