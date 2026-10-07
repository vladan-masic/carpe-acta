import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchCalendarYear } from "../completions/api";
import type { TipCompletion } from "../utils/completions";
import { summarizeYear, type CalendarDay, type ProgressData } from "../utils/progress";

type Source = { client: SupabaseClient | null; owner: string | null; loading: boolean;
  guest: { records: TipCompletion[]; readable: boolean }; progress: ProgressData | null; busy: boolean };
export function useCalendarHistory({ client, owner, loading, guest, progress, busy }: Source) {
  const [year, setYear] = useState<number | null>(null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ owner: string; year: number; progress: ProgressData | null; days: CalendarDay[] | null; error: boolean } | null>(null);
  useEffect(() => {
    let active = true;
    if (year === null || !owner || !client || loading || busy) { setResult(null); return; }
    setResult(null);
    void fetchCalendarYear(client, owner, year).then(records => {
      if (active) setResult({ owner, year, progress, days: summarizeYear(records, year), error: false });
    }).catch(() => {
      if (active) setResult({ owner, year, progress, days: null, error: true });
    });
    return () => { active = false; };
  }, [year, owner, client, loading, busy, progress, retry]);
  // Never label a previous owner/year/snapshot as the newly selected history.
  const current = result?.owner === owner && result?.year === year && result?.progress === progress ? result : null;
  const days = year === null || loading ? null : !owner
    ? guest.readable ? summarizeYear(guest.records, year) : null
    : busy ? null : current?.days ?? null;
  const error = !loading && year !== null && (!owner ? !guest.readable : !busy && current?.error === true);
  return { year, setYear, days, error, loading: year !== null && !days && !error, retry: () => setRetry(value => value + 1) };
}
export type CalendarHistory = ReturnType<typeof useCalendarHistory>;
