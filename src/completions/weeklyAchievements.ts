import type { SupabaseClient } from "@supabase/supabase-js";
import type { WeeklyAchievement } from "../utils/weeklyAchievements";
export async function syncAccountAchievements(client: SupabaseClient, owner: string): Promise<WeeklyAchievement[]> {
  const { error } = await client.rpc("sync_weekly_achievement", { p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
  if (error) throw error;
  const records: WeeklyAchievement[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("weekly_achievements")
      .select("week_start,target_days,timezone,achieved_at").eq("user_id", owner)
      .order("week_start", { ascending: false }).range(offset, offset + 499);
    if (error) throw error;
    const rows = data ?? [];
    records.push(...rows.map(row => ({ week: row.week_start, target: row.target_days, timezone: row.timezone, achievedAt: row.achieved_at })));
    if (rows.length < 500) return records;
  }
}
