import type { TipCompletion } from "./completions";
export const actionMilestones = [1, 10, 50, 100, 250, 500, 1000] as const;
export const dayMilestones = [1, 7, 25, 50, 100, 180, 365] as const;
export type MilestoneKind = "actions" | "days";
export function milestoneThresholds(kind: MilestoneKind, total: number): number[] {
  const base = kind === "actions" ? actionMilestones : dayMilestones;
  const interval = kind === "actions" ? 500 : 100;
  const thresholds: number[] = [...base];
  const last = base[base.length - 1];
  for (let next = last + interval; next <= total + interval; next += interval) thresholds.push(next);
  return thresholds;
}
// Keep earned badges and just the next target visible, even in the collection.
export function visibleMilestones(thresholds: readonly number[], total: number) {
  const next = thresholds.find(n => n > total);
  return thresholds.filter(n => n <= total || n === next);
}
export type MilestoneTotals = { actions: number; days: number };
export function localDay(timestamp: string) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}
export function summarizeMilestones(records: TipCompletion[], now = new Date()): MilestoneTotals {
  const valid = [...new Map(records.map(record => [record.id, record])).values()]
    .filter(record => Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= now.getTime());
  return { actions: valid.length, days: new Set(valid.map(record => localDay(record.completedAt))).size };
}
export function earnedMilestones(totals: MilestoneTotals) {
  return [...milestoneThresholds("actions", totals.actions).filter(n => totals.actions >= n).map(n => `actions-${n}`),
    ...milestoneThresholds("days", totals.days).filter(n => totals.days >= n).map(n => `days-${n}`)];
}
