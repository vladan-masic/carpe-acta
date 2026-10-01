import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipCompletion } from "../utils/completions";

export async function countCompletions(client: SupabaseClient, userId: string) {
  const { count, error } = await client.from("tip_completions")
    .select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (error) throw error;
  if (count === null) throw new Error("Missing completion count");
  return count;
}

export async function uploadCompletions(client: SupabaseClient, userId: string, records: TipCompletion[]) {
  const unique = [...new Map(records.map((record) => [record.id, record])).values()];
  // Bounded batches support long guest histories. Retrying a partial import is safe.
  for (let offset = 0; offset < unique.length; offset += 200) {
    const { error } = await client.from("tip_completions").upsert(
      unique.slice(offset, offset + 200).map((record) => ({
        user_id: userId, id: record.id, tip_id: record.tipId, completed_at: record.completedAt,
      })), { onConflict: "user_id,id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }
}
