// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { syncGuestAchievements, readGuestAchievements, weeklyAchievementPrefix, weekKey } from "../src/utils/weeklyAchievements";
import { summarizeProgress } from "../src/utils/progress";
import { WeeklyGoal } from "../src/components/WeeklyGoal";
import { weeklyGoalKey } from "../src/hooks/useWeeklyGoal";
const now = new Date(2026, 9, 7, 12);
const record = (id: string, day: number) => ({ id, tipId: "tip", completedAt: new Date(2026, 9, day, 10).toISOString() });
const records = [record("m", 5), record("t", 6), record("w", 7)];
const days = summarizeProgress(records, now).calendar;
beforeEach(() => { localStorage.clear(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(now); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
it("records one achievement per week and preserves the original target after changes or disabling", () => {
  expect(syncGuestAchievements(3, days, now)).toHaveLength(1);
  expect(syncGuestAchievements(1, days, now)[0].target).toBe(3);
  expect(syncGuestAchievements(7, days, now)[0].target).toBe(3);
  expect(syncGuestAchievements(0, days, now)[0].target).toBe(3);
});
it("Undo removes only the current week's achievement and never guesses older weekly goals", () => {
  syncGuestAchievements(3, days, now);
  const monday = new Date(2026, 9, 12, 12);
  expect(syncGuestAchievements(3, summarizeProgress(records, monday).calendar, monday)).toHaveLength(1);
  expect(syncGuestAchievements(3, summarizeProgress(records.slice(0, 2), now).calendar, now)).toHaveLength(0);
  expect(syncGuestAchievements(0, days, now)).toHaveLength(0);
});
it("keeps nonconsecutive achieved weeks without counting missed weeks", () => {
  syncGuestAchievements(3, days, now);
  const later = new Date(2026, 9, 21, 12);
  const laterDays = summarizeProgress([record("later", 21)], later).calendar;
  expect(syncGuestAchievements(1, laterDays, later).map(row => row.week)).toEqual(["2026-10-19", "2026-10-05"]);
  expect(weekKey(new Date(2027, 0, 1))).toBe("2026-12-28");
});
it("retains unreadable storage and reports write failures", () => {
  localStorage.setItem(weeklyAchievementPrefix + "2026-10-05", "bad");
  expect(() => syncGuestAchievements(3, days, now)).toThrow();
  expect(localStorage.getItem(weeklyAchievementPrefix + "2026-10-05")).toBe("bad");
  localStorage.clear();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  expect(() => syncGuestAchievements(3, days, now)).toThrow("blocked");
});
it.each(["en", "sr-Latn"] as const)("shows an achieved-week count and the frozen goal in %s", async locale => {
  localStorage.setItem(weeklyGoalKey, "3");
  render(<WeeklyGoal client={null} owner={null} progress={summarizeProgress(records, now)} locale={locale} busy={false} />);
  await waitFor(() => expect(readGuestAchievements()).toHaveLength(1));
  expect(screen.getByText(locale === "en" ? "1 week achieved" : "Broj ostvarenih nedelja: 1")).toBeTruthy();
  fireEvent.click(screen.getByText(locale === "en" ? "View achieved weeks" : "Prikaži ostvarene nedelje"));
  expect(screen.getByText(locale === "en" ? /Goal: 3 active days/ : /Cilj: 3 aktivna dana/)).toBeTruthy();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "7" } });
  await waitFor(() => expect(screen.getByText(locale === "en" ? /Goal: 3 active days/ : /Cilj: 3 aktivna dana/)).toBeTruthy());
});
