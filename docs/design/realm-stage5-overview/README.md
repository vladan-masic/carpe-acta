# Whole-village progression review

2026-11-08. Approved final five-building progression committed as 2f9ae25 on codex/realm-town-hall-tiers. Earlier commits 33e2a89 (Town Hall), a261d43 (Farm) and 83509c3 (Sawmill, Workshop, Marketplace) are unchanged. Nothing pushed, merged or deployed.

This final review package was approved on 2026-11-09. It preserves the approved artwork and geometry; the release validation is recorded in ../../qa/realm-stage5/README.md.

## Review

Open `/docs/design/realm-stage5-overview/index.html` on the local Vite server.

- all-ten-comparison.png: ten rows, three columns covering Levels 1–2, Levels 3–4 and Level 5. Sprites are fitted into equal-height comparison cells; use the terrain views to assess actual relative village scale.
- terrain-level-1.png: all ten buildings use their Levels 1–2 artwork.
- terrain-level-3.png: all ten use their unchanged approved Levels 3–4 artwork.
- terrain-level-5.png: all ten use their approved Level 5 artwork.
- mobile-{west,center,east}-level-{1,3,5}.png: all three stages viewed at 390px with horizontal panning.
- browser-results.json: plot geometry and sprite URLs for all thirty terrain placements, plus browser errors and mobile width checks.

These are visual fixtures, not gameplay save states: all sites are shown constructed at a shared visual tier even where normal Town Hall/Workshop prerequisites would require mixed levels. No prerequisite or construction behavior was changed.

## Checks

The review renders the actual BuildingArtwork and VillageScene components. Browser checks confirm sixty sprite instances (thirty comparisons plus thirty scene placements), identical plot geometry across all three stages, no JavaScript errors and no page overflow at 390px. All twenty tier PNG exports retain recorded SHA-256 hashes, RGBA mode and alpha range 0–255. The ten original middle-tier sprites and terrain were not changed.

Visual inspection found consistent placement and clearances. The level-5 Mine remains in the rock district, Quarry crane stays within its plot and Tavern stays clear of the bridge corridor. Tier differences are deliberately detail-based and can be subtle at full-village/mobile scale. No art refinements were made during this overview step.

The committed implementation's preceding validation was 69 focused tests, TypeScript, production build and Realm-exclusion checks passing, with the existing bundle-size warning. This artifact-only step did not change implementation or rerun those suites. Browser rendering and asset-integrity checks were run for this overview.

Whole-village visual review approved. Release authorized on 2026-11-09 subject to the final validation gates.
