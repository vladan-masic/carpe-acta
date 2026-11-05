# The Realm — Stage 3 review checkpoint

Development-only implementation on `codex/realm-ten-buildings`, based on refreshed `origin/main` at `7aa370c` (PR #35). The gameplay direction, placement and expansion were approved; release is authorized after the final maximum-level correction and validation. Stage 3 supersedes Stage 2's six-building economy and placement plan; its reward identity and reversal policy remain intact.

## Ten-building gameplay

All ten buildings support construction and upgrades through level 5. Hall and Workshop gates are unchanged: other buildings may be one level above the Hall; levels 3–5 require Workshop levels 1–3, except Workshop itself. Initial Hall, Farm and Sawmill are level 1. Quarry remains available at Hall 1, preserving the existing prototype. Hall 2 opens Mine, Workshop, Marketplace and the original forest; Hall 3 opens Academy and Guild; Hall 4 opens Tavern.

- **Town Hall:** unlocks settlement tiers and adds one material to supply bundles per level above 1.
- **Farm, Sawmill, Quarry, Iron Mine:** improve their resource bundles by four per level. Mine construction unlocks iron purchases.
- **Workshop:** adds two materials per level to every supply bundle; preserves advanced upgrade prerequisites.
- **Marketplace:** deterministic material exchanges. Level 1 offers wood/stone, level 2 adds food, level 3 adds iron. Every exchange pays 6 units; levels 1–3 return 3, level 4 returns 4, level 5 returns 5. Exact quantities and all resulting balances appear before an eligible trade. No coins or XP are awarded.
- **Academy:** five finite researches, one unlocked per Academy level. Foundations reduces material construction costs by 5%; Packing adds 2 materials to supply bundles; Trailcraft reduces food by 4 for each new regional expedition; Masonry requires Foundations and adds another 5% reduction; Caravans requires Packing and adds another 2 materials. Construction costs round up, so savings stay modest. Coins are never discounted. Costs, prerequisites and benefits are visible; each benefit applies once.
- **Explorers' Guild:** five permanent destinations, one per Guild level: Quiet Meadow, River Landing, Slate Ridge, Old Orchard and Mountain Pass. Each has distinct guaranteed outcomes, material costs, hero requirements and original-forest prerequisites. Trailcraft affects these new destinations only. Original forest stage count and route choice remain intact.
- **Tavern:** five permanent visitors, one per level. Potter exchanges materials; Gardener starts a village garden; Cartographer requires the river visit; Storyteller provides a narrative-only gathering; Bridgewright requires the mountain pass. Every contract is recorded once, including the narrative-only visit. No deadlines, daily refreshes, passive production, random loot, coins or XP.

Catalog data is in `src/dev/realm/catalog.ts`; all commands and eligibility checks are deterministic in `model.ts`. `BuildingActivities.tsx` renders the selected building's catalog. Completed researches, destinations and contracts remain visibly recorded and cannot be claimed again. Undoing an accomplishment preserves these records and existing buildings, while the existing ledger handles the coin adjustment and XP reversal.

## Economy and reachability

The old 200-coin cap cannot support ten level-5 buildings: construction alone costs **441 coins**, excluding supplies. The same 14 fictional accomplishments and stable IDs remain: eight tasks, four tips and two milestones. Coin rewards are scaled fourfold to **80 / 32 / 120**; XP stays **20 / 10 / 35**. The provisional lifetime caps are **900 coins / 200 XP**, independently enforced. The 900-coin fictional cap is retained for this prototype and the economy must be reassessed before connecting The Realm to real user accomplishments. Catalog nominal issuance is 1,008 coins / 270 XP; final claims can be partial. In catalog order the final milestone receives 12 coins and zero XP. Undo/recompletion restores that exact entitlement without replenishing either cap.

The first 800-coin trial completed all content but left only 17 coins without early research. The final 900-coin cap leaves more room for optional trades and inefficient purchases without adding accomplishments or requiring repetition. Construction costs, the 5-coin supply price and the original forest costs/outcomes are unchanged.

`tests/helpers/realmSimulation.ts` is executable balance evidence. It starts from the real initial state, claims only the fixed catalog, buys missing supplies and performs legal commands. It never injects resources, replays rewards, relies on profitable trades or assumes passive income. Two deterministic playthroughs reach every building at level 5 and complete all five researches, three original forest stages, five new destinations and five contracts:

| Result | Research after building | Research as tiers open |
| --- | ---: | ---: |
| Construction/upgrade commands | 47 | 47 |
| Paid supply purchases | 66 | 62 |
| Total coins spent | 783 | 763 |
| Coins remaining | 117 | 137 |
| Wood / stone / food / iron remaining | 55 / 93 / 33 / 96 | 40 / 84 / 51 / 63 |
| Total simulated actions, including 14 accomplishments | 145 | 141 |
| Coins spent when the tenth building first exists | 469 | 479 |

These are deliberately thorough village-wide upgrade paths, not minimum-cost construction proofs. At the tenth-building checkpoint, Hall and the first nine buildings are already level 4 and Tavern is level 1. Basic wood, stone and food purchases remain available before their buildings exist; Mine construction precedes all iron-dependent progression. The tests exercise both availability and Workshop gates and reject insufficient resources.

**Arbitrage proof:** assign every material one unit of accounting value. Every repeatable Marketplace exchange reduces total value by at least one at every level, so any sequence or cycle also loses value. No exchange outputs coins or XP. Supply purchases consume finite earned coins. The only material-increasing free-of-coin outcomes belong to finite, individually recorded expeditions/contracts. Research is finite and never refunds spent resources. Tests enumerate every unlocked directional route at every level and run repeated triangular cycles.

This is a reachability proof, not a guarantee against spending the finite budget wastefully. Players can exhaust coins through unnecessary purchases or lossy trades. Reset remains explicit and disposable. Whether a later game should protect a minimum progression reserve is a review decision; this prototype does not introduce renewable rewards to hide exhaustion.

## Scene and artwork handoff

The temporary scene is an explicitly labeled placement plan, with no terrain illustration or completed building sprites. The previous unrelated landscape background has been removed. Numbered controls distinguish built, available and locked locations. Unbuilt structures are never displayed. Mobile keeps an 820px minimum-width pannable plan and a separate native building selector; keyboard and touch users can inspect locked plots and their exact requirements.

`src/dev/realm/placement.ts` is the ten-building manifest. Coordinates and reserved footprints below are percentages of the future 2400 × 1500 terrain master. Anchors are ground-contact points for future sprites; current selection markers are centered on the corresponding reserved locations. Z-order follows the table. Reservations are non-overlapping; final sprite silhouettes and entrance hit polygons still require artwork review.

| Z | Building | Anchor x, y | Reserved width × height | Terrain role |
| --- | --- | --- | --- | --- |
| 1 | Explorers' Guild | 16, 22 | 16 × 17 | Forest boundary |
| 2 | Academy | 42, 17 | 18 × 17 | Upper terrace |
| 3 | Iron Mine | 88, 22 | 16 × 17 | Rocky hillside |
| 4 | Town Hall | 51, 38 | 20 × 18 | Elevated central clearing |
| 5 | Sawmill | 17, 46 | 16 × 17 | Western forest |
| 6 | Farm | 87, 49 | 18 × 20 | Eastern fields |
| 7 | Marketplace | 39, 61 | 18 × 17 | Central crossroads |
| 8 | Workshop | 73, 73 | 16 × 17 | River bank |
| 9 | Quarry | 15, 79 | 18 × 19 | Lower rocky district |
| 10 | Tavern | 47, 86 | 18 × 17 | Bridge and entrance |

The manifest reserves a continuous river corridor `(82,0) → (70,24) → (75,46) → (60,67) → (64,100)`, from distant hills through the foreground, with a crossing near `(62,80)`. It records connected path routes from Guild/Sawmill to Marketplace, Academy/Hall to Marketplace/Tavern, Quarry to Marketplace, and Tavern across the bridge to Workshop/Farm/Mine. Four Hall-based expansion groups preserve logical hamlet, crossroads, terrace and entrance space without rearranging existing buildings.

Future artwork must follow `Carpe Acta_ A Brighter Realm.png`: warm watercolor/storybook European buildings, cream plaster, terracotta roofs, sage foliage, distant mountains, natural footpaths and the continuous river. Supply an approved clean terrain master plus separate transparent building illustrations with consistent ground anchors and scale. `sceneArtwork` contains empty terrain and per-building/per-level asset slots; `VillageScene` renders sprites separately from selection controls, and only for constructed levels. No cropped flattened-reference structures, generated CSS buildings or stock artwork were introduced.

Final artwork remains an explicit future approval checkpoint. The temporary plan is not a visual reconstruction of the flattened reference.

## Verification and isolation

See `docs/qa/realm-stage3/README.md` for final checks and screenshots. Development URL: `/__realm-preview`. Production route/bootstrap files, homepage, My Tasks, Focus History, account code and Supabase are unchanged. No migrations, storage, authentication, real accomplishment integration, manual deployment.

## Review decisions

1. Approve or revise the fictional 900-coin allowance and conservative trade rates. It changes only simulated values; real reward policy remains undefined.
2. Approve the five research benefits and the deliberately finite regional/visitor catalog, including the Storyteller's narrative-only reward.
3. Decide whether future progression should protect a resource reserve after wasteful trades; current limits and disposable reset are explicit.
4. Approve the ten-plot composition and commission the coordinated terrain/building assets before any finished-art pass.
5. Keep the existing spent-reward adjustment policy provisional before any future real-accomplishment integration.

## Final usability correction

All ten building details use the same localized maximum-level control: **Fully upgraded — Level 5** / **Potpuno unapređeno — Nivo 5**. It remains a natively disabled button with its explanatory status linked by `aria-describedby`; the maximum state uses full-opacity theme ink and surface colors. Upgrade costs, upgrade instructions and immediate-construction text are absent at the cap. Construction and intermediate upgrade controls retain their original behavior. Gameplay, placement and the 900-coin cap are unchanged by this correction.
