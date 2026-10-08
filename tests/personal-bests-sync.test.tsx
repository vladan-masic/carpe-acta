// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchPersonalBest } from "../src/completions/personalBests";
import { usePersonalBest } from "../src/hooks/usePersonalBest";
import { summarizeProgress } from "../src/utils/progress";
vi.mock("../src/completions/personalBests", () => ({ fetchPersonalBest: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const source = { client: {} as SupabaseClient, owner: "a" as string | null, loading: false, busy: false, progress: summarizeProgress([]), guest: { records: [{ id: "old", tipId: "tip", completedAt: "2020-01-01T12:00:00Z" }], readable: true } };
it("uses full guest history without querying the account", () => {
  const { result } = renderHook(() => usePersonalBest({ ...source, owner: null }));
  expect(result.current.best).toEqual({ days: 1, week: "2019-12-30" });
  expect(fetchPersonalBest).not.toHaveBeenCalled();
});
it("ignores stale owner reads and hides data during writes before refreshing", async () => {
  let resolve!: (value: { days: number; week: string | null }) => void;
  vi.mocked(fetchPersonalBest).mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValue({ days: 7, week: "2026-09-28" });
  const { result, rerender } = renderHook(props => usePersonalBest(props), { initialProps: source });
  rerender({ ...source, owner: "b" });
  await waitFor(() => expect(result.current.best?.days).toBe(7));
  await act(() => resolve({ days: 5, week: "2026-09-21" }));
  expect(result.current.best?.days).toBe(7);
  rerender({ ...source, owner: "b", busy: true });
  expect(result.current.best).toBeNull();
  vi.mocked(fetchPersonalBest).mockResolvedValue({ days: 6, week: "2026-09-28" });
  rerender({ ...source, owner: "b", progress: summarizeProgress([]) });
  await waitFor(() => expect(result.current.best?.days).toBe(6));
});
it("retries failures without affecting completion history", async () => {
  vi.mocked(fetchPersonalBest).mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ days: 1, week: "2019-12-30" });
  const { result } = renderHook(() => usePersonalBest(source));
  await waitFor(() => expect(result.current.error).toBe(true));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.best?.days).toBe(1));
});
