// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { weeklyGoalMessages } from "../src/i18n/weeklyGoal";
import { WeeklyGoal } from "../src/components/WeeklyGoal";
import { useWeeklyGoal, validGoal, weeklyGoalKey } from "../src/hooks/useWeeklyGoal";
import { summarizeProgress, weeklyActivity } from "../src/utils/progress";
const now = new Date(2026, 9, 7, 12);
const record = (id: string, day: number) => ({ id, tipId: "two-minute-start", completedAt: new Date(2026, 9, day, 10).toISOString() });
beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(now); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
it("counts nonconsecutive days once and excludes the preceding Sunday", () => {
  const progress = summarizeProgress([record("sun", 4), record("mon", 5), record("mon2", 5), record("wed", 7)], now);
  expect(weeklyActivity(progress.days, now).map(day => day.active)).toEqual([true, false, true, false, false, false, false]);
});
it.each([new Date(2027, 0, 1), new Date(2026, 2, 29), new Date(2026, 9, 26)])("aligns Monday through Sunday across year and DST boundaries: %s", date => {
  const days = weeklyActivity([], date);
  expect(days[0].date.getDay()).toBe(1);
  expect(days[6].date.getDay()).toBe(0);
  expect(days.every(day => day.date.getHours() === 0)).toBe(true);
  expect(new Set(days.map(day => day.date.toDateString())).size).toBe(7);
});
it("starts fresh on Monday and retains the target", () => {
  localStorage.setItem(weeklyGoalKey, "3");
  vi.setSystemTime(new Date(2026, 9, 12, 12));
  render(<WeeklyGoal client={null} owner={null} locale="en" busy={false} progress={summarizeProgress([record("wed", 7)], new Date())} />);
  expect(screen.getByRole("status").textContent).toContain("0 of 3");
});
it.each(["en", "sr-Latn"] as const)("supports opt-in, change, Undo, and disabling in %s", locale => {
  const records = [record("mon", 5), record("mon2", 5), record("wed", 7)];
  const props = { client: null, owner: null, locale, busy: false };
  const { rerender } = render(<WeeklyGoal {...props} progress={summarizeProgress(records, now)} />);
  expect(screen.queryByRole("progressbar")).toBeNull();
  fireEvent.click(screen.getByText(weeklyGoalMessages[locale].settings));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
  expect(screen.getByRole("progressbar").getAttribute("value")).toBe("2");
  rerender(<WeeklyGoal {...props} progress={summarizeProgress(records.slice(1), now)} />);
  expect(screen.getByRole("progressbar").getAttribute("value")).toBe("2");
  rerender(<WeeklyGoal {...props} progress={summarizeProgress([records[2]], now)} />);
  expect(screen.getByRole("progressbar").getAttribute("value")).toBe("1");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "0" } });
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(localStorage.getItem(weeklyGoalKey)).toBe("0");
});
it("rejects invalid preferences and reports blocked guest storage", async () => {
  for (const value of [-1, 8, 1.2, "3", null]) expect(validGoal(value)).toBe(0);
  const { result } = renderHook(() => useWeeklyGoal(null, null));
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  await act(() => result.current.save(3));
  expect(result.current.error).toBe(true);
  expect(result.current.target).toBe(0);
});
function account(id: string, target: number) { return { data: { user: { id, user_metadata: { weekly_goal_days: target } } }, error: null }; }
it("loads and saves account preferences without overwriting guest storage and refreshes on focus", async () => {
  localStorage.setItem(weeklyGoalKey, "2");
  const getUser = vi.fn().mockResolvedValue(account("a", 4));
  const updateUser = vi.fn().mockResolvedValue(account("a", 3));
  const client = { auth: { getUser, updateUser } } as unknown as SupabaseClient;
  const { result } = renderHook(() => useWeeklyGoal(client, "a"));
  await waitFor(() => expect(result.current.target).toBe(4));
  await act(() => result.current.save(3));
  expect(updateUser).toHaveBeenCalledWith({ data: { weekly_goal_days: 3 } });
  expect(result.current.target).toBe(3);
  expect(localStorage.getItem(weeklyGoalKey)).toBe("2");
  getUser.mockResolvedValue(account("a", 5));
  fireEvent.focus(window);
  await waitFor(() => expect(result.current.target).toBe(5));
  updateUser.mockResolvedValue({ data: { user: null }, error: new Error("offline") });
  await act(() => result.current.save(1));
  expect(result.current.target).toBe(5);
  expect(result.current.error).toBe(true);
});
it("isolates account switches and ignores old pending writes", async () => {
  let resolve!: (value: ReturnType<typeof account>) => void;
  const updateUser = vi.fn(() => new Promise(r => { resolve = r; }));
  const client = { auth: { getUser: vi.fn().mockResolvedValueOnce(account("a", 3)).mockResolvedValueOnce(account("b", 5)), updateUser } } as unknown as SupabaseClient;
  const props = { client, locale: "en" as const, busy: false, progress: summarizeProgress([], now) };
  const { rerender } = render(<WeeklyGoal key="a" owner="a" {...props} />);
  fireEvent.click(screen.getByText(weeklyGoalMessages.en.settings));
  await waitFor(() => expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("3"));
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
  rerender(<WeeklyGoal key="b" owner="b" {...props} />);
  fireEvent.click(screen.getByText(weeklyGoalMessages.en.settings));
  await waitFor(() => expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("5"));
  await act(() => resolve(account("a", 1)));
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("5");
  rerender(<WeeklyGoal key="guest" owner={null} {...props} />);
  fireEvent.click(screen.getByText(weeklyGoalMessages.en.settings));
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("0");
});
it("reports a failed account read and recovers on focus", async () => {
  const getUser = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue(account("a", 2));
  const client = { auth: { getUser } } as unknown as SupabaseClient;
  const { result } = renderHook(() => useWeeklyGoal(client, "a"));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.loading).toBe(false);
  fireEvent.focus(window);
  await waitFor(() => expect(result.current.target).toBe(2));
  expect(result.current.error).toBe(false);
});
it("does not let an older refresh overwrite a newly saved goal", async () => {
  let resolve!: (value: ReturnType<typeof account>) => void;
  const getUser = vi.fn().mockResolvedValueOnce(account("a", 2)).mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const client = { auth: { getUser, updateUser: vi.fn().mockResolvedValue(account("a", 3)) } } as unknown as SupabaseClient;
  const { result } = renderHook(() => useWeeklyGoal(client, "a"));
  await waitFor(() => expect(result.current.target).toBe(2));
  fireEvent.focus(window);
  await act(() => result.current.save(3));
  await act(() => resolve(account("a", 2)));
  expect(result.current.target).toBe(3);
});
