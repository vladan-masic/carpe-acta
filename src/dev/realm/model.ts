import { contracts, destinations, researchCatalog, stock as makeStock, tradeMaterials, tradeRate, type ContractId, type DestinationId, type ResearchId } from './catalog';
import { applyReward, initialLedger, type Ledger, type RewardEvent } from './rewards';

export const resources = ['coins', 'wood', 'stone', 'food', 'iron'] as const;
export type Resource = typeof resources[number];
export type Material = Exclude<Resource, 'coins'>;
export type Stock = Record<Resource, number>;
export const buildings = ['hall', 'sawmill', 'quarry', 'farm', 'mine', 'workshop', 'marketplace', 'academy', 'guild', 'tavern'] as const;
export type Building = typeof buildings[number];
export type Route = 'gather' | 'survey';
export type Reason = 'ready' | 'maximum' | 'hallRequired' | 'workshopRequired' | 'mineRequired' | 'heroRequired' | 'resources' | 'adjustment' | 'explored' | 'buildingRequired' | 'prerequisite' | 'completed' | 'invalid';
export type Village = { stock: Stock; levels: Record<Building, number>; explored: number; research: ResearchId[]; destinations: DestinationId[]; contracts: ContractId[] };
export type Realm = { village: Village; rewards: Ledger; xp: number; sequence: number; journal: { id: number; kind: 'built' | 'returned'; building?: Building; stage?: number }[] };
export const MAX_LEVEL = 5;
export function initialRealm(): Realm {
  return { village: { stock: { wood: 20, stone: 15, food: 10, iron: 0, coins: 0 },
    levels: { hall: 1, farm: 1, sawmill: 1, quarry: 0, mine: 0, workshop: 0, marketplace: 0, academy: 0, guild: 0, tavern: 0 }, explored: 0, research: [], destinations: [], contracts: [] },
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
export const hallUnlock: Record<Building, number> = { hall: 1, farm: 1, sawmill: 1, quarry: 1, mine: 2, workshop: 2, marketplace: 2, academy: 3, guild: 3, tavern: 4 };
export function cost(building: Building, target: number, village?: Village): Stock {
  const discount = (village?.research.includes('foundations') ? 5 : 0) + (village?.research.includes('masonry') ? 5 : 0);
  const result = { coins: 3 * target, wood: (building === 'hall' ? 8 : 5) * target,
    stone: (building === 'hall' ? 6 : 3) * target, food: target * 2, iron: target >= 3 ? (target - 2) * 4 : 0 };
  for (const material of ['wood', 'stone', 'food', 'iron'] as const) result[material] = Math.ceil(result[material] * (100 - discount) / 100);
  return result;
}
export function buildReason(state: Realm, building: Building): Reason {
  const { levels, stock } = state.village, target = levels[building] + 1;
  if (target > MAX_LEVEL) return 'maximum';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (levels.hall < hallUnlock[building]) return 'hallRequired';
  if (building !== 'hall' && target > levels.hall + 1) return 'hallRequired';
  if (target >= 3 && building !== 'workshop' && levels.workshop < target - 2) return 'workshopRequired';
  return canAfford(stock, cost(building, target, state.village)) ? 'ready' : 'resources';
}
export function construct(state: Realm, building: Building): Realm {
  if (buildReason(state, building) !== 'ready') return state;
  const target = state.village.levels[building] + 1, sequence = state.sequence + 1;
  return { ...state, sequence, village: { ...state.village, stock: subtract(state.village.stock, cost(building, target, state.village)), levels: { ...state.village.levels, [building]: target } },
    journal: [{ id: sequence, kind: 'built' as const, building }, ...state.journal].slice(0, 8) };
}
export const materialBuildings: Record<Material, Building> = { wood: 'sawmill', stone: 'quarry', food: 'farm', iron: 'mine' };
export const SUPPLY_PRICE = 5;
export function supplyAmount(village: Village, material: Material): number {
  return 8 + village.levels[materialBuildings[material]] * 4 + village.levels.workshop * 2 + village.levels.hall - 1 + (village.research.includes('packing') ? 2 : 0) + (village.research.includes('caravans') ? 2 : 0);
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

function exchange(state: Realm, price: Stock, outcome: Stock): Realm {
  const stock = subtract(state.village.stock, price);
  resources.forEach(key => { stock[key] += outcome[key]; });
  return { ...state, village: { ...state.village, stock } };
}
export function tradeQuote(state: Realm, from: Material, to: Material) {
  const level = state.village.levels.marketplace, rate = tradeRate(level);
  const price = makeStock({ [from]: rate.pay }), outcome = makeStock({ [to]: rate.receive });
  let reason: Reason = 'ready';
  if (from === to || !tradeMaterials(level).includes(from) || !tradeMaterials(level).includes(to)) reason = 'buildingRequired';
  else if (state.rewards.adjustment > 0) reason = 'adjustment';
  else if (!canAfford(state.village.stock, price)) reason = 'resources';
  return { price, outcome, reason, balance: reason === 'ready' ? exchange(state, price, outcome).village.stock : null };
}
export function trade(state: Realm, from: Material, to: Material): Realm {
  const quote = tradeQuote(state, from, to);
  return quote.reason === 'ready' ? exchange(state, quote.price, quote.outcome) : state;
}
export function researchReason(state: Realm, id: ResearchId): Reason {
  const item = researchCatalog.find(item => item.id === id);
  if (!item) return 'invalid';
  if (state.village.research.includes(id)) return 'completed';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (state.village.levels.academy < item.tier) return 'buildingRequired';
  if (item.requires && !state.village.research.includes(item.requires)) return 'prerequisite';
  return canAfford(state.village.stock, item.cost) ? 'ready' : 'resources';
}
export function research(state: Realm, id: ResearchId): Realm {
  if (researchReason(state, id) !== 'ready') return state;
  const next = exchange(state, researchCatalog.find(item => item.id === id)!.cost, makeStock({}));
  return { ...next, village: { ...next.village, research: [...next.village.research, id] } };
}
export function destinationCost(state: Realm, id: DestinationId): Stock {
  const price = destinations.find(item => item.id === id)!.cost;
  // Trailcraft affects only the new regional expeditions, never legacy forest progress.
  return { ...price, food: Math.max(0, price.food - (state.village.research.includes('trailcraft') ? 4 : 0)) };
}
export function destinationReason(state: Realm, id: DestinationId): Reason {
  const item = destinations.find(item => item.id === id);
  if (!item) return 'invalid';
  if (state.village.destinations.includes(id)) return 'completed';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (state.village.levels.guild < item.level) return 'buildingRequired';
  if (hero(state.xp).level < item.hero) return 'heroRequired';
  if (state.village.explored < item.forest) return 'prerequisite';
  return canAfford(state.village.stock, destinationCost(state, id)) ? 'ready' : 'resources';
}
export function visitDestination(state: Realm, id: DestinationId): Realm {
  if (destinationReason(state, id) !== 'ready') return state;
  const next = exchange(state, destinationCost(state, id), destinations.find(item => item.id === id)!.reward);
  return { ...next, village: { ...next.village, destinations: [...next.village.destinations, id] } };
}
export function contractReason(state: Realm, id: ContractId): Reason {
  const item = contracts.find(item => item.id === id);
  if (!item) return 'invalid';
  if (state.village.contracts.includes(id)) return 'completed';
  if (state.rewards.adjustment > 0) return 'adjustment';
  if (state.village.levels.tavern < item.level) return 'buildingRequired';
  if (item.destination && !state.village.destinations.includes(item.destination)) return 'prerequisite';
  return canAfford(state.village.stock, item.cost) ? 'ready' : 'resources';
}
export function completeContract(state: Realm, id: ContractId): Realm {
  if (contractReason(state, id) !== 'ready') return state;
  const item = contracts.find(item => item.id === id)!;
  const next = exchange(state, item.cost, item.reward);
  return { ...next, village: { ...next.village, contracts: [...next.village.contracts, id] } };
}
