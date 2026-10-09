# Phase 0 — Carpe Acta visual comparison

Status: ready for visual review. No production redesign, deployment, migrations, account changes or catalog edits.

## Open the experiment

From the repository root:

```sh
npm run dev -- --host 127.0.0.1
```

Open `/__design` on the local address printed by Vite. The review server for this session is **http://127.0.0.1:5174/__design** (5173 was already occupied). `/` remains the current application. A production build does not contain the experiment; `npm run preview` consequently shows the current application at this path too.

Use A/B/C to switch treatments, the theme and language selectors to compare light/dark and English/Serbian, and **Reset sample** to restore the identical initial content. Switching design, theme or language preserves the selected tip, local favourite and running timer. Generating a new tip uses the real selection hook; reset before comparing screenshots of the same content.

The studio toolbar and sample notices are review tools, not proposed product navigation.

## Shared representative interface

Every treatment uses the existing emblem, hero copy, Daily Quest component, Tip Card, favourite button, Help Me Start component, localized catalog and timer engine. The fixed starting examples are **Two-Minute Start** (Focus, 2 minutes) and **Name the Next Visible Step** (Planning). All 21 existing categories are available through Show categories. Nothing is borrowed from the mockups' invented categories, navigation or metrics.

The weekly example illustrates the existing **active-day goal**: 3 of 4 days, with three marked weekdays. It is explicitly illustrative, does not calculate progress, and does not respond to sample completion. It is not a quest count or streak.

Favourites and completion/undo live in React memory only. Timer expiry does not complete a tip. Timer alerts, notifications, audio and persistence are deliberately outside this visual slice. Library, history and account features remain in the current application.

## Compare the directions

| Decision | A — Playful Momentum | B — Illustrated Notebook | C — Optimistic Adventure |
| --- | --- | --- | --- |
| Typography | Strong Inter headings; Fraunces for the motto | Fraunces headings and action sentence; Inter controls/body | Fraunces headings; Inter action sentence and controls |
| Atmosphere | Graphic, warm, energetic | Quiet paper, editorial rules and pencil details | Airy, botanical, encouraging |
| Current action | Terracotta outline and offset shadow; highest immediate contrast | Top accent rule, paper edge and larger serif instruction | Terracotta top edge, soft elevation and warm instruction inset |
| Surfaces/radii | 22px cards, 12px buttons | 5px card/button corners, pill categories | 24px cards, pill buttons, asymmetric leaf detail |
| Colour | Terracotta selected category/action; sage progress | Mostly ink/paper, selective action/support accents | Green journey/progress, terracotta action, warm support |
| Motifs | Small directional marks and rotated category tile | Imperfect underline, stamp-like Daily label, pencil strokes | Sun, seedlings, dotted path; existing growth image under progress |
| Density | Most compact of these three desktop compositions | Moderate; generous reading rhythm | Most spacious desktop composition |
| Strength | Makes the next action easiest to locate | Strongest distinctive, human brand foundation | Strongest sense of reassurance and gradual growth |
| Limitation | Repeated strong outlines would become tiring across the full app | Serif instructions take more vertical space on mobile; paper marks need restraint | More scrolling; decorative motifs require careful cropping and dark treatment |
| Relative integration cost* | Low–medium: mostly tokens, scoped card/control styling and icon mapping | Medium: display font strategy, editorial surface hierarchy and a small motif vocabulary | Medium–high: additional illustration placement, responsive art direction and dark equivalents |

*Relative estimates for a later approved rollout, not time commitments. All approaches still require reviewing every existing feature and state. No functional refactor is justified merely by selecting one of these appearances.

**Recommendation:** use B as the foundation; borrow A's stronger current-action boundary and clear control hierarchy; use C's seedlings/path only around the hero and progress. Keep the action instruction in Inter where long Serbian text benefits from compact reading. Retain Fraunces for the brand and major headings. Use modest corners (roughly 10–16px) for most production cards, with a slightly softer current-action surface, rather than applying any variant's radius everywhere. Treat this as a direction for approval, not an implemented fourth design.

For the full application, reserve notebook stamps for existing milestones and journey landmarks for real progress states. Do not add reward systems or invented destinations. C's reduced image intensity illustrates atmosphere; the preview does not claim to settle a full illustration system.

## Screenshots

Full-page captures from a Chromium-based browser. Desktop viewport: 1440 × 1000; mobile: 390 × 844. JPEG content captures omit the 15px scrollbar. All captures use the same English starting content and idle timer. Longer Serbian content was checked separately at 320px.

