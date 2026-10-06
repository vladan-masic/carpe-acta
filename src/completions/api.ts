import { summarizeHelpfulTips } from "../utils/helpfulTips";
import { importCompletionFeedback } from "./feedback";
import { calendarDays, recentCompletionLimit, summarizeProgress } from "../utils/progress";
import type { ProgressData } from "../utils/progress";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipCompletion } from "../utils/completions";

export async function deleteCompletion(client: SupabaseClient, userId: string, id: string) {
  // Feedback is deleted atomically by the existing foreign-key cascade.
  const { error } = await client.from("tip_completions").delete()
    .eq("user_id", userId).eq("id", id);
  if (error) throw error;
}

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
  await importCompletionFeedback(client, userId, unique);
}

export async function fetchProgress(client: SupabaseClient, userId: string, now = new Date()): Promise<ProgressData> {
  const start = calendarDays(now)[0].date;
  const until = now.toISOString();
  const recentRequest = client.from("tip_completions").select("id,tip_id,completed_at,completion_feedback(helpful)")
    .eq("user_id", userId).lte("completed_at", until)
    .order("completed_at", { ascending: false }).order("id").limit(recentCompletionLimit);
  async function calendarRecords() {
    const records: TipCompletion[] = [];
    // Never silently truncate a busy calendar at Supabase's default row limit.
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await client.from("tip_completions").select("id,tip_id,completed_at,completion_feedback(helpful)")
        .eq("user_id", userId).gte("completed_at", start).lte("completed_at", until)
        .order("completed_at", { ascending: false }).order("id").range(offset, offset + 499);
      if (error) throw error;
      const rows = data ?? [];
      records.push(...rows.map(toCompletion));
      if (rows.length < 500) return records;
    }
  }
  const [recent, calendar, rated] = await Promise.all([recentRequest, calendarRecords(), fetchRatedCompletions(client, userId, now)]);
  if (recent.error) throw recent.error;
  return { ...summarizeProgress(calendar, now), recent: (recent.data ?? []).map(toCompletion), helpful: summarizeHelpfulTips(rated, now) };
}
function toCompletion(row: { id: string; tip_id: string; completed_at: string; completion_feedback?: { helpful: boolean } | { helpful: boolean }[] | null }): TipCompletion {
  const feedback = Array.isArray(row.completion_feedback) ? row.completion_feedback[0] : row.completion_feedback;
  return { id: row.id, tipId: row.tip_id, completedAt: row.completed_at, ...(feedback ? { feedback: feedback.helpful } : {}) };
}

export async function fetchRatedCompletions(client: SupabaseClient, userId: string, now = new Date()): Promise<TipCompletion[]> {
  const records: TipCompletion[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("tip_completions")
      .select("id,tip_id,completed_at,completion_feedback!inner(helpful)")
      .eq("user_id", userId).lte("completed_at", now.toISOString())
      .order("completed_at", { ascending: false }).order("id").range(offset, offset + 499);
    if (error) throw error;
    const rows = data ?? [];
    records.push(...rows.map(toCompletion));
    if (rows.length < 500) return records;
  }
}
