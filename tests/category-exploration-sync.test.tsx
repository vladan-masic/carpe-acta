// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchExploredTips } from "../src/completions/categoryExploration";
import { useCategoryExploration } from "../src/hooks/useCategoryExploration";
import { tips } from "../src/data/tips";
import { summarizeProgress } from "../src/utils/progress";
vi.mock("../src/completions/categoryExploration", () => ({ fetchExploredTips: vi.fn() }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
const record = { id: "old", tipId: tips[0].id, completedAt: "2020-01-01T12:00:00Z" };
const source = { client: {} as SupabaseClient, owner: "a" as string | null, loading: false, busy: false, open: true, progress: summarizeProgress([]), guest: { records: [record], readable: true } };
it("does not query collapsed exploration", () => {
  renderHook(() => useCategoryExploration({ ...source, open: false }));
  expect(fetchExploredTips).not.toHaveBeenCalled();
});
it("uses guest history and updates after Undo, excluding future and invalid records", () => {
  const guestSource = { ...source, owner: null, guest: { records: [record, { ...record, completedAt: "invalid" }, { ...record, tipId: tips[20].id, completedAt: "2999-01-01" }], readable: true } };
  const { result, rerender } = renderHook(props => useCategoryExploration(props), { initialProps: guestSource });
  expect(result.current.categories).toEqual([tips[0].categoryId]);
  rerender({ ...guestSource, guest: { records: [], readable: true } });
  expect(result.current.categories).toEqual([]);
  expect(fetchExploredTips).not.toHaveBeenCalled();
});
it("ignores stale accounts and refreshes after writes", async () => {
  let resolve!: (ids: string[]) => void;
  vi.mocked(fetchExploredTips).mockImplementationOnce(() => new Promise(done => { resolve = done; })).mockResolvedValue([]);
  const { result, rerender } = renderHook(props => useCategoryExploration(props), { initialProps: source });
  rerender({ ...source, owner: "b" });
  await waitFor(() => expect(result.current.categories).toEqual([]));
  await act(() => resolve([tips[0].id]));
  expect(result.current.categories).toEqual([]);
  rerender({ ...source, owner: "b", busy: true });
  expect(result.current.categories).toBeNull();
  vi.mocked(fetchExploredTips).mockResolvedValue([tips[0].id]);
  rerender({ ...source, owner: "b", progress: summarizeProgress([]) });
  await waitFor(() => expect(result.current.categories).toEqual([tips[0].categoryId]));
});
it("offers retry for failed account reads", async () => {
  vi.mocked(fetchExploredTips).mockRejectedValueOnce(new Error("offline")).mockResolvedValue([]);
  const { result } = renderHook(() => useCategoryExploration(source));
  await waitFor(() => expect(result.current.error).toBe(true));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.categories).toEqual([]));
});
