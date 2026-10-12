# Phase 7.5C-1 — Hero illustration review

Stage 1 only, ready for visual review. No commit, push or deployment.

## Scope and baseline

Branch: `codex/hero-illustration`, based on approved `9a190a3fb6ed45ff6949819e27d2f4ee3468ad3b`; remote state was verified before implementation. The existing uncommitted Phase 7.5A audit is preserved.

Only App hero markup, introduction-owned CSS and obsolete hero background rules changed. Daily Quest, text, emblem, links, selection, timers, completion, accounts and the Phase 0 comparison remain intact.

## Composition

The approved landscape is now a clearly visible framed paper illustration beside the branding and Daily Quest. It retains its pencil detail and warm colours in both themes. Removing the redundant hero card and faded background gives the painting more space without placing text over it.

Desktop uses the whole landscape. Intermediate widths place it beside Start below the introduction. Mobile uses a small deliberate sunrise/path detail beside Start, omitting the outer foliage and signpost. This is closer to the mockups' illustrated warmth, but deliberately less immersive than their large edge-to-edge landscapes. The framing and compact mobile crop are the primary artistic review decisions.

## Source preservation and exports

The original ZIP remains at `/home/vladan/Downloads/carpe_acta_phase_7_5c_approved_artwork.zip`. All six original PNGs are extracted unchanged in `.cache/approved-artwork-7-5c/approved-artwork/` (already ignored by Git). Retain the ZIP for future stages; the cache is not a versioned backup. Only the hero is integrated.

Production exports in `src/assets/illustrations/`:

| File | Dimensions | Bytes | Export |
|---|---|---:|---|
| hero-path-720.webp | 720×360 | 55,154 | Full source, quality 82 |
| hero-path-1200.webp | 1200×600 | 96,296 | Full source, quality 70 |
| hero-path-detail.webp | 336×216 | 15,124 | Crop (650,210,1490,750), quality 82 |

Pillow RGB conversion, Lanczos resize, WebP method 6. No source painting edits or new artwork. Hero source SHA-256: `ba4f47e3c634071f69b03a88ec13cd37c2258cd99fe9589f9a0c05f695bc3b06`.

The picture element selects the mobile detail below 821px; desktop uses responsive 720/1200 candidates. Total alternatives are 166,574 bytes, not a per-view download. Dimensions/aspect ratios reserve space; eager loading is appropriate for the opening image. No PNG masters enter the build. The old small-steps asset remains available but its redundant production hero background is removed.

## Validation

- Baseline and final full suite: **356 tests across 43 files passed**.
- Production TypeScript/Vite build passed; existing >500 kB JavaScript chunk warning remains.
- Final JS 654.61 kB (gzip 196.08), CSS 88.57 kB (gzip 15.09); baseline JS 654.07 / gzip 195.83, CSS 87.85 / gzip 14.99.
- Desktop 1440px, mobile 390px and 320px: English/Serbian, light/dark checked. Tablet 768px and 1024px checked in Serbian dark mode.
- No horizontal page overflow observed. Image source selection confirmed at mobile/tablet and desktop breakpoints.
- Start activated by keyboard still focuses `tip-generator` with visible focus. Decorative picture is hidden from accessibility, has empty alt text and cannot intercept input. No new animation; existing reduced-motion rules unchanged.
- Approximate opening increase: 20px desktop, 24px mobile. Existing generator remains directly below Daily Quest.
- No new dependency, backend, persistence, localization or business-logic changes.

## Screenshot comparisons

Screenshots include the opening and its relationship to the generator. Actual CSS widths were checked separately from browser capture scaling; see `screenshots/layout-checks.json`.

- 1440px / en / light: [Before](screenshots/before-1440-en-light.jpg) · [After](screenshots/after-1440-en-light.jpg)
- 1440px / en / dark: [Before](screenshots/before-1440-en-dark.jpg) · [After](screenshots/after-1440-en-dark.jpg)
- 1440px / sr-Latn / light: [Before](screenshots/before-1440-sr-Latn-light.jpg) · [After](screenshots/after-1440-sr-Latn-light.jpg)
- 1440px / sr-Latn / dark: [Before](screenshots/before-1440-sr-Latn-dark.jpg) · [After](screenshots/after-1440-sr-Latn-dark.jpg)
- 390px / en / light: [Before](screenshots/before-390-en-light.jpg) · [After](screenshots/after-390-en-light.jpg)
- 390px / en / dark: [Before](screenshots/before-390-en-dark.jpg) · [After](screenshots/after-390-en-dark.jpg)
- 390px / sr-Latn / light: [Before](screenshots/before-390-sr-Latn-light.jpg) · [After](screenshots/after-390-sr-Latn-light.jpg)
- 390px / sr-Latn / dark: [Before](screenshots/before-390-sr-Latn-dark.jpg) · [After](screenshots/after-390-sr-Latn-dark.jpg)
- 320px / en / light: [Before](screenshots/before-320-en-light.jpg) · [After](screenshots/after-320-en-light.jpg)
- 320px / en / dark: [Before](screenshots/before-320-en-dark.jpg) · [After](screenshots/after-320-en-dark.jpg)
- 320px / sr-Latn / light: [Before](screenshots/before-320-sr-Latn-light.jpg) · [After](screenshots/after-320-sr-Latn-light.jpg)
- 320px / sr-Latn / dark: [Before](screenshots/before-320-sr-Latn-dark.jpg) · [After](screenshots/after-320-sr-Latn-dark.jpg)

Tablet: [768px Serbian dark](screenshots/after-768-sr-Latn-dark.jpg) · [1024px Serbian dark](screenshots/after-1024-sr-Latn-dark.jpg).

## Remaining trade-offs

The compact mobile illustration sacrifices peripheral scenery to preserve access to the action. Dark mode intentionally retains a bright parchment object; review its visual prominence. This was local browser/layout verification, not a measured production-network LCP study. The existing large JavaScript chunk is outside this stage. No other approved illustration has been integrated.
