# Homepage reconstruction — final release readiness

**QA decision:** ready for commit, push and deployment after release approval, with the verification limits below. No release-blocking findings remain. No commit, push or deployment was performed during the QA checkpoint.

## Approved release baseline — 2026-10-13

- Fresh release verification: production build and all 356 tests in 43 files passed.
- The approved visual stages are already merged into `main` through PR #23. This follow-up contains the final responsive-image correction and this QA record.
- Pre-release production / rollback commit: `5c114e5471b09acf005da7b757f8c0eb63774403`.
- Successful Vercel Production deployment: GitHub deployment `7034328162`, [immutable deployment](https://carpe-acta-6axku2svq-vladanmaske.vercel.app).
- Production alias: https://carpe-acta.vercel.app. Release uses the existing pull-request merge to `main` and automatic Vercel workflow.

## Validation results

| Check | Result |
| --- | --- |
| Branch / preservation | `codex/homepage-reconstruction`; clean at QA start, approved stages already in `3bc75ef`. Existing work preserved. |
| Full automated suite, after the QA fix | **356 tests passed in 43 files**. |
| Production build | TypeScript strict build and Vite production build passed. |
| Other configured checks | No separate lint, axe, Lighthouse or browser-integration command is configured. Existing component/integration, persistence and contrast tests ran in the full suite. `git diff --check` passed. |
| Production Chromium matrix | **16 combinations passed**: 320/390/768/1440px × English/Serbian × light/dark. English empty and Serbian populated disposable fixtures; expanded history, reflection, milestones, exploration and library checked. No page overflow or failed asset responses. |
| Guest journeys | All 21 categories, generation, all eight guided obstacles and four time choices, timer start/pause/resume/reset, completion/undo, saved-tip reload persistence, library/favourites search/filter/reset/open/remove, and simulated browser-storage failure passed. Single-tip categories correctly retain their only suggestion. |
| Daily Quest | Actual browser date mapped to the expected catalog ID; saving/removing the real quest passed. Date/time invariance is also covered by the suite. |
| Progress | Goal settings, 12-week/annual navigation, keyboard date selection/history, expanded milestones/Personal Best/exploration/reflection checked. Calculation and threshold semantics covered by the full suite. |
| Accounts / errors | Existing mocked tests passed for authentication, synchronization, explicit imports, owner isolation, failed/ambiguous saves, retries and error states. Live account writes were not attempted. |

## Accessibility and performance

- Production DOM checks found no missing form labels, unnamed buttons, duplicate IDs or images without alt attributes in checked states. One H1 is retained; section heading hierarchy and status/alert live regions were reviewed.
- Keyboard checks covered native modal dialogs and return focus, mobile-menu dismissal, Start focus, calendar arrows/selection, disclosure controls, library expansion and favourite removal. Browser chrome remains reachable through native dialog tabbing; underlying application controls do not receive focus while modal.
- Actual sampled dark text contrast: minimum **5.14:1**; visible 3px keyboard-focus rings: minimum **7.57:1** against surrounding surfaces. Completed disabled state: **8.49:1**. Existing automated light/dark contrast tests passed. Mobile calendar targets remain 44px; main action controls remain 48px. Reduced-motion checks showed automatic scrolling and disabled animation/transition rules.
- These are DOM, browser keyboard and measured-colour checks, **not a full screen-reader audit**. No axe runner was installed/configured. Native screen readers, Safari/Firefox and physical devices were not tested in this pass.
- All production illustrations are WebP, approximately 7.7–113.8 kB each. PNGs in the build are only the existing small emblem and favicons. No master PNGs, review screenshots, development preview modules or fixture markers ship in `dist`.
- Hero loading is eager; secondary art is lazy with explicit dimensions and decorative empty alt text. Corrected source selection was verified at all four widths, including 2× mobile density. Observed unprompted layout-shift totals stayed below 0.02 in local runs; this is not a field-performance measurement.
- Main JS: **655.91 kB / 196.39 kB gzip**, versus **654.53 / 196.02 kB** in an isolated build of pre-reconstruction `d94b0a3` using the same installed dependencies. Increase is about **1.4 kB (0.21%)**; the pre-existing >500 kB warning was not materially worsened. CSS is 133.95 kB / 21.04 kB gzip.

## QA changes and findings

- **Fixed, non-blocking:** responsive artwork hints still described a 160px image on wider mobile/tablet cards. Updated `ActionArtwork.tsx` and `TipCard.tsx` to select the appropriate existing WebP, including the desktop portrait crop. No artwork, layout, business rule, data or localization changes.
- **Release-blocking:** none found.
- **Important but non-blocking:** live authenticated end-to-end behaviour and actual screen-reader operation remain unverified beyond the mocked/DOM coverage described above.
- **Optional future improvement:** JavaScript code splitting and broader cross-browser/real-device performance testing. No performance refactor is required for this release.
- Repository review found no out-of-scope QA edits, untracked production assets, new debug/fixture code or private-key/secret-token pattern matches in tracked files. Production preview/fixture markers were absent. A pre-existing tracked `src/styles.css.orig` is unused and not emitted; it was left untouched.
- Fixtures and storage-denial simulation ran only in disposable browser contexts; external requests were blocked in the regression journeys. No ordinary profile, account or production data was changed. No schema/backend changes are needed.

Files changed during final QA: `src/components/ActionArtwork.tsx`, `src/components/TipCard.tsx`, and this report.
