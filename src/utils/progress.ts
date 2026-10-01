import { summarizeHelpfulTips, type HelpfulTip } from "./helpfulTips";
import type { TipCompletion } from "./completions";

export const recentCompletionLimit = 10;
export type ProgressData = {
  days: { date: string; count: number }[];
  recent: TipCompletion[];
  helpful: HelpfulTip[];
};

// Calendar arithmetic uses the device's local timezone, including DST changes.
export function progressDays(now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
    return { date: date.toISOString(), count: 0 };
  });
}
export function summarizeProgress(records: TipCompletion[], now = new Date()): ProgressData {
  const days = progressDays(now);
  const unique = [...new Map(records.map((record) => [record.id, record])).values()]
    .filter((record) => Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= now.getTime());
  for (const record of unique) {
    const date = new Date(record.completedAt);
    const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    const day = days.find((entry) => entry.date === midnight);
    if (day) day.count += 1;
  }
  const recent = unique.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || a.id.localeCompare(b.id))
    .slice(0, recentCompletionLimit);
  return { days, recent, helpful: summarizeHelpfulTips(unique, now) };
}
