// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchMilestones } from "../src/completions/milestones";
import { useMilestones } from "../src/hooks/useMilestones";
import { summarizeProgress } from "../src/utils/progress";
vi.mock("../src/completions/milestones", () => ({ fetchMilestones: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const source = { client: {} as SupabaseClient, owner: "a" as string | null, loading: false, busy: false, progress: summarizeProgress([]), guest: { records: [{ id: "old", tipId: "tip", completedAt: "2020-01-01T12:00:00Z" }], readable: true } };
it("uses full guest history without querying the account", () => {
  const { result } = renderHook(() => useMilestones({ ...source, owner: null }));
  expect(result.current.totals).toEqual({ actions: 1, days: 1 });
  expect(fetchMilestones).not.toHaveBeenCalled();
});
it("ignores stale owner reads and hides data during writes before refreshing", async () => {
  let resolve!: (value: { actions: number; days: number }) => void;
  vi.mocked(fetchMilestones).mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValue({ actions: 10, days: 7 });
  const { result, rerender } = renderHook(props => useMilestones(props), { initialProps: source });
  rerender({ ...source, owner: "b" });
  await waitFor(() => expect(result.current.totals?.actions).toBe(10));
  await act(() => resolve({ actions: 100, days: 50 }));
  expect(result.current.totals?.actions).toBe(10);
  rerender({ ...source, owner: "b", busy: true });
  expect(result.current.totals).toBeNull();
  vi.mocked(fetchMilestones).mockResolvedValue({ actions: 9, days: 6 });
  rerender({ ...source, owner: "b", progress: summarizeProgress([]) });
  await waitFor(() => expect(result.current.totals?.actions).toBe(9));
});
it("retries failures without affecting completion history", async () => {
  vi.mocked(fetchMilestones).mockRejectedValueOnce(new Error("offline")).mockResolvedValue({ actions: 1, days: 1 });
  const { result } = renderHook(() => useMilestones(source));
  await waitFor(() => expect(result.current.error).toBe(true));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.totals?.actions).toBe(1));
});
