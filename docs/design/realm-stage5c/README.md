# Stage 5C — Sawmill, Workshop and Marketplace tiers

Development visual review, 2026-11-08. Approved Farm progression was committed as a261d43 on codex/realm-town-hall-tiers; Town Hall commit 33e2a89 remains unchanged. This new three-building set is uncommitted. Nothing was pushed, merged or deployed.

## Artwork

All three approved Stage 4B3 sprites are reused unchanged for levels 3–4. Six separate transparent RGBA edits provide levels 1–2 and level 5:

| Building | Levels 1–2 | Level 5 |
| --- | --- | --- |
| Sawmill | Simple hand-saw bench and sparse lumber storage | Reinforced circular-saw bench, clearer belt mechanism and organized lumber |
| Workshop | Plain entrance, simple workbench and fewer tools | Dressed-stone entrance, reinforced doors, improved anvil and tool stations |
| Marketplace | Plain cream awnings and modest displays | Refined timber brackets, striped awnings, richer displays and balance scale |

The built-in image_gen tool edited each approved sprite as its reference. prompts.json preserves all six exact prompts and generation provenance. PNGs were copied without raster processing. Asset dimensions, hashes, alpha ranges and framing are in asset-validation.json. All six exports are RGBA with alpha range 0–255.

## Fit

No placement, ground footprint, anchor, draw order or maximum envelope changed. Each new sprite uses its building's original SVG viewBox, bottom-center registration and natural proportions. Tiny source-edge differences are clipped by this shared viewport (up to seven source pixels, less than one pixel in the village scene), rather than recentering each tier. The level-5 Marketplace source is one pixel narrower than its reference; it uses its native image dimensions without stretching.

Desktop inspection and 390px horizontally panned mobile inspection found no new intrusion into paths, fences, neighboring plots, bridge or river. Rooflines, entrances and foundation positions remain visually aligned; painted shadow edges differ slightly. The architecture stays the same size: progression is conveyed by equipment, craftsmanship and displays, so some details are subtle on mobile.

Town Hall and Farm assets, tier mappings and framing remain unchanged. The five buildings without tiers retain their original sprites. Gameplay, economy, terrain, production routes and real user data are unchanged. Existing English and Serbian artwork descriptions now list the five tiered buildings; no controls or unrelated UI were added.

## Review

Run Vite and open `/docs/design/realm-stage5c/index.html` for three comparison rows and combined scenes. This isolated fixture renders the actual VillageScene with all ten buildings constructed for context. Town Hall and Farm stay at their approved level-5 appearances in these scenes.

- `{sawmill,workshop,marketplace}-comparison.png`: side-by-side tiers.
- `terrain-level-{1,3,5}.png`: all three new buildings at the indicated tier on actual terrain.
- `{sawmill,workshop,marketplace}-mobile-level-{1,3,5}.png`: mobile terrain views.
- `mobile-preview.png`: actual initial development preview with Sawmill selected.
- `browser-results.json`: identical plot geometry across tiers, selected sources, no browser errors and 390px document width.

## Validation

- 59 focused tests across artwork, preview and expansion suites passed.
- Coverage includes thresholds 1/3/5, level 2/4 reuse, approved middle sprite reuse, unchanged remaining sprites, exact placement manifest, bilingual selection, real construction/upgrades, stable frame and maximum-level rejection.
- TypeScript passed.
- Production build passed with the existing >500kB chunk warning.
- Realm-exclusion verification passed for terrain, baseline sprites and all five tier sets, including PNG hashes and code/reference scans. Production JS/CSS bundle names are unchanged.
- Desktop/mobile browser checks passed with no JavaScript errors and no page overflow.
- git diff --check passed; no changes to Town Hall/Farm review assets, original ten sprites, terrain, placement manifest, domain or reward code.

Stop here for visual approval before committing this set or performing any push, merge or deployment.
