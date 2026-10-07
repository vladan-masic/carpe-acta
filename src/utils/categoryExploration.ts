import { tips } from "../data/tips";
import type { CategoryId } from "../types/tip";
export const explorationCategories = [...new Set(tips.map(tip => tip.categoryId))];
const categoryByTip = new Map<string, CategoryId>(tips.map(tip => [tip.id, tip.categoryId]));
export function exploredCategories(ids: string[]): CategoryId[] {
  const explored = new Set(ids.flatMap(id => { const category = categoryByTip.get(id); return category ? [category] : []; }));
  return explorationCategories.filter(category => explored.has(category));
}
export const explorationTargets = [...new Set([3, 5, 10, explorationCategories.length])].filter(n => n <= explorationCategories.length).sort((a, b) => a - b);
