# Stage 5 final release validation

2026-11-09, branch `codex/realm-town-hall-tiers`, based on main PR #37.

Approved artwork commits: `33e2a89`, `a261d43`, `83509c3`, `2f9ae25`. The final review package is in `../../design/realm-stage5-overview/` and was approved before release. Earlier untracked Stage 4 experiments are excluded.

## Release gates

- Full Vitest suite: **579 tests across 60 files passed**.
- TypeScript `tsc -b`: passed.
- Vite production build: passed; existing 710.74 kB main chunk produces the existing >500 kB warning.
- `scripts/check-realm-build.mjs`: passed for Realm code, styles, reward catalogs, terrain, original ten sprites and all twenty tier exports.
- All thirty sprites remain RGBA with alpha range 0–255 and byte-identical to their approved commits.
- Automated component tests cover all ten buildings at every level, no sprites at level zero, unchanged approved geometry, original middle-tier reuse, EN/Serbian labels and selection.
- Browser replay used actual reward, supply, construction and upgrade controls. All **47 transitions** from the initial three buildings to all ten at level five updated scene and detail sprites without reload. No browser exceptions.
- Keyboard Enter selection, Tab navigation and focus restoration after closing details passed. At 390px, the separate selector pans to the selected plot, keyboard horizontal panning works, and the page has no horizontal overflow.
- Actual initial state contains only Town Hall, Farm and Sawmill. Whole-village comparison scenes are separate review fixtures, not gameplay state.
- Production `/__realm-preview` returned HTTP 404 on both Vercel and Netlify before release; see `production-routes-before.json`. Post-merge verification is reported with the release.

The gameplay model, economy, rewards, hero progression, exploration, terrain, placement, roads and draw order are unchanged from main. No Supabase, persistence, authentication or real-user-data integration changes. The fictional 900-coin cap remains provisional and must be reassessed before connecting real accomplishments.

## Evidence and limits

`browser-results.json` records every transition and interaction check. Screenshots show the actual simulated level-five preview on desktop and mobile. The approved overview package contains all three stages and mobile west/center/east views. Visual tiers intentionally share artwork at levels 1–2 and 3–4. Mobile checks use desktop Chromium emulation, not physical-device testing; screen-reader semantics are tested without a full assistive-technology audit.
