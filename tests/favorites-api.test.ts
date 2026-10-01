import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addFavorites, fetchFavorites, removeFavorite } from "../src/favorites/api";

function mockClient(error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), upsert: vi.fn(), delete: vi.fn(), then: vi.fn() };
  for (const key of ["select", "eq", "order", "upsert", "delete"] as const) query[key].mockReturnValue(query);
  query.then.mockImplementation((resolve) => Promise.resolve({ data: [{ tip_id: "known" }, { tip_id: "retired" }], error }).then(resolve));
  const from = vi.fn(() => query);
  return { client: { from } as unknown as SupabaseClient, from, query };
}
it("filters reads by owner and orders newest first with a stable tie-breaker", async () => {
  const { client, from, query } = mockClient();
  expect(await fetchFavorites(client, "alice")).toEqual(["known", "retired"]);
  expect(from).toHaveBeenCalledWith("tip_favorites");
  expect(query.eq).toHaveBeenCalledWith("user_id", "alice");
  expect(query.order.mock.calls).toEqual([["created_at", { ascending: false }], ["tip_id"]]);
});
it("merges deduplicated IDs without updating existing rows or supplying timestamps", async () => {
  const { client, query } = mockClient();
  await addFavorites(client, "alice", ["one", "one", "two"]);
  expect(query.upsert).toHaveBeenCalledWith([{ user_id: "alice", tip_id: "one" }, { user_id: "alice", tip_id: "two" }], { onConflict: "user_id,tip_id", ignoreDuplicates: true });
});
it("does nothing for an empty import", async () => {
  const { client, from } = mockClient();
  await addFavorites(client, "alice", []);
  expect(from).not.toHaveBeenCalled();
});
it("restricts deletion to one owner and one tip", async () => {
  const { client, query } = mockClient();
  await removeFavorite(client, "alice", "one");
  expect(query.eq.mock.calls).toEqual([["user_id", "alice"], ["tip_id", "one"]]);
});
it("propagates read, import and delete failures", async () => {
  const error = new Error("denied");
  const { client } = mockClient(error);
  await expect(fetchFavorites(client, "alice")).rejects.toBe(error);
  await expect(addFavorites(client, "alice", ["one"])).rejects.toBe(error);
  await expect(removeFavorite(client, "alice", "one")).rejects.toBe(error);
});
