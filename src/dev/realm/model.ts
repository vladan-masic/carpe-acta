import { applyReward, initialLedger, type Ledger, type RewardEvent } from './rewards';

export const resources = ['coins', 'wood', 'stone', 'food', 'iron'] as const;
export type Resource = typeof resources[number];
export type Material = Exclude<Resource, 'coins'>;
export type Stock = Record<Resource, number>;
export const buildings = ['hall', 'sawmill', 'quarry', 'farm', 'mine', 'workshop'] as const;
export type Building = typeof buildings[number];
export type Route = 'gather' | 'survey';
export type Reason = 'ready' | 'maximum' | 'hallRequired' | 'workshopRequired' | 'mineRequired' | 'heroRequired' | 'resources' | 'adjustment' | 'explored';
export type Village = { stock: Stock; levels: Record<Building, number>; explored: number };
export type Realm = { village: Village; rewards: Ledger; xp: number; sequence: number; journal: { id: number; kind: 'built' | 'returned'; building?: Building; stage?: number }[] };
export const MAX_LEVEL = 5;
export function initialRealm(): Realm {
  return { village: { stock: { wood: 20, stone: 15, food: 10, iron: 0, coins: 0 },
    levels: { hall: 1, farm: 1, sawmill: 1, quarry: 0, mine: 0, workshop: 0 }, explored: 0 },
    rewards: initialLedger(), xp: 0, sequence: 0, journal: [] };
}
export function reward(state: Realm, event: RewardEvent): Realm {
  const result = applyReward(state.rewards, { coins: state.village.stock.coins, xp: state.xp }, event);
  if (result.ledger === state.rewards) return state;
  return { ...state, rewards: result.ledger, xp: result.wallet.xp, sequence: state.sequence + 1,
    village: { ...state.village, stock: { ...state.village.stock, coins: result.wallet.coins } } };
}
export const canAfford = (stock: Stock, price: Stock) => resources.every(key => stock[key] >= price[key]);
export const subtract = (stock: Stock, price: Stock): Stock => Object.fromEntries(resources.map(key => [key, stock[key] - price[key]])) as Stock;
export function cost(building: Building, target: number): Stock {
  return { coins: 3 * target, wood: (building === 'hall' ? 8 : 5) * target,
    stone: (building === 'hall' ? 6 : 3) * target, food: target * 2, iron: target >= 3 ? (target - 2) * 4 : 0 };
}
export function buildReason(state: Realm, building: Building): Reason {
  const { levels, stock } = state.village, target = levels[building] + 1;
  if (target > MAX_LEVEL) return 'maximum';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if ((building === 'mine' || building === 'workshop') && levels.hall < 2) return 'hallRequired';
  if (building !== 'hall' && target > levels.hall + 1) return 'hallRequired';
  if (target >= 3 && building !== 'workshop' && levels.workshop < target - 2) return 'workshopRequired';
  return canAfford(stock, cost(building, target)) ? 'ready' : 'resources';
}
export function construct(state: Realm, building: Building): Realm {
  if (buildReason(state, building) !== 'ready') return state;
  const target = state.village.levels[building] + 1, sequence = state.sequence + 1;
  return { ...state, sequence, village: { ...state.village, stock: subtract(state.village.stock, cost(building, target)), levels: { ...state.village.levels, [building]: target } },
    journal: [{ id: sequence, kind: 'built' as const, building }, ...state.journal].slice(0, 8) };
}
export const materialBuildings: Record<Material, Building> = { wood: 'sawmill', stone: 'quarry', food: 'farm', iron: 'mine' };
export const SUPPLY_PRICE = 5;
export function supplyAmount(village: Village, material: Material): number {
  return 8 + village.levels[materialBuildings[material]] * 4 + village.levels.workshop * 2 + village.levels.hall - 1;
}
export function supplyReason(state: Realm, material: Material): Reason {
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (material === 'iron' && state.village.levels.mine === 0) return 'mineRequired';
  return state.village.stock.coins >= SUPPLY_PRICE ? 'ready' : 'resources';
}
export function buySupply(state: Realm, material: Material): Realm {
  if (supplyReason(state, material) !== 'ready') return state;
  const stock = state.village.stock;
  return { ...state, village: { ...state.village, stock: { ...stock, coins: stock.coins - SUPPLY_PRICE, [material]: stock[material] + supplyAmount(state.village, material) } } };
}
export function hero(xp: number) {
  return { level: Math.floor(xp / 50) + 1, progress: xp % 50, next: 50 };
}
export const expeditionCost = (stage: number): Stock => ({ coins: 4, food: 8 + stage * 4, wood: 0, stone: 0, iron: stage === 2 ? 4 : 0 });
export function expeditionReward(stage: number, route: Route): Stock {
  return { coins: 0, food: route === 'survey' ? 10 : 0, wood: route === 'gather' ? 12 + stage * 4 : 0,
    stone: route === 'gather' ? 8 + stage * 3 : 0, iron: route === 'survey' ? 4 + stage * 2 : 0 };
}
export function exploreReason(state: Realm): Reason {
  if (state.village.explored >= 3) return 'explored';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (state.village.levels.hall < 2) return 'hallRequired';
  if (hero(state.xp).level < state.village.explored + 2) return 'heroRequired';
  return canAfford(state.village.stock, expeditionCost(state.village.explored)) ? 'ready' : 'resources';
}
export function explore(state: Realm, route: Route): Realm {
  if (exploreReason(state) !== 'ready') return state;
  const stage = state.village.explored, stock = subtract(state.village.stock, expeditionCost(stage));
  const supplies = expeditionReward(stage, route), sequence = state.sequence + 1;
  resources.forEach(key => { stock[key] += supplies[key]; });
  return { ...state, sequence, village: { ...state.village, stock, explored: stage + 1 },
    journal: [{ id: sequence, kind: 'returned' as const, stage: stage + 1 }, ...state.journal].slice(0, 8) };
}
