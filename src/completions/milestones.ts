import type { SupabaseClient } from "@supabase/supabase-js";
import type { MilestoneTotals } from "../utils/milestones";

// One aggregate response, regardless of history length. The database enforces
// the authenticated owner and uses the calendar's device timezone.
export async function fetchMilestones(client: SupabaseClient, owner: string, now = new Date()): Promise<MilestoneTotals> {
  const { data, error } = await client.rpc("milestone_totals", {
    p_owner: owner, p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, p_until: now.toISOString(),
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row || !Number.isSafeInteger(row.actions) || row.actions < 0 ||
    !Number.isSafeInteger(row.days) || row.days < 0 || row.days > row.actions) throw new Error("Invalid milestone totals");
  return { actions: row.actions, days: row.days };
}
