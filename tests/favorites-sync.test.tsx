// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useFavorites } from "../src/hooks/useFavorites";
import { favoritesStorageKey } from "../src/utils/favorites";
import { addFavorites, fetchFavorites, removeFavorite } from "../src/favorites/api";

vi.mock("../src/favorites/api", () => ({ addFavorites: vi.fn(), fetchFavorites: vi.fn(), removeFavorite: vi.fn() }));
const client = {} as SupabaseClient;
const signedIn = (id: string | null) => ({ client, session: id ? { user: { id } } as Session : null, loading: false });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  localStorage.clear(); vi.resetAllMocks();
  vi.mocked(fetchFavorites).mockResolvedValue([]);
  vi.mocked(addFavorites).mockResolvedValue();
  vi.mocked(removeFavorite).mockResolvedValue();
});
afterEach(cleanup);

it("keeps guest saves local and restores them after logout without auto-importing", async () => {
  const { result, rerender } = renderHook(({ id }) => useFavorites(signedIn(id)), { initialProps: { id: null as string | null } });
  act(() => result.current.toggle("two-minute-start"));
  expect(result.current.ids).toEqual(["two-minute-start"]);
  rerender({ id: "alice" });
  await waitFor(() => expect(result.current.disabled).toBe(false));
  expect(result.current.ids).toEqual([]);
  expect(result.current.canImport).toBe(true);
  expect(addFavorites).not.toHaveBeenCalled();
  rerender({ id: null });
  expect(result.current.ids).toEqual(["two-minute-start"]);
});

it("saves and removes individual tips, then reads server state", async () => {
  const { result } = renderHook(() => useFavorites(signedIn("alice")));
  await waitFor(() => expect(result.current.disabled).toBe(false));
  vi.mocked(fetchFavorites).mockResolvedValue(["two-minute-start"]);
  act(() => result.current.toggle("two-minute-start"));
  await waitFor(() => expect(result.current.ids).toEqual(["two-minute-start"]));
  expect(addFavorites).toHaveBeenCalledWith(client, "alice", ["two-minute-start"]);
  vi.mocked(fetchFavorites).mockResolvedValue([]);
  act(() => result.current.toggle("two-minute-start"));
  await waitFor(() => expect(result.current.ids).toEqual([]));
  expect(removeFavorite).toHaveBeenCalledWith(client, "alice", "two-minute-start");
  expect(localStorage.getItem(favoritesStorageKey)).toBeNull();
});

it("imports only missing guest favorites explicitly and retains the browser copy", async () => {
  const stored = JSON.stringify(["phone-distance", "two-minute-start"]);
  localStorage.setItem(favoritesStorageKey, stored);
  vi.mocked(fetchFavorites).mockResolvedValue(["two-minute-start"]);
  const { result } = renderHook(() => useFavorites(signedIn("alice")));
  await waitFor(() => expect(result.current.disabled).toBe(false));
  vi.mocked(fetchFavorites).mockResolvedValue(["phone-distance", "two-minute-start"]);
  act(() => result.current.importGuest());
  await waitFor(() => expect(result.current.canImport).toBe(false));
  expect(addFavorites).toHaveBeenCalledWith(client, "alice", ["phone-distance"]);
  expect(localStorage.getItem(favoritesStorageKey)).toBe(stored);
});

it("ignores an old account's delayed response", async () => {
  const old = deferred<string[]>();
  vi.mocked(fetchFavorites).mockReturnValueOnce(old.promise).mockResolvedValue(["phone-distance"]);
  const { result, rerender } = renderHook(({ id }) => useFavorites(signedIn(id)), { initialProps: { id: "alice" } });
  rerender({ id: "bob" });
  await waitFor(() => expect(result.current.ids).toEqual(["phone-distance"]));
  await act(async () => old.resolve(["two-minute-start"]));
  expect(result.current.ids).toEqual(["phone-distance"]);
});

it("ignores a pending save after logout and blocks rapid duplicate operations", async () => {
  const save = deferred<void>();
  vi.mocked(addFavorites).mockReturnValueOnce(save.promise);
  const { result, rerender } = renderHook(({ id }) => useFavorites(signedIn(id)), { initialProps: { id: "alice" as string | null } });
  await waitFor(() => expect(result.current.disabled).toBe(false));
  act(() => { result.current.toggle("two-minute-start"); result.current.toggle("two-minute-start"); });
  expect(addFavorites).toHaveBeenCalledTimes(1);
  rerender({ id: null });
  await act(async () => save.resolve());
  expect(result.current.ids).toEqual([]);
  expect(fetchFavorites).toHaveBeenCalledTimes(1);
});

it("retains the last snapshot on failed writes and requires refresh before retrying", async () => {
  vi.mocked(fetchFavorites).mockResolvedValue(["phone-distance"]);
  vi.mocked(removeFavorite).mockRejectedValueOnce(new Error("offline"));
  const { result } = renderHook(() => useFavorites(signedIn("alice")));
  await waitFor(() => expect(result.current.disabled).toBe(false));
  act(() => result.current.toggle("phone-distance"));
  await waitFor(() => expect(result.current.error).toBe(true));
  expect(result.current.ids).toEqual(["phone-distance"]);
  expect(result.current.disabled).toBe(true);
  act(() => result.current.refresh());
  await waitFor(() => expect(result.current.disabled).toBe(false));
  expect(result.current.error).toBe(false);
});

it("recovers from an initial read error and refreshes on window focus", async () => {
  vi.mocked(fetchFavorites).mockRejectedValueOnce(new Error("table missing"));
  const { result } = renderHook(() => useFavorites(signedIn("alice")));
  await waitFor(() => expect(result.current.error).toBe(true));
  vi.mocked(fetchFavorites).mockResolvedValue(["phone-distance"]);
  act(() => window.dispatchEvent(new Event("focus")));
  await waitFor(() => expect(result.current.ids).toEqual(["phone-distance"]));
});

it("does not edit guest data while authentication is initializing", () => {
  const { result } = renderHook(() => useFavorites({ ...signedIn(null), loading: true }));
  act(() => result.current.toggle("two-minute-start"));
  expect(localStorage.getItem(favoritesStorageKey)).toBeNull();
});
