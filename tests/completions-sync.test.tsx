// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useTipCompletion } from "../src/hooks/useTipCompletion";
import { completionStorageKey, loadCompletions } from "../src/utils/completions";
import { countCompletions, uploadCompletions } from "../src/completions/api";
vi.mock("../src/completions/api", () => ({ countCompletions: vi.fn(), uploadCompletions: vi.fn() }));
const client = {} as SupabaseClient;
const auth = (id: string | null) => ({ client, session: id ? { user: { id } } as Session : null, loading: false });
const guest = { id: "legacy-1", tipId: "retired-tip", completedAt: "2026-09-16T10:00:00.000Z" };
function deferred<T>() { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; }
beforeEach(() => { localStorage.clear(); vi.resetAllMocks(); vi.mocked(countCompletions).mockResolvedValue(0); vi.mocked(uploadCompletions).mockResolvedValue(); });
afterEach(cleanup);

it("preserves guest history and blocks duplicate clicks while allowing another attempt", () => {
  const { result } = renderHook(() => useTipCompletion(auth(null)));
  act(() => { result.current.complete("two-minute-start"); result.current.complete("two-minute-start"); });
  expect(loadCompletions().records).toHaveLength(1);
  act(() => result.current.reset());
  act(() => result.current.complete("two-minute-start"));
  expect(loadCompletions().records).toHaveLength(2);
  expect(uploadCompletions).not.toHaveBeenCalled();
});
it("does not automatically upload guest data, imports original IDs and dates, and restores guest count on logout", async () => {
  localStorage.setItem(completionStorageKey, JSON.stringify([guest]));
  const { result, rerender } = renderHook(({ id }) => useTipCompletion(auth(id)), { initialProps: { id: "alice" as string | null } });
  await waitFor(() => expect(result.current.busy).toBe(false));
  expect(uploadCompletions).not.toHaveBeenCalled();
  expect(result.current.count).toBe(0);
  act(() => result.current.importGuest());
  await waitFor(() => expect(result.current.imported).toBe(true));
  expect(uploadCompletions).toHaveBeenCalledWith(client, "alice", [guest]);
  expect(loadCompletions().records).toEqual([guest]);
  rerender({ id: null });
  expect(result.current.count).toBe(1);
});
it("retries an ambiguous save using the identical record and never writes account events to guest storage", async () => {
  vi.mocked(uploadCompletions).mockRejectedValueOnce(new Error("lost response"));
  const { result } = renderHook(() => useTipCompletion(auth("alice")));
  await waitFor(() => expect(result.current.busy).toBe(false));
  act(() => { result.current.complete("two-minute-start"); result.current.complete("two-minute-start"); });
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(uploadCompletions).toHaveBeenCalledTimes(1);
  const original = vi.mocked(uploadCompletions).mock.calls[0][2];
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe("saved"));
  expect(vi.mocked(uploadCompletions).mock.calls[1][2]).toEqual(original);
  expect(loadCompletions().records).toEqual([]);
});
it("does not apply a late save acknowledgement to the next card", async () => {
  const delayed = deferred<void>();
  vi.mocked(uploadCompletions).mockReturnValueOnce(delayed.promise);
  const { result } = renderHook(() => useTipCompletion(auth("alice")));
  await waitFor(() => expect(result.current.busy).toBe(false));
  act(() => result.current.complete("two-minute-start"));
  act(() => result.current.reset());
  await act(async () => delayed.resolve());
  expect(result.current.status).toBeNull();
});
it("ignores a previous account's pending count after switching accounts", async () => {
  const delayed = deferred<number>();
  vi.mocked(countCompletions).mockReturnValueOnce(delayed.promise).mockResolvedValue(2);
  const { result, rerender } = renderHook(({ id }) => useTipCompletion(auth(id)), { initialProps: { id: "alice" } });
  rerender({ id: "bob" });
  await waitFor(() => expect(result.current.count).toBe(2));
  await act(async () => delayed.resolve(99));
  expect(result.current.count).toBe(2);
});
it("ignores a pending save after logout without locking the guest collection", async () => {
  const delayed = deferred<void>();
  vi.mocked(uploadCompletions).mockReturnValueOnce(delayed.promise);
  const { result, rerender } = renderHook(({ id }) => useTipCompletion(auth(id)), { initialProps: { id: "alice" as string | null } });
  await waitFor(() => expect(result.current.busy).toBe(false));
  act(() => result.current.complete("two-minute-start"));
  rerender({ id: null });
  act(() => result.current.complete("phone-distance"));
  await act(async () => delayed.resolve());
  expect(result.current.status).toBe("saved");
  expect(result.current.count).toBe(1);
  expect(countCompletions).toHaveBeenCalledTimes(1);
});
it("refreshes account counts on focus and exposes read errors", async () => {
  vi.mocked(countCompletions).mockRejectedValueOnce(new Error("offline"));
  const { result } = renderHook(() => useTipCompletion(auth("alice")));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.count).toBeNull();
  vi.mocked(countCompletions).mockResolvedValue(1500);
  act(() => window.dispatchEvent(new Event("focus")));
  await waitFor(() => expect(result.current.count).toBe(1500));
});
it("does not overwrite or import malformed history", async () => {
  localStorage.setItem(completionStorageKey, "broken");
  const { result } = renderHook(() => useTipCompletion(auth("alice")));
  await waitFor(() => expect(result.current.busy).toBe(false));
  act(() => result.current.importGuest());
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(uploadCompletions).not.toHaveBeenCalled();
  expect(localStorage.getItem(completionStorageKey)).toBe("broken");
});
it("blocks guest writes while authentication initializes", () => {
  const { result } = renderHook(() => useTipCompletion({ ...auth(null), loading: true }));
  act(() => result.current.complete("two-minute-start"));
  expect(loadCompletions().records).toEqual([]);
});
