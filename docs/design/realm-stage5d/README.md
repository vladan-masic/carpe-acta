# Stage 5D — Remaining five building progressions

Development visual review, 2026-11-08. Approved Sawmill, Workshop and Marketplace progression was committed as 83509c3 on codex/realm-town-hall-tiers. Town Hall 33e2a89 and Farm a261d43 remain unchanged. This five-building set is uncommitted. Nothing was pushed, merged or deployed.

## Art decisions

The approved Stage 4B3 sprite for every building is reused unchanged for levels 3–4. Ten separate transparent edits provide the other two tiers:

| Building | Levels 1–2 | Level 5 |
| --- | --- | --- |
| Explorers’ Guild | Modest map table and sparse expedition supplies | Refined compass emblem, navigation instruments and organized packs |
| Academy | Simple book emblem, stonework and reading spaces | Detailed book emblem, window tracery and scholarly instruments |
| Iron Mine | Plain portal, small cart and basic sorting bench | Iron-braced portal, reinforced cart and organized ore bins |
| Quarry | Simple chisel station and rope hoist | Reinforced crane, compact geared winch and organized stonework |
| Tavern | Plain entrance, simple tankard sign and fewer decorations | Carved entrance and bench, refined sign and richer flowers |

The built-in image_gen tool edited each approved sprite as its reference. prompts.json records exact prompts and generation provenance. PNGs were copied without raster processing. Asset-validation.json records dimensions, hashes, RGBA mode, alpha range 0–255, visible alpha bounds and rendering bounds for all ten variants.

## Fit and preserved state

Each building retains its approved SVG viewBox, bottom-center registration, placement, ground footprint, maximum envelope and draw order. No enlargement or per-tier recentering is applied. Native image dimensions differ from the originals by one pixel in width for the two Mine variants and developed Tavern; they are not stretched. Small painted edge differences are clipped by the common viewport, at most six source pixels (under one scene pixel). Ground-contact shadow edges vary slightly; structural ground registration remains stable.

Desktop and 390px mobile inspection found no new intrusion into roads, bridge, river, neighboring plots or fence openings. Mine retains the approved rocky surround and hillside position. Quarry crane reach stays within its existing outline. Tavern stays clear of the entrance/bridge route. Development is communicated through craftsmanship and equipment rather than greater building mass; fine detail is intentionally subtle on mobile.

Town Hall, Farm, Sawmill, Workshop and Marketplace assets, tier mappings and framing are unchanged. Original baseline sprites, terrain, placement manifest, domain functions, rewards and economy have no changes. English/Serbian artwork descriptions now accurately state that all ten buildings use tiers at 1, 3 and 5, with 2 and 4 reusing the preceding tier. No controls or unrelated UI changes were introduced.

## Review artifacts

Open `/docs/design/realm-stage5d/index.html` on the local Vite server. This review-only fixture uses the actual VillageScene renderer, with the five previously approved buildings at level 5 and the five new buildings at the indicated review tier. It does not mutate the gameplay preview state.

- `{guild,academy,mine,quarry,tavern}-comparison.png`: three-tier comparisons.
- `terrain-level-{1,3,5}.png`: actual terrain scenes.
- `{guild,academy,mine,quarry,tavern}-mobile-level-{1,3,5}.png`: horizontally panned mobile views.
- `mobile-preview.png`: actual initial development preview, demonstrating the existing Sawmill tier remains in use.
- `browser-results.json`: identical plot geometry for each building at all tiers, selected sources, no browser errors and document width equal to the 390px viewport.

## Validation

- 69 focused tests across artwork, preview and expansion passed.
- All ten buildings covered for 1/3/5 thresholds, 2/4 reuse and original middle sprites. All nine constructible buildings covered for real construction/upgrade transitions, stable framing and maximum-level rejection; Town Hall's existing upgrade/prerequisite regression remains covered.
- Exact approved placement and bilingual selection tests passed.
- TypeScript passed.
- Production build passed; existing >500kB chunk warning remains.
- Realm-exclusion checks passed for terrain, baseline sprites and all twenty tier variants, including hashes and output-reference scans. Production bundle names remain unchanged.
- Desktop/mobile browser checks passed; no browser errors or page overflow.
- git diff --check passed. Previously approved asset directories and gameplay/geometry files have no changes relative to 83509c3.

Stop here for visual review before committing this set or pushing, merging or deploying.
