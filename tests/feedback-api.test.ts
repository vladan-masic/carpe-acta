import { expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { saveAccountFeedback, importCompletionFeedback } from "../src/completions/feedback";
function mockClient() {
  const query = { upsert: vi.fn().mockResolvedValue({ error: null }), update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn().mockResolvedValue({ data: { completion_id: "one" }, error: null }) };
  query.update.mockReturnValue(query); query.eq.mockReturnValue(query); query.select.mockReturnValue(query);
  return { query, client: { from: vi.fn(() => query) } as unknown as SupabaseClient };
}
it("creates idempotently then updates only the answer for the owner and completion", async () => {
  const { client, query } = mockClient();
  await saveAccountFeedback(client, "alice", "one", false);
  expect(query.upsert).toHaveBeenCalledWith({ user_id: "alice", completion_id: "one", helpful: false }, { onConflict: "user_id,completion_id", ignoreDuplicates: true });
  expect(query.update).toHaveBeenCalledWith({ helpful: false });
  expect(query.eq.mock.calls).toEqual([["user_id", "alice"], ["completion_id", "one"]]);
});
it("imports both positive and negative feedback but skips unrated actions and preserves account answers", async () => {
  const { client, query } = mockClient();
  const base = { tipId: "tip", completedAt: "2026-10-01T12:00:00Z" };
  await importCompletionFeedback(client, "alice", [{ ...base, id: "one", feedback: true }, { ...base, id: "two", feedback: false }, { ...base, id: "three" }]);
  expect(query.upsert).toHaveBeenCalledWith([{ user_id: "alice", completion_id: "one", helpful: true }, { user_id: "alice", completion_id: "two", helpful: false }], { onConflict: "user_id,completion_id", ignoreDuplicates: true });
  expect(query.update).not.toHaveBeenCalled();
});
it("propagates rejected feedback writes", async () => {
  const { client, query } = mockClient();
  const error = new Error("denied"); query.upsert.mockResolvedValue({ error });
  await expect(saveAccountFeedback(client, "alice", "one", true)).rejects.toBe(error);
  expect(query.update).not.toHaveBeenCalled();
});
