import type { SupabaseClient } from "@supabase/supabase-js";
import { localDay, maxMilestoneDays, type MilestoneTotals } from "../utils/milestones";

// Only timestamps cross the wire. Skip the remainder of each oldest local day:
// even a day with thousands of completions cannot force a full-history download.
// At most 365 pages of 128 timestamps; normally a single page covers all badges.
export async function fetchMilestones(client: SupabaseClient, owner: string, now = new Date()): Promise<MilestoneTotals> {
  const days = new Set<string>();
  let before: string | null = null;
  let actions = 0;
  while (days.size < maxMilestoneDays) {
    let query = client.from("tip_completions")
      .select("completed_at", before === null ? { count: "exact" } : undefined)
      .eq("user_id", owner).lte("completed_at", now.toISOString())
      .order("completed_at", { ascending: false }).limit(128);
    if (before !== null) query = query.lt("completed_at", before);
    const { data, count, error } = await query;
    if (error) throw error;
    if (before === null) {
      if (count === null) throw new Error("Missing action count");
      actions = count;
    }
    const rows = data ?? [];
    for (const row of rows) days.add(localDay(row.completed_at));
    if (rows.length < 128) break;
    before = localDay(rows[rows.length - 1].completed_at);
  }
  return { actions, days: Math.min(maxMilestoneDays, days.size) };
}
