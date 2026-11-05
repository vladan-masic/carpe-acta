import { simulateRealm } from './helpers/realmSimulation';
import { describe, expect, it } from 'vitest';
import { contracts, destinations, researchCatalog, stock, tradeMaterials, tradeRate } from '../src/dev/realm/catalog';
import { buildings, buildReason, buySupply, completeContract, construct, contractReason, cost, destinationCost, destinationReason, explore, hallUnlock, initialRealm, research, researchReason, resources, reward, supplyAmount, supplyReason, trade, tradeQuote, visitDestination, type Material, type Stock } from '../src/dev/realm/model';
import { activities, REWARD_CAP } from '../src/dev/realm/rewards';
import { placements } from '../src/dev/realm/placement';
function unlocked() {
  const state = initialRealm();
  buildings.forEach(id => { state.village.levels[id] = 5; });
  state.village.stock = stock({ coins: 1000, wood: 1000, stone: 1000, food: 1000, iron: 1000 });
  state.xp = 200; state.village.explored = 3;
  return state;
}
const materials: Material[] = ['wood', 'stone', 'food', 'iron'];
const value = (s: Stock) => materials.reduce((sum, key) => sum + s[key], 0);
it('all ten locations have distinct non-overlapping plot reservations and five levels', () => {
  expect(new Set(placements.map(p => p.building))).toEqual(new Set(buildings));
  for (const a of placements) for (const b of placements) if (a !== b) {
    expect(Math.abs(a.x - b.x) >= (a.width + b.width) / 2 || Math.abs(a.y - b.y) >= (a.height + b.height) / 2).toBe(true);
  }
});
it.each(buildings)('enforces availability and advanced Workshop gates for %s', id => {
  const state = unlocked(); state.village.levels[id] = 0;
  if (hallUnlock[id] > 1) {
    state.village.levels.hall = hallUnlock[id] - 1;
    expect(buildReason(state, id)).toBe('hallRequired'); expect(construct(state, id)).toBe(state);
  }
  if (id !== 'workshop' && id !== 'hall') {
    state.village.levels.hall = 5; state.village.levels[id] = 2; state.village.levels.workshop = 0;
    expect(buildReason(state, id)).toBe('workshopRequired');
  }
});
it('preserves initial buildings, Quarry access and basic supplies before construction', () => {
  let state = initialRealm(); state = reward(state, { id: 'one', activityId: activities[0].id, action: 'complete' });
  expect(state.village.levels).toMatchObject({ hall: 1, farm: 1, sawmill: 1, quarry: 0 });
  expect(buildReason(state, 'quarry')).toBe('ready');
  for (const material of materials.slice(0, 3)) expect(supplyReason(state, material)).toBe('ready');
  expect(supplyReason(state, 'iron')).toBe('mineRequired');
});
describe('Marketplace conservation', () => {
  it('rejects locked routes, self trades, insufficient stock and pending adjustments', () => {
    const state = initialRealm(); expect(trade(state, 'wood', 'stone')).toBe(state);
    state.village.levels.marketplace = 1;
    expect(trade(state, 'wood', 'food')).toBe(state); expect(trade(state, 'wood', 'wood')).toBe(state);
    state.village.stock.wood = 5; expect(trade(state, 'wood', 'stone')).toBe(state);
    state.village.stock.wood = 6; state.rewards.adjustment = 1; expect(trade(state, 'wood', 'stone')).toBe(state);
  });
  it('strictly decreases a common value for EVERY route at EVERY level, ruling out all cycles', () => {
    for (let level = 1; level <= 5; level++) for (const from of tradeMaterials(level)) for (const to of tradeMaterials(level)) if (from !== to) {
      const state = unlocked(); state.village.levels.marketplace = level;
      const quote = tradeQuote(state, from, to), next = trade(state, from, to);
      expect(next.village.stock).toEqual(quote.balance);
      expect(value(next.village.stock)).toBe(value(state.village.stock) - tradeRate(level).pay + tradeRate(level).receive);
      expect(value(next.village.stock)).toBeLessThan(value(state.village.stock));
      expect(next.village.stock.coins).toBe(state.village.stock.coins); expect(next.xp).toBe(state.xp); expect(next.rewards).toBe(state.rewards);
    }
  });
  it('cannot profit from repeated triangular cycles', () => {
    let state = unlocked(); const before = state;
    for (let i = 0; i < 100; i++) { state = trade(state, 'wood', 'stone'); state = trade(state, 'stone', 'food'); state = trade(state, 'food', 'wood'); }
    expect(value(state.village.stock)).toBeLessThan(value(before.village.stock));
  });
});
it('applies research exactly once, stacks modest benefits and preserves coin/XP identities', () => {
  let state = unlocked(); const before = state;
  for (const item of researchCatalog) {
    state = research(state, item.id); expect(state.village.research).toContain(item.id); expect(research(state, item.id)).toBe(state);
  }
  expect(state.village.research).toHaveLength(5);
  expect(supplyAmount(state.village, 'wood')).toBe(supplyAmount(before.village, 'wood') + 4);
  expect(cost('hall', 5, state.village)).toEqual(stock({ coins: 15, wood: 36, stone: 27, food: 9, iron: 11 }));
  expect(destinationCost(state, 'meadow').food).toBe(4);
  expect(state.xp).toBe(before.xp); expect(state.village.stock.coins).toBe(before.village.stock.coins); expect(state.rewards).toBe(before.rewards);
});
it('checks research tiers, prerequisites and affordability', () => {
  const state = unlocked(); state.village.levels.academy = 1;
  expect(researchReason(state, 'packing')).toBe('buildingRequired'); expect(research(state, 'packing')).toBe(state);
  state.village.levels.academy = 5; expect(researchReason(state, 'masonry')).toBe('prerequisite');
  state.village.stock = stock({}); expect(researchReason(state, 'foundations')).toBe('resources'); expect(research(state, 'foundations')).toBe(state);
});
it('regional destinations enforce guild, hero and forest gates; outcomes can never be repeated', () => {
  let state = unlocked(); const before = state;
  state.village.levels.guild = 0; expect(destinationReason(state, 'meadow')).toBe('buildingRequired');
  state.village.levels.guild = 5; state.xp = 0; expect(destinationReason(state, 'meadow')).toBe('heroRequired');
  state.xp = 200; state.village.explored = 0; expect(destinationReason(state, 'pass')).toBe('prerequisite');
  state.village.explored = 3;
  for (const item of destinations) { state = visitDestination(state, item.id); expect(visitDestination(state, item.id)).toBe(state); }
  expect(state.village.destinations).toHaveLength(5); expect(state.village.explored).toBe(3);
  expect(state.xp).toBe(before.xp); expect(state.village.stock.coins).toBe(before.village.stock.coins);
  const poor = unlocked(); poor.village.stock = stock({}); expect(visitDestination(poor, 'meadow')).toBe(poor);
});
it('Tavern records every contract once, including a narrative-only visit, and enforces gates', () => {
  let state = unlocked(); state.village.levels.tavern = 0;
  expect(contractReason(state, 'potter')).toBe('buildingRequired'); expect(completeContract(state, 'potter')).toBe(state);
  state.village.levels.tavern = 5; expect(contractReason(state, 'cartographer')).toBe('prerequisite');
  state.village.destinations = destinations.map(item => item.id); const before = state;
  for (const item of contracts) { state = completeContract(state, item.id); expect(completeContract(state, item.id)).toBe(state); }
  expect(state.village.contracts).toHaveLength(5); expect(state.xp).toBe(before.xp); expect(state.village.stock.coins).toBe(before.village.stock.coins);
  const poor = unlocked(); poor.village.stock = stock({}); expect(completeContract(poor, 'potter')).toBe(poor);
});
it('blocks every new spend during reversal debt without replenishing lifetime issuance', () => {
  let state = unlocked(); state.village.stock.coins = 0;
  state = reward(state, { id: 'award', activityId: activities[0].id, action: 'complete' });
  for (let i = 0; i < 16; i++) state = buySupply(state, 'wood');
  state = reward(state, { id: 'undo', activityId: activities[0].id, action: 'undo' });
  expect(state.rewards.adjustment).toBe(80);
  expect(research(state, 'foundations')).toBe(state); expect(visitDestination(state, 'meadow')).toBe(state); expect(completeContract(state, 'potter')).toBe(state); expect(trade(state, 'wood', 'stone')).toBe(state);
  const next = reward(state, { id: 'restore', activityId: activities[0].id, action: 'complete' });
  expect(next.rewards.grossCoins).toBe(80); expect(next.rewards.adjustment).toBe(0); expect(next.village.stock.coins).toBe(0);
});

