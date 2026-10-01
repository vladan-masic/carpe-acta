import type { CategoryId } from "../types/tipMetadata";
import type { Tip } from "../types/tip";

// These are navigation choices, not a diagnosis or a new tip taxonomy.
export const startBarriers = {
  energy: ["low-energy"],
  overwhelm: ["overwhelm"],
  fear: ["fear-anxiety"],
  uncertainty: ["planning", "overthinking"],
  perfectionism: ["perfectionism"],
  distraction: ["focus", "digital-distraction", "dopamine"],
  motivation: ["low-motivation"],
  unsure: ["starting"],
} as const satisfies Record<string, readonly CategoryId[]>;
export type StartBarrier = keyof typeof startBarriers;
export const startBarrierIds = Object.keys(startBarriers) as StartBarrier[];

export const startTimeBudgets = [1, 2, 5] as const;
export type StartTimeBudget = typeof startTimeBudgets[number];

export function getStartingTips(catalog: readonly Tip[], barrier: StartBarrier, maxMinutes = 5): Tip[] {
  const categories: readonly CategoryId[] = startBarriers[barrier];
  return catalog.filter((tip) => categories.includes(tip.categoryId) && tip.effortMinutes <= maxMinutes);
}
