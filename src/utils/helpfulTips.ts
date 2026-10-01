import type { TipCompletion } from "./completions";

export type HelpfulTip = {
  tipId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  lastHelpfulAt: string;
  latest: { helpful: boolean; completedAt: string };
};

export function summarizeHelpfulTips(records: TipCompletion[], now = new Date()): HelpfulTip[] {
  const grouped = new Map<string, HelpfulTip>();
  const rated = [...new Map(records.map((record) => [record.id, record])).values()]
    .filter((record) => typeof record.feedback === "boolean" && Number.isFinite(Date.parse(record.completedAt)) && Date.parse(record.completedAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt) || a.id.localeCompare(b.id));
  for (const record of rated) {
    const entry = grouped.get(record.tipId) ?? {
      tipId: record.tipId, helpfulCount: 0, notHelpfulCount: 0, lastHelpfulAt: "",
      latest: { helpful: record.feedback!, completedAt: record.completedAt },
    };
    if (record.feedback) {
      entry.helpfulCount++;
      if (!entry.lastHelpfulAt) entry.lastHelpfulAt = record.completedAt;
    } else entry.notHelpfulCount++;
    grouped.set(record.tipId, entry);
  }
  // Recency, not an effectiveness ranking. Keep mixed feedback visible.
  return [...grouped.values()].filter((entry) => entry.helpfulCount > 0)
    .sort((a, b) => Date.parse(b.lastHelpfulAt) - Date.parse(a.lastHelpfulAt) || a.tipId.localeCompare(b.tipId));
}
