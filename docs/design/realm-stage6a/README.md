# Stage 6A — Resource illustrations and Wayfinder portrait

Approved Stage 6A release. Branch: `codex/realm-resource-artwork`, based on approved main merge `a7dfe1f` (PR #38). Finalization authorized after passing release gates.

## Artwork

Six separate illustrations generated with the built-in image_gen tool. Exact prompts are in `prompts.json`. Original transparent RGBA PNGs are preserved in `sources/`; optimized lossless WebP exports are in `assets/`. Resource exports are 128×128 and the portrait is 256×256. Only deterministic downsampling and format optimization were applied; no background removal or art repainting was needed. All six have genuine alpha spanning 0–255. Total UI asset payload: 164,360 bytes.

Wood uses a three-log stack, stone pale limestone, food tied wheat, coins short gold stacks, and iron dark mineral chunks with rust seams. The friendly Wayfinder wears sage and cream. Resources display at 24px inline and 28–32px in balances; the portrait uses the existing 60px profile slot.

A shared decorative ResourceIcon is used for balances, construction requirements, supply exchange, marketplace rates/balances, research costs, guild/tavern costs and outcomes, expedition supplies/rewards, and fictional coin rewards/history. Text names, quantities, controls and hero information remain localized and accessible. Native select options retain text labels. Decorative images have empty alternative text and are hidden from assistive technology to avoid duplicate announcements.

## Review

- `screenshots/en-light-1440.png`: complete default Realm interface, including actual starting village.
- `isolated-assets.png`: all six assets on light, dark and checkerboard backgrounds, including 24/32px resource and 60px portrait previews.
- `isolated.html`: local Vite review sheet.
- `screenshots/`: complete EN/Serbian Latin × light/dark × 1440/390/320px matrix.
- `asset-validation.json`: dimensions, alpha, bytes and SHA-256 of optimized assets.
- `browser-results.json`: layout checks, labels, initial buildings, loaded artwork and browser errors.

## Validation

118 focused Realm tests across six files passed during review. Final release: 581 tests across 61 files passed, including resource accessibility/localization, existing tier progression, reward protections and finite building activities. TypeScript, production build and Realm-exclusion checks passed. Production JS/CSS filenames remain unchanged. The build retains the existing >500kB main chunk warning.

All 12 browser combinations passed: no horizontal page overflow, new images loaded, correct locale/theme, and only the three intended initial buildings. Visual inspection covered the complete desktop interface, narrow Serbian dark layout and isolated small-size previews. Mobile testing is Chromium emulation; no physical-device or full screen-reader audit was performed.

Terrain, all building sprites, tier mappings, coordinates, drawing order, gameplay model, economy, reward values/simulator behavior, hero XP/unlocks and exploration are unchanged. No real user data, persistence, production routes or Supabase changes. All six new assets and their display code are excluded from production output.

Visual approval received. Final checks repeated in the actual interface across all twelve combinations. Stone remains pale limestone and Iron dark ore at 24px in supply cards and 32px in desktop balances, with localized text names always present. The Wayfinder retains the original 60px profile slot at desktop and mobile sizes. Detail screenshots are included in screenshots/. No further artwork stage started.
