# Shared tasks and The Realm — Stage 1 proposal

The shared-task proposal below remains unimplemented. The Realm economy and its implementation notes are superseded by [Stage 2](realm-stage2.md).

## What is implemented now

The List and Kanban previews remain unchanged and each still owns its own in-memory sample state. They reuse `Task`, editing controls and the details panel; Kanban extends `Task` with status. Navigating between those previews currently resets their separate state. **Shared live task synchronization is proposed, not implemented.**

The new `/__realm-preview` is development-only. Its deterministic reducer-like functions in `src/dev/realm/model.ts` own a separate in-memory economy. It has no task, tip, account, persistence or network connections. Reloading resets it. `RealmPreview.tsx` presents the game; `copy.ts` provides bilingual copy; `realm.css` scopes the visual design. Production builds exclude this route and its assets.

## Proposed canonical task model

Reuse existing concepts but replace prototype-only bilingual user-text records with strings (UI labels remain localized). Separate description from notes. Do not store a duplicate completion boolean: `status === 'done'` is authoritative.

```ts
type TaskStatus = 'later' | 'next' | 'doing' | 'done';
type SharedTask = {
  id: string; title: string; description: string; notes: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  importance: 'low' | 'medium' | 'high';
  deadline: string | null; // local calendar date YYYY-MM-DD
  estimatedMinutes: number | null;
  status: TaskStatus; previousOpenStatus: Exclude<TaskStatus, 'done'>;
  columnOrder: number; // stable within a status, deterministic ID tie-break
  createdAt: string; updatedAt: string; completedAt: string | null; // UTC instants
  subtasks: {
    id: string; title: string; order: number; completedAt: string | null;
    createdAt: string; updatedAt: string;
  }[];
};
```

A single TasksProvider/useReducer above a List/Kanban view switch should own `tasksById`; both views select the same records. Commands (`create`, `edit`, `move`, `complete`, `reopen`, `editSubtask`, `reorder`) enforce invariants atomically. Reopening restores the previous open status; explicit moves use their destination. Completing subtasks does not implicitly complete the parent. Manual column order remains unchanged by date/urgency sorting; filters and sort choices belong to the view. A future optional list-wide manual order needs its own explicit key, never a second task copy. Initially renumber column ranks within a move transaction; introduce fractional ranks only if synchronization warrants it. Inject ID and clock providers for deterministic tests. No new state library is needed.

Later, persistence sits behind a repository adapter, not inside cards or view components. This stage makes no schemas, migrations or adapters.

## Playable rules

- Start: Hall, Farm and Sawmill level 1; Quarry and Workshop are empty plots. Four resources: wood, stone, food and coins.
- Farm produces 14 food/level/hour; Sawmill 12 wood; Quarry 10 stone; Hall 4 coins. Each Workshop level adds 2 per producer level to the first three outputs.
- Before a Quarry exists, its 15-stone construction reserve cannot be spent on other buildings; this prevents an economic dead end.
- One construction at a time. Costs and target production are shown before spending. Construction lasts target-level hours. Producers continue working during upgrades; new output applies the next hour. Every building has five levels. Non-Hall buildings can be at most one level above the Hall.
- Advance 1 Hour is the only time source. No upkeep, offline simulation, real countdown or inactivity loss.
- Completed construction gives 20 XP × target level. Every 100 XP gains a hero level. Stewardship/scouting are preview profile values with no hidden gameplay bonuses.
- Hall level 2 unlocks the forest. Three one-time stages, lasting 2/3/4 hours. Choose supplies (wood/stone) or mapping (coins/more XP). Costs and exact guaranteed rewards are visible. Rewards occur once on return. No repeat farming or random outcomes.

## Future productivity events — architecture only

Use a separate completion-event ledger, not button handlers or existing aggregate progress totals. Events carry stable event ID, owner scope, source kind, source ID, completion-cycle ID, revision, occurrence time and reversal reference. Award an idempotent reward claim keyed by owner + source + eligible milestone; a repeated delivery or reopening/recompletion cannot generate a new claim. Explicitly authored recurring tasks may use a separately identified eligible occurrence.

Undo/reopening deactivates the corresponding claim through a compensating ledger event. Before integration, decide how spent rewards are reconciled: for example, a private adjustment balance against later grants, without removing buildings or making resource balances negative. Recompletion reactivates the original entitlement rather than awarding twice. Parent/subtask policies must avoid rewarding the same work twice (e.g. reward parent only initially). Preserve the existing tip statistics as an independent projection; Realm code must never write them.

Authenticated claims eventually require authoritative transactional deduplication and revision/conflict checks across devices. Guest events need their own stable namespace and explicit, idempotent account-merge handling; local guest claims cannot be trusted as server-authorized rewards. Opt-in and disconnect must leave task/tip functionality intact. None of this event pipeline is wired in the prototype.

## Artwork for the next visual stage

Use the supplied Realm mockup as direction, not as a flattened interactive background. Needed: a responsive village terrain map with quiet label areas; five distinct building cutouts with a few upgrade variants; matching resource icons; a hero portrait; one forest-region illustration. Include transparent edges and dark-theme readability. Current scenery is reused Carpe Acta art; map positions and Unicode symbols are temporary gameplay aids. No custom art generation or unrelated stock assets were added.
