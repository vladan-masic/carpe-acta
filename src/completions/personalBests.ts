import type { SupabaseClient } from "@supabase/supabase-js";
import type { PersonalBest } from "../utils/personalBests";

export async function fetchPersonalBest(client: SupabaseClient, owner: string, now = new Date()): Promise<PersonalBest> {
  const { data, error } = await client.rpc("personal_best_week", {
    p_owner: owner,
    p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    p_until: now.toISOString(),
  });
  if (error) throw error;
  const row = data?.[0];
  const validWeek = typeof row?.week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.week)
    && Number.isFinite(Date.parse(`${row.week}T00:00:00Z`))
    && new Date(`${row.week}T00:00:00Z`).toISOString().slice(0, 10) === row.week
    && new Date(`${row.week}T00:00:00Z`).getUTCDay() === 1;
  if (!row || !Number.isInteger(row.days) || row.days < 0 || row.days > 7 ||
    (row.days === 0 ? row.week !== null : !validWeek)) throw new Error("Invalid personal best");
  return { days: row.days, week: row.week };
}
