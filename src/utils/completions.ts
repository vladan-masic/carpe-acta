export type TipCompletion = {
  id: string;
  tipId: string;
  completedAt: string;
};

export const completionStorageKey = "carpe-acta-completions-v1";

function isCompletion(value: unknown): value is TipCompletion {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" && record.id.length > 0 &&
    typeof record.tipId === "string" && record.tipId.length > 0 &&
    typeof record.completedAt === "string" &&
    Number.isFinite(Date.parse(record.completedAt))
  );
}

// Read at the time of each write so other visits' completions are retained.
// Invalid or inaccessible storage is left untouched, never replaced with [].
export function saveCompletion(completion: TipCompletion): boolean {
  try {
    const storage = window.localStorage;
    const raw = storage.getItem(completionStorageKey);
    const records: unknown = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(records) || !records.every(isCompletion)) return false;
    if (records.some((record) => record.id === completion.id)) return true;
    storage.setItem(completionStorageKey, JSON.stringify([...records, completion]));
    return true;
  } catch {
    return false;
  }
}
