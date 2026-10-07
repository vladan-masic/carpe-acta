import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TipCompletion } from "../utils/completions";
import type { ProgressData } from "../utils/progress";
import { summarizeMilestones, type MilestoneTotals } from "../utils/milestones";
import { fetchMilestones } from "../completions/milestones";
type Source = { client: SupabaseClient | null; owner: string | null; loading: boolean; busy: boolean;
  guest: { records: TipCompletion[]; readable: boolean }; progress: ProgressData | null };
export function useMilestones({ client, owner, loading, busy, guest, progress }: Source) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ owner: string; progress: ProgressData | null; totals: MilestoneTotals | null; error: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    if (!owner || !client || loading || busy) { setResult(null); return; }
    setResult(null);
    void fetchMilestones(client, owner).then(totals => {
      if (active) setResult({ owner, progress, totals, error: false });
    }).catch(() => { if (active) setResult({ owner, progress, totals: null, error: true }); });
    return () => { active = false; };
  }, [client, owner, loading, busy, progress, retry]);
  const current = result?.owner === owner && result?.progress === progress ? result : null;
  const totals = loading || busy ? null : owner ? current?.totals ?? null : guest.readable ? summarizeMilestones(guest.records) : null;
  const error = !loading && !busy && (owner ? current?.error === true : !guest.readable);
  return { totals, error, retry: () => setRetry(n => n + 1) };
}
