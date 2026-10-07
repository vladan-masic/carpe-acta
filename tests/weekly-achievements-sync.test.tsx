// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { syncAccountAchievements } from "../src/completions/weeklyAchievements";
import { useWeeklyAchievements } from "../src/hooks/useWeeklyAchievements";
vi.mock("../src/completions/weeklyAchievements", () => ({ syncAccountAchievements: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const client = {} as SupabaseClient;
it("ignores stale account reads and waits for completion/goal writes", async () => {
  let resolve!: (value: []) => void;
  vi.mocked(syncAccountAchievements).mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValue([]);
  const { result, rerender } = renderHook(({ owner, ready }) => useWeeklyAchievements(client, owner, 3, ready, []), { initialProps: { owner: "a", ready: false } });
  expect(syncAccountAchievements).not.toHaveBeenCalled();
  rerender({ owner: "a", ready: true });
  rerender({ owner: "b", ready: true });
  await waitFor(() => expect(result.current.records).toEqual([]));
  await act(() => resolve([]));
  expect(syncAccountAchievements).toHaveBeenLastCalledWith(client, "b");
  rerender({ owner: "b", ready: false });
  expect(result.current.records).toBeNull();
});
it("exposes errors without falling back to shared guest storage and retries", async () => {
  vi.mocked(syncAccountAchievements).mockRejectedValueOnce(new Error("missing migration")).mockResolvedValue([]);
  const { result } = renderHook(() => useWeeklyAchievements(client, "a", 3, true, []));
  await waitFor(() => expect(result.current.error).toBe(true));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.records).toEqual([]));
  expect(result.current.error).toBe(false);
});
