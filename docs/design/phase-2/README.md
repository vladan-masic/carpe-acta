# Phase 2 — Current Action Experience

**Latest:** [Mobile refinement review, 11 October 2026](MOBILE-REFINEMENTS.md). The original Phase 2 report below records the initial implementation.

Ready for visual review. Work is on `codex/current-action-experience`, based on the approved Phase 1 commit `824e67e`. Nothing has been committed, pushed or deployed. Phase 3 has not started.

## Preview

Run `npm run dev` and open the URL Vite reports. The current local preview is http://127.0.0.1:5174/. The original development-only comparison is still at `/__design`.

## What changed

- The active tip is a raised notebook entry: an expressive Fraunces title, a terracotta top edge, compact category/time metadata, and a lightly tinted action note with a small pencil stroke.
- Desktop places the action and its supporting copy beside a working margin containing the optional timer, completion and generation controls. At 820px and below they stack in the same logical DOM order. No content is removed or shortened.
- The timer now precedes completion in reading order, explicitly says **Optional / Po želji**, and uses a larger tabular readout with restrained running/expired colour states. Completion remains available without starting the timer. Expiry does not complete anything.
- Category selection uses a single lightweight SVG line vocabulary, shared with the card. All 21 names and IDs plus the existing All option remain intact. Labels stay visible, selected buttons retain `aria-pressed`, and icons are decorative to assistive technology.
- Completed saved/unsaved actions have a quiet sage treatment. Existing saving, failure, retry, feedback and undo messages/handlers are retained.

The implementation adds one scoped component stylesheet and one typed category icon component. It reuses Phase 1 tokens and fonts. No dependencies, font files or raster assets were added. The only new localized copy is the timer's optional label.

## Comparisons

Both comparisons use the real **Two-Minute Start** tip, not fabricated content. Desktop captures show expanded categories; mobile captures keep categories collapsed. The baseline runs directly from commit `824e67e` in a temporary copy. Screenshots retain the surrounding UI and may differ slightly in scroll framing.

| View | Phase 1 | Phase 2 |
| --- | --- | --- |
| Desktop, English, light, 1440px | [Before](screenshots/before-desktop.jpg) | [After](screenshots/after-desktop.jpg) |
| Mobile, English, light, 390px | [Before](screenshots/before-mobile.jpg) | [After](screenshots/after-mobile.jpg) |

Additional states:
- [English dark timer, paused](screenshots/after-desktop-dark-timer.jpg)
- [Serbian dark, 320px](screenshots/after-mobile-sr-dark.jpg)

## Verification

- Baseline: **340 tests / 41 files passed**, production build passed.
- Final: **344 tests / 42 files passed**, production build passed, `git diff --check` passed.
- Four new bilingual tests protect the optional timer's reading order, completion without a running timer, and every category's accessible name, selection state and callback ID.
- Existing timer tests cover pause/resume/reset, background catch-up, expiry, additional time, locale changes, reset focus, and no automatic completion. Existing tests also cover timer alerts, completion persistence/failure/retry/undo, favourites, explanations, sources and Help Me Start.
- Browser checks: English and Serbian; light and dark; desktop, tablet (768px), mobile (390px), and narrow mobile (320px). No page overflow was found, including expanded Serbian categories and alert settings. The existing activity calendar retains its own internal scrolling.
- Browser interactions: generation; start/pause/resume/reset; visible keyboard focus (3px theme-aware ring); reset focus restoration; saving/removing a favourite; manual completion and undo; Help Me Start and Something smaller. Test completion was undone and the test favourite removed. No account sign-in or backend edits were performed.
- Browser console had no warnings/errors during checks.
- SVGs are hidden from assistive technology; text labels, native buttons/details and existing live regions remain. No animation was added; Phase 1 reduced-motion and forced-colour rules remain intact.

Unchanged: `App.tsx`, hooks, tip catalog/translations, selection logic, persistence, authentication, backend integration, achievement calculations, Phase 1 tokens/fonts, and Phase 0 files.

## Cost and limitations

Final production JS: **643.48 kB / 192.47 kB gzip**, versus 640.72 / 191.42 at baseline. CSS: **45.78 kB / 9.49 kB gzip**, versus 39.61 / 8.67. The pre-existing >500 kB JS warning remains; no new build failures.

Manual browser validation used Chromium. Full screen-reader testing, Safari/Firefox, and OS-level reduced-motion/forced-colour emulation were not performed. Failure/retry, timer expiry/additional time and notification edge cases are verified by automated tests rather than forced live failures or notification permission changes. Authenticated account states were not exercised manually.

## Visual review requested

1. Does the editorial heading/action note make the current suggestion prominent enough?
2. Is the desktop working margin clear and balanced, including the optional timer above completion?
3. Does the mobile card feel sufficiently compact without losing breathing room?
4. Are the category icons and terracotta selected state recognizable and restrained?

The Help Me Start form, progress areas and broader motion/feedback design remain reserved for their later phases.
