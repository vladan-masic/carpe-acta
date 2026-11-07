# Approved Realm artwork integration

The development-only `/__realm-preview` now renders the approved clean terrain and ten polished transparent sprites. Only constructed buildings display artwork; empty and locked plots remain keyboard/touch-selectable. The separate selector includes localized status and pans the scene to the selected site. Level, cost and prerequisite details remain in the existing detail panel.

All constructed levels deliberately share one mature illustration. No upgrade variants, new mechanics, economy changes, persistence or real accomplishment connections were added. The fictional 900-coin economy remains provisional. State remains disposable on reload.

## Approved baseline and source ownership

- Terrain: `docs/design/realm-stage4a/clean-v1/clean-terrain.png` (1670 × 941).
- Approved geometry: `docs/design/realm-stage4a/revised/proposal.json`; its source-image metadata records the earlier annotated reference. The geometry is now implemented in `src/dev/realm/placement.ts` and compared to this approval record by tests.
- Ten sprites, alpha framing, original prompts and combined review: `docs/design/realm-stage4b3/`.
- `src/dev/realm/artwork.tsx` imports those exact image files, without duplicated or recompressed copies. Its SVG framing matches the approved alpha-bounds presentation.

Only final approved artifacts are committed. Earlier Stage 4A/B review iterations remain local and untracked. No source PNG pixels or approved coordinates, ground polygons, artwork envelopes or draw order were changed during integration.

## Validation — 2026-11-07

- TypeScript project build: passed.
- Complete suite: 60 files / 558 tests passed, including construction, upgrade and maximum states across all ten buildings in English/Serbian and light/dark, approved geometry agreement, and sprite visibility at levels 0–5.
- Production Vite build: passed; existing >500 kB chunk warning remains.
- Production exclusion: Realm code/style/catalog checks passed; SHA-256 checks confirm the terrain and all ten approved sprites are absent from output assets. The production JS/CSS hashes remain unchanged. No production route/config changes.
- Browser: initial three constructed sprites; all ten reached through the existing fictional progression trace; no page errors. 390px mobile document has no overflow, horizontal scene pan works, Serbian localization and both themes checked. Keyboard activation focuses the existing details heading.
- `git diff --check`: passed.

Screenshots: `initial-en-light.png`, `constructed-en-light.png`, `constructed-en-dark.png`, `mobile-sr-light.png`, `mobile-sr-dark.png`. Machine-readable browser checks: `browser-results.json`.

## Limits and release boundary

Original high-resolution review PNGs are intentionally retained; no delivery-size optimization or per-level art was introduced. Perspective/rock blending retains the approved visual limitations. No deployment, push or merge is included in this step; Realm remains development-only.
