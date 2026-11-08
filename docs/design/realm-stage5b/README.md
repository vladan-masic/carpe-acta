# Stage 5B — Farm-only visual progression

Development review, 2026-11-08. Town Hall Stage 5A was approved and committed as 33e2a89 on codex/realm-town-hall-tiers. The Farm changes in this directory and their integration remain uncommitted pending visual approval. Nothing was pushed, merged or deployed.

## Three tiers

- Levels 1–2: simpler farmhouse and attached storage barn, plain shutters, fewer decorative details.
- Levels 3–4: unchanged approved Stage 4B3 Farm PNG.
- Level 5: refined barn framing, shutter hardware, doorway and harvest storage tucked into the existing sheltered join.

Two independent transparent RGBA PNGs were generated using the built-in image tool with the approved Farm sprite as the edit reference. The exact prompts and reference are recorded in prompts.json. No raster alterations or background-removal processing were performed. Both generated originals are 1975 × 796, alpha range 0–255; asset-validation.json records hashes and alpha bounds.

## Fit and invariants

All three tiers use the original Farm SVG framing [3, 2, 1969, 795], bottom-center alignment and native aspect ratio. The common viewport clips only a few source-edge pixels (up to five, under one displayed pixel); it avoids per-tier re-centering. The front door, foundation and barn retain their relative positions. No scaling enlargement is applied.

The placement manifest remains untouched: anchor 78%,49.5%; envelope 12% × 8.5%; draw order 6; existing ground footprint unchanged. Visual review at desktop and 390px mobile found no new interference with the field fence, access road, river or adjacent sites. Improvements remain deliberately subtle at scene scale, especially on mobile.

Town Hall's approved tier assets and framing are unchanged. The other eight buildings retain their single approved illustration. Terrain, gameplay, reward economy, production routes and real user data are untouched. English and Serbian descriptions now accurately mention Farm alongside Town Hall; no controls were added.

## Review artifacts

Open `/docs/design/realm-stage5b/index.html` on the local Vite server for the side-by-side comparison and three actual VillageScene renderings. The review fixture shows all ten buildings constructed for context and does not change prototype state.

- tier-comparison.png: all three Farm tiers.
- terrain-level-1.png, terrain-level-3.png, terrain-level-5.png: desktop terrain screenshots.
- mobile-level-1.png, mobile-level-3.png, mobile-level-5.png: pannable scene at 390px.
- mobile-preview.png: actual development preview initial Farm selection.
- browser-results.json: identical plot geometry across tiers, correct image sources, no browser errors and 390px document/viewport width.

## Validation

- 53 focused tests passed across realm-artwork, realm-preview and realm-expansion.
- Tests cover tier thresholds, level 2/4 reuse, unchanged middle sprites, unchanged eight remaining sprites, approved geometry, English/Serbian selection, Farm construction and upgrade transitions, and Town Hall prerequisite regressions.
- TypeScript passed.
- Production build passed, with the existing >500kB bundle warning.
- Realm code and all baseline/Town Hall/Farm artwork exclusion checks passed, including PNG hash checks and output-reference checks. Production bundle names remain unchanged.
- git diff --check passed.

Stop here for Farm visual approval. No further building upgrades or gameplay/UI work is included.
