// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RealmPreview } from '../src/dev/realm/RealmPreview';
import { buildings, buildReason, construct, cost, buySupply, supplyAmount, supplyReason, explore, exploreReason, hero, initialRealm, resources, reward, type Realm } from '../src/dev/realm/model';
import { activities, REWARD_CAP, rewardValues } from '../src/dev/realm/rewards';

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const complete = (state: Realm, activityId = 'sample-task-1') => reward(state, { id: `test-${state.sequence + 1}`, activityId, action: 'complete' });
const undo = (state: Realm, activityId = 'sample-task-1') => reward(state, { id: `test-${state.sequence + 1}`, activityId, action: 'undo' });
function rich() {
  const state = initialRealm();
  state.village.stock = { coins: 10000, wood: 10000, stone: 10000, food: 10000, iron: 10000 };
  state.village.levels.hall = 5; state.village.levels.workshop = 5;
  return state;
}
it.each(['task', 'tip', 'milestone'] as const)('awards fixed coins and XP for %s fixtures, with a unique recorded event', kind => {
  const initial = initialRealm(), activity = activities.find(item => item.kind === kind)!;
  const state = complete(initial, activity.id);
  expect(state.village.stock.coins).toBe(rewardValues[kind].coins);
  expect(state.xp).toBe(rewardValues[kind].xp);
  expect(state.rewards.history[0]).toMatchObject({ id: 'test-1', activityId: activity.id, outcome: 'awarded' });
  expect(initial).toEqual(initialRealm());
});
it('deduplicates both exact event replays and different event IDs for the same active accomplishment', () => {
  const state = complete(initialRealm());
  expect(reward(state, state.rewards.history[0])).toBe(state);
  const duplicate = complete(state);
  expect(duplicate.village.stock).toEqual(state.village.stock); expect(duplicate.xp).toBe(state.xp);
  expect(duplicate.rewards.history[0].outcome).toBe('duplicate');
  const unknown = complete(state, 'invented-task');
  expect(unknown.rewards.history[0].outcome).toBe('unknown'); expect(unknown.xp).toBe(state.xp);
});
it('caps lifetime issuance and never refreshes the cap on undo or recompletion', () => {
  let state = initialRealm();
  activities.forEach(activity => { state = complete(state, activity.id); });
  expect(state.rewards.grossCoins).toBe(REWARD_CAP.coins); expect(state.rewards.grossXP).toBe(REWARD_CAP.xp);
  expect(state.village.stock.coins).toBe(REWARD_CAP.coins); expect(state.xp).toBe(REWARD_CAP.xp);
  const total = state.village.stock.coins;
  for (let i = 0; i < 5; i++) state = complete(undo(state));
  expect(state.village.stock.coins).toBe(total); expect(state.xp).toBe(REWARD_CAP.xp);
  expect(new Set(state.rewards.history.map(event => event.id)).size).toBe(state.rewards.history.length);
});
it('reverses unspent coins and XP once; restoring keeps the same entitlement', () => {
  const awarded = complete(initialRealm()), reversed = undo(awarded);
  expect(reversed.village.stock.coins).toBe(0); expect(reversed.xp).toBe(0); expect(reversed.rewards.adjustment).toBe(0);
  expect(undo(reversed).rewards.history[0].outcome).toBe('inactive');
  const restored = complete(reversed);
  expect(restored.village.stock.coins).toBe(20); expect(restored.rewards.grossCoins).toBe(20);
});
it('records spent rewards as adjustment, blocks spending and reconciles restoration without resource farming', () => {
  let state = complete(initialRealm());
  state = buySupply(state, 'wood'); state = construct(state, 'quarry');
  const wood = state.village.stock.wood, quarry = state.village.levels.quarry;
  state = undo(state);
  expect(state.rewards.adjustment).toBe(8); expect(state.village.stock.coins).toBe(0); expect(state.xp).toBe(0);
  expect(state.village.levels.quarry).toBe(quarry); expect(state.village.stock.wood).toBe(wood);
  expect(buySupply(state, 'food')).toBe(state); expect(construct(state, 'hall')).toBe(state);
  expect(explore(state, 'gather')).toBe(state);
  state = complete(state);
  expect(state.rewards.adjustment).toBe(0); expect(state.village.stock.coins).toBe(12);
  for (let i = 0; i < 4; i++) state = complete(undo(state));
  expect(state.village.stock.coins).toBe(12); expect(state.village.stock.wood).toBe(wood);
});
it('applies new rewards to an outstanding adjustment before making coins spendable', () => {
  let state = complete(initialRealm());
  for (let i = 0; i < 4; i++) state = buySupply(state, 'wood');
  state = undo(state); expect(state.rewards.adjustment).toBe(20);
  state = complete(state, 'sample-tip-1');
  expect(state.rewards.adjustment).toBe(12); expect(state.village.stock.coins).toBe(0);
  state = complete(state, 'sample-task-2');
  expect(state.rewards.adjustment).toBe(0); expect(state.village.stock.coins).toBe(8);
});
it('has all five resources and supports paid supplies without passive gain or purchase XP', () => {
  expect(resources).toEqual(['coins', 'wood', 'stone', 'food', 'iron']);
  let state = complete(initialRealm());
  expect(supplyReason(state, 'iron')).toBe('mineRequired');
  state.village.levels.mine = 1;
  for (const material of ['wood', 'stone', 'food', 'iron'] as const) {
    const before = state, amount = supplyAmount(state.village, material);
    state = buySupply(state, material);
    expect(state.village.stock[material]).toBe(before.village.stock[material] + amount);
    expect(state.village.stock.coins).toBe(before.village.stock.coins - 5);
    expect(state.xp).toBe(before.xp);
  }
  expect(buySupply(state, 'wood')).toBe(state);
});
it.each(buildings)('constructs/upgrades %s with exact costs and enforces the level cap', building => {
  let state = rich(); state.village.levels[building] = building === 'hall' ? 1 : 0;
  for (let level = state.village.levels[building] + 1; level <= 5; level++) {
    const before = state; state = construct(state, building);
    expect(state.village.levels[building]).toBe(level);
    resources.forEach(key => expect(state.village.stock[key]).toBe(before.village.stock[key] - cost(building, level)[key]));
    expect(state.xp).toBe(before.xp);
  }
  expect(buildReason(state, building)).toBe('maximum'); expect(construct(state, building)).toBe(state);
});
it('enforces Hall/Workshop gates and insufficient-resource handling; upgrades improve supply value', () => {
  const state = initialRealm();
  expect(buildReason(state, 'mine')).toBe('hallRequired'); expect(buildReason(state, 'hall')).toBe('resources');
  expect(construct(state, 'hall')).toBe(state);
  state.village.levels.hall = 3; state.village.levels.farm = 2;
  expect(buildReason(state, 'farm')).toBe('workshopRequired');
  const upgraded = rich(); upgraded.village.levels.farm = 1;
  expect(supplyAmount(construct(upgraded, 'farm').village, 'food')).toBe(supplyAmount(upgraded.village, 'food') + 4);
});
it('requires earned hero levels for three one-time expeditions and pays no coins or XP', () => {
  let state = rich(); state.village.levels.hall = 1;
  expect(exploreReason(state)).toBe('hallRequired');
  state.village.levels.hall = 2;
  expect(exploreReason(state)).toBe('heroRequired');
  state.xp = 150;
  for (let stage = 0; stage < 3; stage++) {
    const before = state; state = explore(state, stage === 1 ? 'survey' : 'gather');
    expect(state.village.explored).toBe(stage + 1); expect(state.xp).toBe(before.xp);
    expect(state.village.stock.coins).toBe(before.village.stock.coins - 4);
  }
  expect(exploreReason(state)).toBe('explored'); expect(explore(state, 'gather')).toBe(state);
  expect(hero(120)).toEqual({ level: 3, progress: 20, next: 50 });
});
it('relocks future exploration after XP reversal without deleting visited stages', () => {
  let state = initialRealm(); state.village.levels.hall = 2;
  state = complete(complete(complete(state), 'sample-task-2'), 'sample-task-3');
  state = explore(state, 'gather'); expect(state.village.explored).toBe(1);
  state = undo(state); expect(state.village.explored).toBe(1); expect(exploreReason(state)).toBe('heroRequired');
});
it('runs the UI simulator, selection, duplicate/reopen, purchases, localization and theme without writes', async () => {
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1; });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const write = vi.spyOn(Storage.prototype, 'setItem'), fetch = vi.spyOn(globalThis, 'fetch');
  render(<RealmPreview/>);
  expect(screen.queryByRole('button', { name: /Advance 1 hour/ })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Complete', exact: true }));
  expect(screen.getByRole('status').textContent).toBe('Reward awarded');
  fireEvent.click(screen.getByRole('button', { name: 'Replay last event' }));
  expect(screen.getByRole('status').textContent).toBe('Duplicate ignored');
  const plot = screen.getByRole('button', { name: 'Quarry, Open plot' });
  // Native buttons support keyboard activation; focus moves into the selected details.
  plot.focus(); await act(async () => fireEvent.click(plot));
  expect(document.activeElement?.id).toBe('realm-detail-heading');
  fireEvent.click(screen.getByRole('button', { name: 'Construct', exact: true }));
  expect(screen.getByRole('button', { name: 'Quarry, Level 1' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Buy Wood' }));
  fireEvent.click(screen.getByRole('button', { name: 'Undo / reopen' }));
  expect(screen.getByText('Coin adjustment: 8')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Complete', exact: true }));
  expect(screen.getByRole('status').textContent).toBe('Original reward restored');
  fireEvent.change(screen.getByRole('combobox', { name: 'Theme' }), { target: { value: 'dark' } });
  expect(document.documentElement.dataset.theme).toBe('dark');
  fireEvent.click(screen.getByRole('button', { name: 'Language: English' }));
  fireEvent.click(screen.getByRole('option', { name: 'Srpski' }));
  expect(screen.getByRole('button', { name: 'Kupi gvožđe' })).toBeTruthy();
  expect(screen.queryByText('Iron', { exact: true })).toBeNull();
  expect(write).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
});
