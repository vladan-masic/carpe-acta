import type { CategoryId, LocalizedTip } from "../types/tip";

// Accept Serbian Latin searches both with and without diacritics.
function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "dj");
}

export function filterLibraryTips(
  tips: readonly LocalizedTip[], query: string, category: "all" | CategoryId, maxEffort: number | null,
) {
  const words = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  return tips.filter((tip) => {
    if (category !== "all" && tip.categoryId !== category) return false;
    if (maxEffort !== null && tip.effortMinutes > maxEffort) return false;
    const text = normalizeSearch(`${tip.title} ${tip.text} ${tip.action}`);
    return words.every((word) => text.includes(word));
  });
}
