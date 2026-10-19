/** Prototype-only activity fixtures. Never imports actual tasks, tips, or accounts. */
export type ActivityKind = 'task' | 'tip' | 'milestone';
export type Activity = { id: string; kind: ActivityKind; index: number };
export const activities: Activity[] = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: `sample-task-${i + 1}`, kind: 'task' as const, index: i })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `sample-tip-${i + 1}`, kind: 'tip' as const, index: i })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `sample-milestone-${i + 1}`, kind: 'milestone' as const, index: i })),
];
export const rewardValues = { task: { coins: 20, xp: 20 }, tip: { coins: 8, xp: 10 }, milestone: { coins: 30, xp: 35 } };
export const REWARD_CAP = { coins: 200, xp: 200 };
export type RewardEvent = { id: string; activityId: string; action: 'complete' | 'undo' };
export type RewardOutcome = 'awarded' | 'restored' | 'reversed' | 'duplicate' | 'inactive' | 'unknown' | 'capped';
export type Claim = { active: boolean; coins: number; xp: number };
export type RewardRecord = RewardEvent & { outcome: RewardOutcome; coins: number; xp: number };
export type Ledger = {
  claims: Record<string, Claim>; history: RewardRecord[];
  grossCoins: number; grossXP: number; adjustment: number;
};
export const initialLedger = (): Ledger => ({ claims: {}, history: [], grossCoins: 0, grossXP: 0, adjustment: 0 });
export type Wallet = { coins: number; xp: number };
export function applyReward(ledger: Ledger, wallet: Wallet, event: RewardEvent): { ledger: Ledger; wallet: Wallet; outcome: RewardOutcome } {
  // Exact replay has no effect, including no extra history row.
  if (ledger.history.some(row => row.id === event.id)) return { ledger, wallet, outcome: 'duplicate' };
  const activity = activities.find(item => item.id === event.activityId);
  const claim = ledger.claims[event.activityId];
  let outcome: RewardOutcome = 'unknown', coins = 0, xp = 0;
  const next = { ...ledger, claims: { ...ledger.claims }, history: [...ledger.history] };
  const balance = { ...wallet };
  if (activity && event.action === 'complete') {
    if (claim?.active) outcome = 'duplicate';
    else {
      const value = rewardValues[activity.kind];
      coins = claim?.coins ?? Math.min(value.coins, REWARD_CAP.coins - ledger.grossCoins);
      xp = claim?.xp ?? Math.min(value.xp, REWARD_CAP.xp - ledger.grossXP);
      if (!claim) { next.grossCoins += coins; next.grossXP += xp; }
      next.claims[event.activityId] = { active: true, coins, xp };
      // Restoring the same entitlement repays any spent-reward adjustment first.
      const repaid = Math.min(next.adjustment, coins);
      next.adjustment -= repaid;
      balance.coins += coins - repaid; balance.xp += xp;
      outcome = claim ? 'restored' : coins || xp ? 'awarded' : 'capped';
    }
  } else if (activity && event.action === 'undo') {
    if (!claim?.active) outcome = 'inactive';
    else {
      coins = -claim.coins; xp = -claim.xp;
      const returned = Math.min(balance.coins, claim.coins);
      balance.coins -= returned; next.adjustment += claim.coins - returned;
      balance.xp -= claim.xp;
      next.claims[event.activityId] = { ...claim, active: false };
      outcome = 'reversed';
    }
  }
  next.history.unshift({ ...event, outcome, coins, xp });
  return { ledger: next, wallet: balance, outcome };
}
