# Stage 5A — Town Hall visual tiers

Development review, 2026-11-08. Based on approved main merge 8dee4dd (PR #37). No commit, push, merge or deployment for this stage.

## Art decision

The approved Stage 4B3 hall is reused byte-for-byte for levels 3–4. Its symmetrical wings, civic crest and bell tower suit an established hall. Two transparent edits of that original provide the missing tiers:

- Levels 1–2: simpler timber bell cote and entrance, two windows per wing, reduced visual presence.
- Levels 3–4: unchanged approved artwork.
- Level 5: refined stone entrance, pilasters, cornice and bell-cupola detailing; no added footprint or height beyond the approved envelope.

Generated with the built-in image tool using the approved hall as the edit reference; requested matching warm watercolor, cream plaster, terracotta, elevated perspective, soft lighting and genuine transparency. No terrain or other building sprites generated or edited. PNG originals are preserved without raster processing.

## Alignment

Placement remains x=48.5%, y=38.5%, envelope=18% × 9%, draw order=4. The approved footprint and terrain are unchanged. New alpha-bound viewports use the original hall's 2125:593 aspect and bottom-center registration. The early tier uses 86% of its fitted maximum height; transparent viewport padding, rather than changed coordinates, provides the smaller presence. All sprites preserve aspect ratio. Alpha >=16/255 bounds use the same framing convention as the approved baseline. Faint outer alpha residue is clipped by the SVG viewport as before.

The central doorway and front step stay at the shared bottom-center ground registration. Browser plot geometry is identical for all tiers. Visual inspection found no new intrusion into terrace steps, trees, roads or other envelopes. Level 5 is distinguished by detailing, not added mass; details are intentionally subtle at mobile scale and await visual approval.

## Review

Run Vite and open `/docs/design/realm-stage5a/index.html` for the comparison and three scenes. This review-only fixture uses the actual VillageScene renderer with all ten buildings constructed for context; it does not modify the live prototype state or gameplay.

- `tier-comparison.png`: side-by-side sprite comparison.
- `terrain-level-{1,3,5}.png`: desktop scenes on the unchanged terrain.
- `mobile-level-{1,3,5}.png`: 390px viewport, horizontally panned to Town Hall.
- `mobile-preview.png`: actual development preview at its initial state.
- `asset-validation.json`: RGBA/alpha checks, SHA-256, sizes and framing.
- `browser-results.json`: geometry, selected sources and page-width evidence.

## Validation

- 51 focused tests passed across artwork, preview and expansion suites, including English/Serbian selection, exact approved placement, unchanged nine sprites, tiers 1/2, 3/4 and 5, real construction and upgrade actions, Workshop prerequisites, maximum-level rejection and stable plot geometry.
- TypeScript passed.
- Production build passed; existing >500kB chunk warning remains.
- Realm-exclusion checks passed for original terrain, all ten baseline sprites and both new Town Hall sprites, including hashes and output reference checks. Production JS/CSS names remain unchanged.
- Both new exports are 2172×724 RGBA PNGs with alpha range 0–255.
- Desktop and mobile browser checks found no JavaScript errors; mobile document width equals the 390px viewport.
- Domain/economy/reward code, terrain, placement manifest and other nine assets have no changes.

The Town Hall starts at level 1 in the existing game. No new level-0 Town Hall construction mechanic was introduced. Construction coverage uses an initially empty Quarry and confirms its unchanged approved sprite appears on construction.