// Full playthroughs use only fixed rewards and paid supplies, never injected stock.
it.each([false, true])('reaches ten level-5 buildings and every finite activity (early research: %s)', earlyResearch => {
  const { state, constructions, tenBuilt } = simulateRealm(earlyResearch);
  expect(tenBuilt).not.toBeNull(); expect(constructions).toBe(47);
  expect(buildings.every(id => state.village.levels[id] === 5)).toBe(true);
  expect(state.village.research).toHaveLength(5); expect(state.village.destinations).toHaveLength(5); expect(state.village.contracts).toHaveLength(5); expect(state.village.explored).toBe(3);
  expect(state.rewards.grossCoins).toBe(REWARD_CAP.coins); expect(state.rewards.grossXP).toBe(200); expect(state.xp).toBe(200);
  expect(resources.every(key => state.village.stock[key] >= 0)).toBe(true);
  expect(state.village.stock.coins).toBeGreaterThanOrEqual(100);
});
it('keeps the final partial coin entitlement and capped XP unchanged across undo and replay', () => {
  let state = initialRealm();
  activities.forEach(activity => { state = reward(state, { id: activity.id, activityId: activity.id, action: 'complete' }); });
  const activityId = activities.at(-1)!.id, claim = state.rewards.claims[activityId];
  expect(claim).toEqual({ active: true, coins: 12, xp: 0 });
  for (let i = 0; i < 5; i++) {
    state = reward(state, { id: `undo-${i}`, activityId, action: 'undo' });
    state = reward(state, { id: `redo-${i}`, activityId, action: 'complete' });
    expect(state.rewards.grossCoins).toBe(900); expect(state.rewards.grossXP).toBe(200);
    expect(state.village.stock.coins).toBe(900); expect(state.xp).toBe(200);
  }
  expect(reward(state, state.rewards.history[0])).toBe(state);
});
