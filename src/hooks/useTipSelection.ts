import { useState } from "react";
import { tips } from "../data/tips";
import { getStartingTips, type StartBarrier, type StartTimeBudget } from "../data/startBarriers";
import { getRandomTip } from "../utils/tips";
import type { CategoryFilterValue } from "../components/CategoryFilter";
import type { Tip } from "../types/tip";

type Selection = {
  activeTip: Tip;
  category: CategoryFilterValue;
  helping: boolean;
  barrier: StartBarrier | null;
  timeBudget: StartTimeBudget | null;
  smallerThan: number | null;
};
const guidedDefaults = { barrier: null, timeBudget: null, smallerThan: null };

function categoryPool(category: CategoryFilterValue) {
  return category === "all" ? tips : tips.filter((tip) => tip.categoryId === category);
}
function startingPool(selection: Selection) {
  if (!selection.barrier) return [];
  return getStartingTips(tips, selection.barrier, selection.timeBudget ?? 5)
    .filter((tip) => selection.smallerThan === null || tip.effortMinutes < selection.smallerThan);
}
function suggest(selection: Selection): Selection {
  const pool = selection.helping ? startingPool(selection) : categoryPool(selection.category);
  // Keep the previous tip internally, but never display it for an empty guided pool.
  return pool.length ? { ...selection, activeTip: getRandomTip(pool, selection.activeTip.id) } : selection;
}

export function useTipSelection() {
  const [selection, setSelection] = useState<Selection>(() => ({
    activeTip: getRandomTip(tips), category: "all", helping: false, ...guidedDefaults,
  }));
  const pool = startingPool(selection);
  const hasSuggestion = !selection.helping || pool.some((tip) => tip.id === selection.activeTip.id);
  const canGoSmaller = selection.helping && hasSuggestion && pool.some((tip) => tip.effortMinutes < selection.activeTip.effortMinutes);
  return {
    ...selection, hasSuggestion, canGoSmaller,
    generate: () => setSelection(suggest),
    selectCategory: (category: CategoryFilterValue) => setSelection({
      category, activeTip: getRandomTip(categoryPool(category)), helping: false, ...guidedDefaults,
    }),
    selectBarrier: (barrier: StartBarrier) => setSelection((current) => suggest({
      ...current, helping: true, barrier, smallerThan: null,
    })),
    selectTimeBudget: (timeBudget: StartTimeBudget | null) => setSelection((current) => suggest({
      ...current, timeBudget, smallerThan: null,
    })),
    smaller: () => setSelection((current) => {
      if (!current.helping || !startingPool(current).some((tip) => tip.effortMinutes < current.activeTip.effortMinutes)) return current;
      return suggest({ ...current, smallerThan: current.activeTip.effortMinutes });
    }),
    start: () => setSelection((current) => ({ ...current, helping: true, ...guidedDefaults })),
    leave: () => setSelection((current) => suggest({ ...current, helping: false, ...guidedDefaults })),
    openTip: (tip: Tip) => setSelection({ activeTip: tip, category: tip.categoryId, helping: false, ...guidedDefaults }),
  };
}
