import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CalendarDay } from "../utils/progress";
import { syncGuestAchievements, weekKey, weeklyAchievementPrefix, type WeeklyAchievement } from "../utils/weeklyAchievements";
import { syncAccountAchievements } from "../completions/weeklyAchievements";
export function useWeeklyAchievements(client: SupabaseClient | null, owner: string | null, target: number, ready: boolean, days: CalendarDay[]) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ records: WeeklyAchievement[]; error: boolean } | null>(null);
  const week = weekKey();
  const activity = days.filter(day => weekKey(new Date(day.date)) === week).map(day => `${day.date}:${day.count}`).join("|");
  useEffect(() => {
    const refresh = () => setRevision(n => n + 1);
    const storage = (event: StorageEvent) => { if (event.key === null || event.key.startsWith(weeklyAchievementPrefix)) refresh(); };
    const visible = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visible);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", storage); document.removeEventListener("visibilitychange", visible); };
  }, []);
  useEffect(() => {
    let active = true;
    setResult(null);
    if (!ready) return;
    async function sync() {
      try {
        if (owner && !client) throw new Error("Account unavailable");
        const records = owner ? await syncAccountAchievements(client!, owner) : syncGuestAchievements(target, days);
        if (active) setResult({ records, error: false });
      } catch { if (active) setResult({ records: [], error: true }); }
    }
    void sync();
    return () => { active = false; };
    // The primitive activity signature avoids re-reading on unrelated renders.
  }, [client, owner, target, ready, week, activity, revision]);
  return { records: ready ? result?.records ?? null : null, error: result?.error ?? false, retry: () => setRevision(n => n + 1) };
}
