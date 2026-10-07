import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export const weeklyGoalKey = "carpe-acta-weekly-goal-v1";
const metadataKey = "weekly_goal_days";
export function validGoal(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 7 ? value : 0;
}
function readGuest() {
  try { return validGoal(JSON.parse(localStorage.getItem(weeklyGoalKey) ?? "0")); }
  catch { return 0; }
}

// Mount a separate instance per account. Guest preferences are never imported implicitly.
export function useWeeklyGoal(client: SupabaseClient | null, owner: string | null) {
  const [target, setTarget] = useState(owner ? 0 : readGuest);
  const [loading, setLoading] = useState(!!owner);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const alive = useRef(false);
  const request = useRef(0);
  const writing = useRef(false);

  useEffect(() => {
    alive.current = true;
    async function refresh() {
      if (writing.current) return;
      if (!owner) { setTarget(readGuest()); return; }
      if (!client) { setError(true); setLoading(false); return; }
      const version = ++request.current;
      try {
        const { data, error } = await client.auth.getUser();
        if (!alive.current || version !== request.current) return;
        if (error || data.user?.id !== owner) throw new Error("Unavailable goal");
        setTarget(validGoal(data.user.user_metadata[metadataKey]));
        setError(false);
      } catch { if (alive.current && version === request.current) setError(true); }
      finally { if (alive.current && version === request.current) setLoading(false); }
    }
    void refresh();
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    const storage = (event: StorageEvent) => { if (!owner && (event.key === weeklyGoalKey || event.key === null)) void refresh(); };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", storage);
    document.addEventListener("visibilitychange", visible);
    return () => {
      alive.current = false; request.current++;
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", storage);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [client, owner]);

  async function save(value: number) {
    if (writing.current || loading) return;
    const next = validGoal(value);
    const version = ++request.current;
    writing.current = true; setSaving(true); setError(false);
    try {
      if (owner) {
        if (!client) throw new Error("Unavailable account");
        const { data, error } = await client.auth.updateUser({ data: { [metadataKey]: next } });
        if (error || data.user?.id !== owner) throw new Error("Unsaved goal");
      } else localStorage.setItem(weeklyGoalKey, JSON.stringify(next));
      if (alive.current && version === request.current) setTarget(next);
    } catch { if (alive.current && version === request.current) setError(true); }
    finally {
      writing.current = false;
      if (alive.current && version === request.current) setSaving(false);
    }
  }
  return { target, loading, saving, error, save };
}