| Treatment | Desktop light | Mobile light | Desktop dark | Mobile dark |
| --- | --- | --- | --- | --- |
| A | [Desktop](screenshots/a-desktop-light.jpg) | [Mobile](screenshots/a-mobile-light.jpg) | [Desktop dark](screenshots/a-desktop-dark.jpg) | [Mobile dark](screenshots/a-mobile-dark.jpg) |
| B | [Desktop](screenshots/b-desktop-light.jpg) | [Mobile](screenshots/b-mobile-light.jpg) | [Desktop dark](screenshots/b-desktop-dark.jpg) | [Mobile dark](screenshots/b-mobile-dark.jpg) |
| C | [Desktop](screenshots/c-desktop-light.jpg) | [Mobile](screenshots/c-mobile-light.jpg) | [Desktop dark](screenshots/c-desktop-dark.jpg) | [Mobile dark](screenshots/c-mobile-dark.jpg) |

## Isolation and implementation

- `src/main.tsx`: an `import.meta.env.DEV` branch loads the showcase only on the exact `/__design` path. No router dependency or new default screen.
- `src/dev/design/DesignPreview.tsx`: one shared component tree, local review controls and sample state. Actual selection and timer hooks are reused; stateful behavior is not cloned three times.
- `src/dev/design/preview.css`: scoped `.p0` styles and `data-variant` treatments. Production `src/styles.css` is unchanged.
- `src/dev/design/Illustrations.tsx`: decorative SVG motifs and one consistent stroke vocabulary mapped to the existing category IDs. All icons retain textual labels; decoration is hidden from assistive technology.
- `src/dev/design/fonts/`: locally hosted, licensed WOFF2 font subsets. No package/dependency changes.
- `tests/design-preview.test.tsx`: comparison-state preservation, absence of storage/network writes, real guided selection/category coverage, and separation of timer expiry/completion/fixed progress.

The preview imports production styles and components deliberately so that their real content/semantics remain visible. Its stylesheet is an experiment, not a proposed replacement production stylesheet. After selecting a direction, move approved tokens and component changes in small increments; do not copy this override layer wholesale.

## Typography and accessibility

Inter is variable-weight WOFF2; Fraunces is limited to weight 600. Latin and Latin Extended subsets total **168,756 bytes** (about 165 KiB) before transport compression. They are local, use `font-display: swap`, and fall back to Inter/system sans-serif or Georgia/serif. Their glyph coverage includes **Čč Ćć Žž Šš Đđ**, verified with `fc-scan`. Both families are under the SIL Open Font License, included beside the font files. Fonts were obtained from Google's official font hosting; upstream licenses: [Inter](https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt), [Fraunces](https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt).

The original terracotta remains the illustration/accent colour. Filled action buttons use a darker related terracotta (`#ac3e1c`) for readable white text. Text-pair calculations across the tested surface tokens have minimum ratios of **5.26:1 in light** and **5.83:1 in dark**. Tested input/control boundary tokens have minimum ratios of **3.35:1** and **4.00:1** respectively. These are token calculations, not certification of every composited pixel.

Controls retain native button/select semantics, visible focus rings and 44px minimum heights. Selection has a checkmark/pressed state as well as colour. Timer reset restores focus to its main button; undo restores focus to the active tip heading. No timer tick is announced as a live update. Completion uses the existing status region.

New 160ms colour transitions and a 300ms completion acknowledgement are enabled only under `prefers-reduced-motion: no-preference`; reduced-motion users receive immediate state changes. Decorative artwork has no autonomous animation. Forced-colour styling removes decoration and outlines selected controls. Reduced-motion and forced-colour handling were reviewed in CSS; this session did not emulate those OS modes or run a full screen-reader audit.

## Verification — 9 October 2026

Before implementation:

- `npm test`: **334 passed, 39 files**.
- `npm run build`: passed. Pre-existing warning: main JavaScript bundle exceeds 500 kB.

After implementation:

- `npm test`: **338 passed, 40 files**.
- `npm run build`: passed, with the same pre-existing bundle-size warning.
- Production output has the same JS/CSS asset hashes as baseline: `index-Cci7Ebqc.js`, `index-WQHYqFXV.css`. The experiment's strings, CSS selectors, font assets and extra illustration are absent from `dist`.
- `git diff --check`: passed.
- Browser checks: all three variants at desktop and mobile; light/dark; 768px tablet; Serbian long category labels at 320px without horizontal overflow; expanded categories and Help Me Start; keyboard timer/reset/completion/undo; no preview console warnings/errors observed.
- The default `/` route still displays the existing Serbian application and its account, library, history, calendar and progress controls.

Limitations: these are visual prototypes of representative features, not exhaustive full-app redesigns. Cross-browser/device testing, screen-reader testing and all authenticated/error/empty states remain work for the approved implementation phase. Prototype shadows, radii and decorative details should be evaluated in the local preview before selecting a direction.

Phase 0 stops here for review. Phase 1 has not started.
