// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeMilestones, earnedMilestones, localDay, visibleMilestones, actionMilestones, milestoneThresholds } from "../src/utils/milestones";
import { fetchMilestones } from "../src/completions/milestones";
import { PersonalMilestones } from "../src/components/PersonalMilestones";
const now = new Date(2026, 9, 7, 12);
const record = (id: string, date: Date) => ({ id, tipId: "old-tip", completedAt: date.toISOString() });
afterEach(cleanup);
it("counts lifetime actions and distinct local dates, excluding duplicate IDs and invalid/future records", () => {
  const first = record("a", new Date(2020, 0, 1));
  const second = record("b", new Date(2020, 0, 1, 23));
  expect(summarizeMilestones([first, first, second, record("c", now), record("future", new Date(2030, 0, 1)), { ...first, id: "bad", completedAt: "bad" }], now)).toEqual({ actions: 3, days: 2 });
  expect(earnedMilestones({ actions: 1000, days: 365 })).toHaveLength(14);
});
it("uses local midnight around DST and crosses years without a consecutive-day requirement", () => {
  const dates = [new Date(2025, 11, 31, 23), new Date(2026, 0, 1, 1), new Date(2026, 2, 29, 1), new Date(2026, 2, 29, 4)];
  expect(summarizeMilestones(dates.map((date, i) => record(String(i), date)), now).days).toBe(3);
  expect(localDay(dates[3].toISOString())).toBe(new Date(2026, 2, 29).toISOString());
});
it("fetches uncapped totals in one owner-bound request", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: [{ actions: 10000, days: 1500 }], error: null });
  expect(await fetchMilestones({ rpc } as unknown as SupabaseClient, "alice", now)).toEqual({ actions: 10000, days: 1500 });
  expect(rpc).toHaveBeenCalledExactlyOnceWith("milestone_totals", { p_owner: "alice", p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, p_until: now.toISOString() });
});
it("reports failed or malformed aggregate reads", async () => {
  for (const response of [{ error: new Error("offline"), data: null }, { data: [], error: null }, { data: [{ actions: 2, days: 3 }], error: null }]) {
    await expect(fetchMilestones({ rpc: vi.fn().mockResolvedValue(response) } as unknown as SupabaseClient, "alice", now)).rejects.toThrow();
  }
});
it.each(["en", "sr-Latn"] as const)("reveals earned badges and the next targets and removes earned status after Undo in %s", locale => {
  const props = { error: false, retry: vi.fn(), locale, completionId: null };
  const { rerender } = render(<PersonalMilestones {...props} totals={{ actions: 10, days: 7 }} />);
  expect(screen.getByRole("status").textContent).toBe("");
  fireEvent.click(screen.getByText(locale === "en" ? "View earned and next milestones" : "Prikaži ostvarena i sledeća dostignuća"));
  expect(screen.getAllByRole("listitem")).toHaveLength(6);
  rerender(<PersonalMilestones {...props} totals={{ actions: 9, days: 6 }} />);
  expect(screen.getByText(locale === "en" ? "10 actions — Not yet earned" : "10 radnji — Još nije ostvareno")).toBeTruthy();
});
it("celebrates a new completion once, but not initial loads or imports, and clears after Undo", () => {
  const props = { error: false, retry: vi.fn(), locale: "en" as const };
  const { rerender } = render(<PersonalMilestones {...props} completionId={null} totals={{ actions: 9, days: 6 }} />);
  rerender(<PersonalMilestones {...props} completionId="new" totals={null} />);
  rerender(<PersonalMilestones {...props} completionId="new" totals={{ actions: 10, days: 7 }} />);
  expect(screen.getByRole("status").textContent).toContain("10 actions");
  expect(screen.getByRole("status").textContent).toContain("7 active days");
  rerender(<PersonalMilestones {...props} completionId={null} totals={{ actions: 9, days: 6 }} />);
  expect(screen.getByRole("status").textContent).toBe("");
  rerender(<PersonalMilestones {...props} completionId={null} totals={{ actions: 50, days: 25 }} />);
  expect(screen.getByRole("status").textContent).toBe("");
});
it("shows loading and retry rather than an empty collection on failure", () => {
  const retry = vi.fn();
  const { rerender } = render(<PersonalMilestones totals={null} error={false} retry={retry} locale="en" completionId={null} />);
  expect(screen.getByText("Loading milestones…")).toBeTruthy();
  rerender(<PersonalMilestones totals={null} error retry={retry} locale="en" completionId={null} />);
  fireEvent.click(screen.getByRole("button", { name: "Retry milestones" }));
  expect(retry).toHaveBeenCalledOnce();
});

it("reveals the extended ladder one target at a time", () => {
  expect(visibleMilestones(actionMilestones, 100)).toEqual([1, 10, 50, 100, 250]);
  expect(visibleMilestones(actionMilestones, 250)).toEqual([1, 10, 50, 100, 250, 500]);
  expect(earnedMilestones({ actions: 999, days: 364 })).toHaveLength(12);
});

it.each([["actions", 1000, 1500], ["actions", 1500, 2000], ["actions", 12500, 13000], ["days", 365, 465], ["days", 465, 565], ["days", 1665, 1765]] as const)("always offers a next %s badge after %i", (kind, total, next) => {
  const targets = visibleMilestones(milestoneThresholds(kind, total), total);
  expect(targets[targets.length - 1]).toBe(next);
  expect(targets.filter(n => n > total)).toEqual([next]);
});
it("counts guest activity beyond a year", () => {
  const records = Array.from({ length: 600 }, (_, i) => record(String(i), new Date(2024, 0, 1 + i, 12)));
  expect(summarizeMilestones(records, now)).toEqual({ actions: 600, days: 600 });
});
it.each(["en", "sr-Latn"] as const)("shows ongoing targets and revokes an extended badge after Undo in %s", locale => {
  const props = { locale, error: false, retry: vi.fn(), completionId: null };
  const { rerender } = render(<PersonalMilestones {...props} totals={{ actions: 1500, days: 465 }} />);
  expect(screen.getByText(locale === "en" ? "1500 of 2000 toward the next badge" : "1500 od 2000 do sledeće značke")).toBeTruthy();
  rerender(<PersonalMilestones {...props} totals={{ actions: 1499, days: 464 }} />);
  expect(screen.getByText(locale === "en" ? "1499 of 1500 toward the next badge" : "1499 od 1500 do sledeće značke")).toBeTruthy();
});
