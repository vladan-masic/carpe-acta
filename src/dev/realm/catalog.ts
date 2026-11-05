import type { Material, Stock } from './model';

export const stock = (values: Partial<Stock>): Stock => ({ coins: 0, wood: 0, stone: 0, food: 0, iron: 0, ...values });
export const researchCatalog = [
  { id: 'foundations', tier: 1, requires: null, cost: stock({ wood: 8, stone: 8 }), branch: 'construction', benefit: 5 },
  { id: 'packing', tier: 2, requires: null, cost: stock({ wood: 8, food: 8 }), branch: 'logistics', benefit: 2 },
  { id: 'trailcraft', tier: 3, requires: null, cost: stock({ food: 12, iron: 4 }), branch: 'exploration', benefit: 4 },
  { id: 'masonry', tier: 4, requires: 'foundations', cost: stock({ stone: 16, iron: 6 }), branch: 'construction', benefit: 5 },
  { id: 'caravans', tier: 5, requires: 'packing', cost: stock({ wood: 16, iron: 8 }), branch: 'logistics', benefit: 2 },
] as const;
export type ResearchId = typeof researchCatalog[number]['id'];
export const destinations = [
  { id: 'meadow', level: 1, hero: 2, forest: 0, cost: stock({ food: 8 }), reward: stock({ wood: 12, food: 4 }) },
  { id: 'river', level: 2, hero: 2, forest: 1, cost: stock({ food: 10, wood: 4 }), reward: stock({ stone: 18 }) },
  { id: 'ridge', level: 3, hero: 3, forest: 1, cost: stock({ food: 12, iron: 2 }), reward: stock({ iron: 14, stone: 8 }) },
  { id: 'orchard', level: 4, hero: 3, forest: 2, cost: stock({ food: 14, wood: 6 }), reward: stock({ food: 30, wood: 8 }) },
  { id: 'pass', level: 5, hero: 4, forest: 3, cost: stock({ food: 16, iron: 4 }), reward: stock({ iron: 18, stone: 16 }) },
] as const;
export type DestinationId = typeof destinations[number]['id'];
export const contracts = [
  { id: 'potter', level: 1, destination: null, cost: stock({ wood: 8 }), reward: stock({ stone: 8 }) },
  { id: 'gardener', level: 2, destination: null, cost: stock({ stone: 8, wood: 4 }), reward: stock({ food: 18 }) },
  { id: 'cartographer', level: 3, destination: 'river', cost: stock({ food: 6 }), reward: stock({ iron: 8 }) },
  { id: 'storyteller', level: 4, destination: null, cost: stock({ food: 4 }), reward: stock({}) },
  { id: 'bridgewright', level: 5, destination: 'pass', cost: stock({ wood: 12, stone: 12 }), reward: stock({ iron: 16 }) },
] as const;
export type ContractId = typeof contracts[number]['id'];
export const tradeMaterials = (level: number): Material[] => level < 1 ? [] : level < 2 ? ['wood', 'stone'] : level < 3 ? ['wood', 'stone', 'food'] : ['wood', 'stone', 'food', 'iron'];
// All materials have the same conservative accounting weight. Every route loses
// at least one unit, even at level 5, so every possible cycle strictly loses value.
export const tradeRate = (level: number) => ({ pay: 6, receive: level >= 5 ? 5 : level >= 4 ? 4 : 3 });
