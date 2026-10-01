import { useState } from "react";
import { tips } from "../data/tips";
import { getStartingTips, type StartBarrier } from "../data/startBarriers";
import { getRandomTip } from "../utils/tips";
import type { CategoryFilterValue } from "../components/CategoryFilter";
import type { Tip } from "../types/tip";

type Selection = { activeTip: Tip; category: CategoryFilterValue; helping: boolean; barrier: StartBarrier | null };
export function useTipSelection() {
  const [selection, setSelection] = useState<Selection>(() => ({ activeTip: getRandomTip(tips), category: "all", helping: false, barrier: null }));
  function categoryPool(category: CategoryFilterValue) {
    return category === "all" ? tips : tips.filter((tip) => tip.categoryId === category);
  }
  return {
    ...selection,
    generate: () => setSelection((current) => {
      if (current.helping && !current.barrier) return current;
      const pool = current.helping && current.barrier ? getStartingTips(tips, current.barrier) : categoryPool(current.category);
      return { ...current, activeTip: getRandomTip(pool, current.activeTip.id) };
    }),
    selectCategory: (category: CategoryFilterValue) => setSelection({ category, activeTip: getRandomTip(categoryPool(category)), helping: false, barrier: null }),
    selectBarrier: (barrier: StartBarrier) => setSelection((current) => ({ ...current, helping: true, barrier, activeTip: getRandomTip(getStartingTips(tips, barrier), current.activeTip.id) })),
    start: () => setSelection((current) => ({ ...current, helping: true, barrier: null })),
    leave: () => setSelection((current) => ({ ...current, helping: false, barrier: null, activeTip: getRandomTip(categoryPool(current.category), current.activeTip.id) })),
    openTip: (tip: Tip) => setSelection({ activeTip: tip, category: tip.categoryId, helping: false, barrier: null }),
  };
}
