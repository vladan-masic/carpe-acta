import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchExploredTips } from "../src/completions/categoryExploration";
import { tips } from "../src/data/tips";
it("requests only catalog IDs for the current owner and cutoff", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: [tips[0].id], error: null });
  const now = new Date("2026-10-07T12:00:00Z");
  expect(await fetchExploredTips({ rpc } as unknown as SupabaseClient, "owner", now)).toEqual([tips[0].id]);
  expect(rpc).toHaveBeenCalledWith("completed_catalog_tip_ids", { p_owner: "owner", p_tip_ids: tips.map(t => t.id), p_until: now.toISOString() });
});
it.each([null, [42], {}])("rejects invalid query results %j", async data => {
  const rpc = vi.fn().mockResolvedValue({ data, error: null });
  await expect(fetchExploredTips({ rpc } as unknown as SupabaseClient, "owner")).rejects.toThrow("Invalid completed tip IDs");
});
it("propagates query failure instead of claiming zero exploration", async () => {
  const error = new Error("offline");
  const rpc = vi.fn().mockResolvedValue({ data: null, error });
  await expect(fetchExploredTips({ rpc } as unknown as SupabaseClient, "owner")).rejects.toBe(error);
});
