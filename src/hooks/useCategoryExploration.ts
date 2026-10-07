import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipCompletion } from "../utils/completions";
import type { ProgressData } from "../utils/progress";
import { exploredCategories } from "../utils/categoryExploration";
import { fetchExploredTips } from "../completions/categoryExploration";
type Source = { client: SupabaseClient | null; owner: string | null; loading: boolean; busy: boolean; open: boolean;
  guest: { records: TipCompletion[]; readable: boolean }; progress: ProgressData | null };
export function useCategoryExploration({ client, owner, loading, busy, open, guest, progress }: Source) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ owner: string; progress: ProgressData | null; ids: string[] | null; error: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    setResult(null);
    if (!open || !owner || !client || loading || busy) return;
    void fetchExploredTips(client, owner).then(ids => {
      if (active) setResult({ owner, progress, ids, error: false });
    }).catch(() => { if (active) setResult({ owner, progress, ids: null, error: true }); });
    return () => { active = false; };
  }, [client, owner, loading, busy, open, progress, retry]);
  const current = result?.owner === owner && result?.progress === progress ? result : null;
  const ids = !open || loading || busy ? null : owner ? current?.ids ?? null : guest.readable
    ? guest.records.filter(record => Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= Date.now()).map(record => record.tipId) : null;
  return { categories: ids === null ? null : exploredCategories(ids), error: open && !loading && !busy && (owner ? current?.error === true : !guest.readable), retry: () => setRetry(n => n + 1) };
}
