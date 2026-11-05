import { contracts, destinations, researchCatalog } from '../../src/dev/realm/catalog';
import { buildings, buildReason, buySupply, completeContract, construct, cost, destinationCost, expeditionCost, explore, hallUnlock, initialRealm, research, reward, supplyReason, visitDestination, type Building, type Material, type Stock } from '../../src/dev/realm/model';
import { activities, REWARD_CAP } from '../../src/dev/realm/rewards';
/** Executable balance evidence. No production imports, persistence or stock injection. */
export function simulateRealm(earlyResearch: boolean) {
  let state = initialRealm(), purchases = 0, constructions = 0;
  let tenBuilt: { spent: number; purchases: number; levels: typeof state.village.levels } | null = null;
  const trace: { action: string; id: string }[] = [];
  for (const activity of activities) { state = reward(state, { id: activity.id, activityId: activity.id, action: 'complete' }); trace.push({ action: 'reward', id: activity.id }); }
  const fund = (price: Stock) => {
    for (const material of ['wood', 'stone', 'food', 'iron'] as Material[]) while (state.village.stock[material] < price[material]) {
      if (supplyReason(state, material) !== 'ready') throw new Error(`Cannot fund ${material}`);
      state = buySupply(state, material); purchases++; trace.push({ action: 'supply', id: material });
    }
    if (state.village.stock.coins < price.coins) throw new Error('Coin budget exhausted');
  };
  const build = (id: Building) => {
    fund(cost(id, state.village.levels[id] + 1, state.village));
    if (buildReason(state, id) !== 'ready') throw new Error(`Cannot build ${id}: ${buildReason(state, id)}`);
    state = construct(state, id); constructions++; trace.push({ action: 'build', id });
    if (!tenBuilt && buildings.every(id => state.village.levels[id] > 0)) tenBuilt = { spent: REWARD_CAP.coins - state.village.stock.coins, purchases, levels: { ...state.village.levels } };
  };
  const learn = () => { for (const item of researchCatalog) if (!state.village.research.includes(item.id) && state.village.levels.academy >= item.tier) {
    fund(item.cost); const next = research(state, item.id); if (next === state) throw new Error(`Cannot research ${item.id}`); state = next; trace.push({ action: 'research', id: item.id });
  } };
  build('hall'); build('workshop'); build('mine');
  for (let hall = 2; hall <= 5; hall++) {
    if (hall > 2) build('hall');
    for (const id of buildings.filter(id => id !== 'hall')) if (hallUnlock[id] <= hall) {
      while (state.village.levels[id] < hall) build(id);
      if (earlyResearch) learn();
    }
  }
  learn();
  for (let stage = 0; stage < 3; stage++) { fund(expeditionCost(stage)); state = explore(state, 'gather'); trace.push({ action: 'forest', id: String(stage) }); }
  for (const item of destinations) { fund(destinationCost(state, item.id)); state = visitDestination(state, item.id); trace.push({ action: 'destination', id: item.id }); }
  for (const item of contracts) { fund(item.cost); state = completeContract(state, item.id); trace.push({ action: 'contract', id: item.id }); }
  return { state, purchases, constructions, tenBuilt, trace };
}
