import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { countCompletions, uploadCompletions } from "../src/completions/api";
function mockClient() {
  const query = { select: vi.fn(), eq: vi.fn(), upsert: vi.fn(), then: vi.fn() };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
  query.upsert.mockResolvedValue({ error: null });
  query.then.mockImplementation((resolve) => Promise.resolve({ count: 1501, error: null }).then(resolve));
  return { client: { from: vi.fn(() => query) } as unknown as SupabaseClient, query };
}
it("counts without fetching a truncated history", async () => {
  const { client, query } = mockClient();
  expect(await countCompletions(client, "alice")).toBe(1501);
  expect(query.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
  expect(query.eq).toHaveBeenCalledWith("user_id", "alice");
});
it("preserves original event IDs and timestamps, deduplicates and batches imports", async () => {
  const { client, query } = mockClient();
  const records = Array.from({ length: 401 }, (_, id) => ({ id: String(id), tipId: "retired-tip", completedAt: "2026-09-16T10:00:00.000Z" }));
  await uploadCompletions(client, "alice", [...records, records[0]]);
  expect(query.upsert.mock.calls.map(([rows]) => rows.length)).toEqual([200, 200, 1]);
  expect(query.upsert.mock.calls[0][0][0]).toEqual({ user_id: "alice", id: "0", tip_id: "retired-tip", completed_at: records[0].completedAt });
  expect(query.upsert.mock.calls[0][1]).toEqual({ onConflict: "user_id,id", ignoreDuplicates: true });
});
it("stops a partial import on error so it can be safely retried", async () => {
  const { client, query } = mockClient();
  const error = new Error("offline");
  query.upsert.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error });
  const records = Array.from({ length: 401 }, (_, id) => ({ id: String(id), tipId: "tip", completedAt: "2026-09-16T10:00:00Z" }));
  await expect(uploadCompletions(client, "alice", records)).rejects.toBe(error);
  expect(query.upsert).toHaveBeenCalledTimes(2);
});

it("reads the latest ten separately and paginates all weekly records with owner/date filters", async () => {
  const { fetchProgress } = await import("../src/completions/api");
  const now = new Date(2026, 9, 1, 12);
  const row = (id: number) => ({ id: String(id), tip_id: "tip", completed_at: now.toISOString() });
  const queries: any[] = [];
  const from = vi.fn(() => {
    const q: any = {};
    for (const key of ["select", "eq", "gte", "lte", "order"]) q[key] = vi.fn(() => q);
    q.limit = vi.fn().mockResolvedValue({ data: [row(999)], error: null });
    q.range = vi.fn((offset) => Promise.resolve({ data: offset === 0 ? Array.from({ length: 500 }, (_, id) => row(id)) : [row(500)], error: null }));
    queries.push(q); return q;
  });
  const result = await fetchProgress({ from } as unknown as SupabaseClient, "alice", now);
  expect(result.days[6].count).toBe(501);
  expect(result.recent[0].id).toBe("999");
  expect(queries[0].limit).toHaveBeenCalledWith(10);
  expect(queries[1].range).toHaveBeenCalledWith(0, 499);
  expect(queries[2].range).toHaveBeenCalledWith(500, 999);
  for (const query of queries) {
    expect(query.eq).toHaveBeenCalledWith("user_id", "alice");
    expect(query.lte).toHaveBeenCalledWith("completed_at", now.toISOString());
  }
});
