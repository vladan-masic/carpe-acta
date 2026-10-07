// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { summarizeMilestones, earnedMilestones, localDay, visibleMilestones, actionMilestones } from "../src/utils/milestones";
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
function clientFor(pages: { data: { completed_at: string }[] | null; count: number | null; error: Error | null }[]) {
  const queries: Record<string, ReturnType<typeof vi.fn>>[] = [];
  const from = vi.fn(() => {
    const page = pages[queries.length];
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const key of ["select", "eq", "lte", "lt", "order", "limit"]) query[key] = vi.fn(() => query);
    query.then = vi.fn((resolve) => Promise.resolve(page).then(resolve));
    queries.push(query); return query;
  });
  return { client: { from } as unknown as SupabaseClient, queries, from };
}
it("gets an exact action count and skips the rest of a busy day instead of downloading all events", async () => {
  const rows = Array.from({ length: 128 }, () => ({ completed_at: now.toISOString() }));
  const mock = clientFor([{ data: rows, count: 10000, error: null }, { data: [{ completed_at: new Date(2024, 1, 1).toISOString() }], count: null, error: null }]);
  expect(await fetchMilestones(mock.client, "alice", now)).toEqual({ actions: 10000, days: 2 });
  expect(mock.queries[0].select).toHaveBeenCalledWith("completed_at", { count: "exact" });
  expect(mock.queries[1].lt).toHaveBeenCalledWith("completed_at", new Date(2026, 9, 7).toISOString());
  for (const query of mock.queries) {
    expect(query.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(query.lte).toHaveBeenCalledWith("completed_at", now.toISOString());
    expect(query.limit).toHaveBeenCalledWith(128);
  }
});
it("stops at the highest active-day milestone and does not silently accept read errors", async () => {
  const rows = Array.from({ length: 384 }, (_, i) => ({ completed_at: new Date(2026, 9, 7 - i).toISOString() }));
  const mock = clientFor([0, 128, 256].map(offset => ({ data: rows.slice(offset, offset + 128), count: offset === 0 ? 9999 : null, error: null })));
  expect(await fetchMilestones(mock.client, "alice", now)).toEqual({ actions: 9999, days: 365 });
  expect(mock.from).toHaveBeenCalledTimes(3);
  await expect(fetchMilestones(clientFor([{ data: null, count: null, error: new Error("offline") }]).client, "a", now)).rejects.toThrow("offline");
  await expect(fetchMilestones(clientFor([{ data: [], count: null, error: null }]).client, "a", now)).rejects.toThrow("Missing");
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
