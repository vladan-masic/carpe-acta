# The Realm — Stage 2 review

## Artwork checkpoint: reconstruction paused

The approved `Carpe Acta_ A Brighter Realm.png` is the composition reference. Existing repository and approved-artwork folders contain landscape, botanical, notebook and achievement illustrations, but **no separate village terrain, building cutouts, building variants or Iron Mine**. The reference is flattened with labels, controls and a side panel baked in. Cropping its structures would leave incomplete terrain and UI artifacts. No new imitation buildings, CSS illustration or generated assets were added. The existing schematic selection scene is retained and clearly marked as temporary; it is not presented as a reconstructed village.

### P0 — coherent terrain and six level-1 buildings

Deliver one coordinated set, using the reference's warm watercolor/storybook style, terracotta roofs, cream plaster, sage foliage and muted-blue water. Camera: elevated three-quarter view, approximately 35° down, showing front and right faces; consistent scale and soft light from upper left. Avoid rigid game-isometric outlines, photorealism, heavy shadows and oversaturated colors.

- **Terrain master:** 2400 × 1500 px, sRGB PNG master plus WebP delivery. Scenic village clearing with connecting footpaths, forest at the rear, cultivated plots, rock faces and a river/bridge along the lower edge. Six unobstructed building pads, no buildings, text, icons or UI. Opaque terrain interior, transparent softly feathered paper edges; do not bake a cream rectangle around it. Keep important terrain away from the outer 8% for responsive framing.
- Proposed pad centers (percentage of master width/height): Hall (50, 32), Sawmill (24, 47), Farm (76, 46), Quarry (22, 70), Mine (47, 71), Workshop (73, 72). Paths should connect to building entrances, not pass behind detached cards. Iron Mine should sit naturally in a rocky slope. Final composition can adjust these coordinates, but provide the matching placement manifest.
- **Six building cutouts:** individual 768 × 768 px RGBA PNGs, fully transparent outside the artwork, at least 10% padding; keep all trees, fences and roof tips inside bounds. Align the ground-contact anchor at (384, 620) in every file. Provide visible-footprint bounds and recommended scene scale. Include soft contact shading, no baked terrain rectangle, labels, level badges, selection rings or UI.
- Town Hall: cream plaster/timber civic house with recognizable terracotta roof and small tower; largest footprint.
- Sawmill: timber shed, stacked logs and modest saw/work area, adjacent to forest.
- Quarry: low stone-working shelter with rock face and cut-stone stacks; distinct from the Mine.
- Farm: farmhouse/barn and bounded wheat/vegetable plots; coordinated crop textures join terrain.
- Iron Mine: reinforced hillside entrance, ore cart and dark iron-bearing rocks; no glowing fantasy crystals.
- Workshop: masonry/timber craftsman's building, chimney, bench and tools; distinct roof silhouette.

Deliver a layered composite showing all six structures correctly seated on the terrain, plus the clean terrain and separate sprites. Keep building shapes non-overlapping so hit areas remain unambiguous. Include a placement JSON (normalized x/y anchor, scale, z-order, hit polygon). Desktop will show the whole scene; mobile should pan a readable scene or offer a building selector, rather than shrinking all structures to tiny targets. Test at roughly 1000 × 625 desktop scene size and 390 px mobile crop.

### P1 — progression variants

For each of six buildings, supply level-3 and level-5 variants (12 additional 768 × 768 transparent sprites). Keep the exact camera, anchor and footprint family. Make tiers recognizable through extra wings, improved tools, storage or crops; avoid huge scale jumps. Levels 2 and 4 can initially reuse the preceding illustration with accurate level labels, explicitly documented as shared artwork. If every level must look unique, 12 further level-2/4 variants are required. A shared scaffolding cutout is optional: Stage 2 construction is immediate, so no timed construction scene is needed.

### P2 — supporting art

Five resource icons (Coins/Wood/Stone/Food/Iron), 128 × 128 transparent PNG; hero portrait, 512 × 512; forest region scene, 960 × 600 with no baked text. Supply watercolor colors that remain readable on dark paper; no automatic hue inversion. A separate night terrain is optional, not a blocker. Selection/focus/availability indications remain semantic HTML overlays and do not need separate art.

## Revised playable economy

- Five resources: coins, wood, stone, food, iron. Start with a finite material allowance and **zero coins/XP**. No timer, hourly production, offline accumulation or automatic rewards.
- Fixed fictional catalog: 8 tasks, 4 tips, 2 milestones. Tasks grant 20 coins/20 XP, tips 8/10, milestones 30/35. Lifetime session issuance is capped independently at 200 coins and 200 XP. A final award may be partial. Difficulty has no multiplier. Reload/reset creates a new disposable test session; this is not a production anti-fraud guarantee.
- Supplies cost 5 coins. Bundle size = 8 + 4 × resource-building level + 2 × Workshop level + (Hall level − 1). Basic wood/stone/food can be purchased before their buildings exist, avoiding progression dead ends. Iron purchases require a Mine.
- All six buildings are selectable and support construction/upgrading up to level 5. Costs are shown exactly before spending. Builds finish immediately, grant no XP, and consume food as a one-time settlement-support cost; there is no population/upkeep simulation.
- Hall level 2 unlocks Mine, Workshop and forest. Other buildings may reach one level above the Hall. Targets 3–5 (except Workshop itself) require Workshop level at least target minus two. Iron is required at levels 3+. Higher Halls unlock tiers; resource buildings improve bundles; Workshop improves all bundles and unlocks advanced building tiers.
- Hero gains a level per 50 achievement XP. Levels 2–4 unlock forest stages 1–3. Three one-time expeditions cost coins/food (and iron at stage 3), resolve immediately and offer a guaranteed wood/stone or iron/food outcome. Expeditions grant no coins or XP. No repeatable reward loop.

## Reward identity, undo and caps

`rewards.ts` owns the fixed activity catalog, reward claims and immutable-style event history; `model.ts` owns village resources, levels, exploration and deterministic commands; `RewardSimulator.tsx` and `RealmPreview.tsx` own presentation. No imports from real task/tip/account systems and no storage/network writes.

Each simulator command has a unique event ID; exact replays are ignored. Claims are keyed by stable sample-accomplishment ID, so a new event ID for an already rewarded completion also grants nothing. Undo marks that claim inactive, removes its original XP and recovers available coins. Any spent portion becomes a visible coin adjustment. Buildings and supplies remain; all spending pauses until the adjustment is repaid by new or restored rewards. Recompletion reactivates the original fixed entitlement, repaying the adjustment before crediting spendable coins. It never increments lifetime issuance. Undo never refreshes caps. A capped zero-value claim remains zero on replay/recompletion.

Hero level may fall after undo; future exploration can relock, while completed exploration and buildings remain. This is a provisional accounting policy, not a missed-day penalty. Product decisions still needed: whether already-spent irreversible rewards should use this adjustment policy, eligibility and verified milestone definitions, recurring-task occurrence identities, parent/subtask double-count prevention, issuance windows and accessible explanations. Production needs owner-scoped transactional claims, event revision/order handling, guest-account merge rules and authoritative validation. None is implemented here.

## Review boundary

No changes to List, Kanban, production navigation, homepage or real completion statistics. No persistence, authentication, migrations, synchronization or deployment. The task shared-store proposal remains future architecture. Stage 1's hourly economy in the earlier proposal is superseded by this document.
