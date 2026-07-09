import type { Tip } from "../types/tip";

export function getRandomTip(tips: Tip[], excludedTipId?: string): Tip {
  if (tips.length === 0) {
    throw new Error("Cannot choose a random tip from an empty list.");
  }

  const availableTips =
    tips.length > 1 && excludedTipId
      ? tips.filter((tip) => tip.id !== excludedTipId)
      : tips;

  return availableTips[Math.floor(Math.random() * availableTips.length)];
}

export function getDailyQuest(tips: Tip[], date = new Date()): Tip {
  if (tips.length === 0) {
    throw new Error("Cannot choose a daily quest from an empty list.");
  }

  const daySeed = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      86_400_000,
  );

  return tips[daySeed % tips.length];
}
