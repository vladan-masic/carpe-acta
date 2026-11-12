# Stage 6B — Exploration artwork review

Branch: `codex/realm-exploration-artwork`, based on approved main `a14d5bf` (PR #39). Artwork and integration approved; release authorized after final validation gates.

## Integration

Six coordinated hand-painted watercolor landscapes generated with the built-in image_gen tool; exact prompts are in `prompts.json`. Original PNGs are in `sources/`. The existing Whispering Woods section uses the woodland illustration. The existing five Guild destination cards use their matching landscapes above the titles, retaining the existing responsive card grid, requirements, costs, outcomes, buttons and completion explanations. No painted text or character figures.

`ExplorationArtwork` handles responsive sources and lazy loading. Informative English/Serbian Latin descriptions are in the existing copy modules. Titles and all controls remain ordinary accessible text outside the images. Artwork is visible in locked and completed states; existing model reasons continue to control buttons. No destination IDs or names changed.

## Optimization

Each image has 400×250 and 800×500 WebP exports (16:10, quality 82). The six 400px files total 205,114 bytes; the 800px set totals 770,888 bytes. Browsers select a source according to slot size and pixel density; they do not need to download both versions. Explicit dimensions reserve space; images are not cropped. Guild previews are capped at 320px and forest artwork at 480px. The original PNGs are review sources only and are not imported by the app.

All six scenes, source code and styles remain excluded from production. Production JS/CSS filenames remain unchanged. `asset-validation.json` records export dimensions, bytes and hashes.

## Review evidence

- `comparison.png`: six-image comparison sheet; local source `comparison.html`.
- `forest-en-light-1440.png`: actual forest section with controls.
- `guild-available-desktop.png`: actual Guild interface after replaying existing reward, supply, construction, research and forest controls. Three destinations are affordable with the remaining supplies; the other two correctly retain insufficient-resource restrictions.
- `guild-completed-desktop.png`: meadow marked completed after its real action.
- `forest-completed-desktop.png`: all original forest stages completed.
- `guild-en-light-390.png` and `forest-sr-Latn-dark-320.png`: mobile examples.
- Other screenshots cover EN/Serbian Latin × light/dark × 1440/390/320px.
- `browser-results.json`: all twelve combinations, image descriptions, selected sources, ratios, no horizontal page overflow, locked controls and actual gameplay replay. The floating toolbar is hidden only during section screenshot capture to prevent it obscuring the captured section.

## Checks and boundaries

122 focused tests across seven Realm files passed during review. Final release validation: 585 tests across 62 files passed. TypeScript, production build, exclusion checks and diff checks passed. Tests cover localized informative images, locked destinations, available actions and one-time completion for all five regions, plus the existing gameplay/economy and building tests. Browser checks found all six images loaded at the intended ratio, no page overflow or browser exceptions in all twelve combinations. Actual controls completed the three forest stages and one regional expedition without replacing game state.

Model, catalog, resource costs, rewards, hero prerequisites, forest progress, caps, village terrain, building artwork and resource/portrait assets are unchanged. No Supabase, persistence, real-user data, notification or production-route changes.

Remaining limitations: the existing >500kB production chunk warning; mobile checks use Chromium emulation rather than physical devices; no full screen-reader audit. Visual and functional approval received. Final browser verification repeated all twelve combinations and actual expedition controls. No subsequent development stage started.
