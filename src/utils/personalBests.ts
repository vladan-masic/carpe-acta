import type { TipCompletion } from "./completions";

export type PersonalBest = { days: number; week: string | null };

// Local calendar dates avoid UTC and DST shifts at week boundaries.
function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function summarizePersonalBest(records: TipCompletion[], now = new Date()): PersonalBest {
  const weeks = new Map<string, Set<string>>();
  const unique = new Map(records.map(record => [record.id, record]));
  for (const record of unique.values()) {
    const date = new Date(record.completedAt);
    if (!Number.isFinite(date.getTime()) || date > now) continue;
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - (date.getDay() + 6) % 7);
    const week = dateKey(monday);
    const days = weeks.get(week) ?? new Set<string>();
    days.add(dateKey(date));
    weeks.set(week, days);
  }
  let best: PersonalBest = { days: 0, week: null };
  for (const [week, days] of weeks) {
    if (days.size > best.days || (days.size === best.days && week < best.week!)) {
      best = { days: days.size, week };
    }
  }
  return best;
}
