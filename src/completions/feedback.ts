import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipCompletion } from "../utils/completions";

export async function saveAccountFeedback(client: SupabaseClient, userId: string, id: string, helpful: boolean) {
  const { error } = await client.from("completion_feedback").upsert(
    { user_id: userId, completion_id: id, helpful }, { onConflict: "user_id,completion_id", ignoreDuplicates: true },
  );
  if (error) throw error;
  // Only the answer column is mutable; identity columns have no UPDATE grant.
  const result = await client.from("completion_feedback").update({ helpful })
    .eq("user_id", userId).eq("completion_id", id).select("completion_id").single();
  if (result.error) throw result.error;
}

export async function importCompletionFeedback(client: SupabaseClient, userId: string, records: TipCompletion[]) {
  const rated = records.filter((record) => typeof record.feedback === "boolean");
  for (let offset = 0; offset < rated.length; offset += 200) {
    const { error } = await client.from("completion_feedback").upsert(
      rated.slice(offset, offset + 200).map((record) => ({ user_id: userId, completion_id: record.id, helpful: record.feedback })),
      // Re-importing old guest feedback must not overwrite a later account choice.
      { onConflict: "user_id,completion_id", ignoreDuplicates: true },
    );
    if (error) throw error;
  }
}
