import { useState } from 'react';
import { activities, REWARD_CAP, rewardValues, type RewardEvent } from './rewards';
import type { Realm } from './model';
import type { RealmCopy } from './copy';

export function RewardSimulator({ state, copy: c, onEvent }: { state: Realm; copy: RealmCopy; onEvent: (event: RewardEvent) => void }) {
  const [activityId, setActivityId] = useState(activities[0].id);
  const activity = activities.find(item => item.id === activityId)!;
  const claim = state.rewards.claims[activityId];
  const last = state.rewards.history[0];
  const value = rewardValues[activity.kind];
  return <section className="realm-simulator realm-paper" aria-labelledby="realm-simulator-heading" id="realm-simulator">
    <div className="realm-simulator-intro"><div><p className="realm-eyebrow">{c.prototype}</p><h2 id="realm-simulator-heading">{c.simulator}</h2><p>{c.simulatorHelp}</p></div>
      <div className="realm-budget"><span>{c.budget}</span><strong>{state.rewards.grossCoins}/{REWARD_CAP.coins} {c.resources.coins} · {state.rewards.grossXP}/{REWARD_CAP.xp} {c.xp}</strong></div></div>
    <div className="realm-simulator-controls">
      <label>{c.activity}<select value={activityId} onChange={e => setActivityId(e.target.value)}>{activities.map(item => <option key={item.id} value={item.id}>{c.kinds[item.kind]} · {c.activityNames[item.kind][item.index]}</option>)}</select></label>
      <button className="realm-primary" onClick={() => onEvent({ id: `sim-event-${state.sequence + 1}`, activityId, action: 'complete' })}>{c.simulate}</button>
      <button onClick={() => onEvent({ id: `sim-event-${state.sequence + 1}`, activityId, action: 'undo' })}>{c.undo}</button>
      <button disabled={!last} onClick={() => last && onEvent({ id: last.id, activityId: last.activityId, action: last.action })}>{c.replay}</button>
    </div>
    <div className="realm-simulator-meta"><code>{activityId}</code><span>{claim?.active ? c.active : c.inactive}</span><span>{c.nominal}: {value.coins} {c.resources.coins} + {value.xp} {c.xp}</span></div>
    {state.rewards.adjustment > 0 && <p className="realm-adjustment"><strong>{c.adjustment}: {state.rewards.adjustment}</strong> · {c.reasons.adjustment}</p>}
    <details><summary>{c.history} ({state.rewards.history.length})</summary>
      {last ? <ol className="realm-reward-history">{state.rewards.history.map(row => <li key={row.id}><div><code>{row.id}</code> · <code>{row.activityId}</code><strong>{c.outcomes[row.outcome]}</strong></div><span>{row.coins > 0 ? '+' : ''}{row.coins} {c.resources.coins} · {row.xp > 0 ? '+' : ''}{row.xp} {c.xp}</span></li>)}</ol> : <p>{c.emptyHistory}</p>}
    </details>
  </section>;
}
