# Phase 5 — Activity and history

Ready for review on `codex/activity-history`, based on approved Phase 4 commit `4889d3d`. The checkout was clean and matched `origin/codex/guided-support` at the start. Phase 5 is uncommitted, unpushed and undeployed; no Phase 6 work is included.

## Visual direction

The original Illustrated Notebook mockups connect progress to illustrated paper entries, small marks and botanical life. The production progress area previously consisted mostly of plain text, a thin bar, small heatmap squares and ruled list rows. The Phase 0 Adventure example introduced growth imagery but treated it as a faint background.

This phase gives the existing `gradual-growth.webp` a deliberate place beside the weekly numbers: a visible pencil illustration, separated from the progress information. It remains unchanged when the goal is off, the week is empty or an action is undone. It is not a plant-health or streak metric. A small crop occupies the mobile heading margin rather than creating a tall separate picture.

The weekly entry combines Fraunces numerals, actual active-day wording, a sage indicator and seven softly shaped day markers. The calendar uses date numerals and gently irregular stamp-like cells. Completed records follow a notebook timeline, with consistent marks connecting entries rather than invented milestones. Feedback, timestamps and retired-tip titles remain visible.

These changes bring more illustration and journal composition to the product. They do not reproduce the mockups' simplified monthly calendars, fictional metrics or achievement systems.

## Implementation and preserved behavior

- WeeklyGoal retains all hooks/calculations, off plus 1–7 day settings, storage/error states and achieved-week history. The large number repeats the actual active-day count and is hidden from assistive technology because the original status sentence already announces it. The native progress element still caps its fill at the target.
- ActivityCalendar retains its complete 12-week and annual ranges, local dates, counts, selected dates, future placeholders, roving tab stop and arrow/Home/End behavior. Date numerals are decorative to assistive technology; full date/count labels remain unchanged.
- Calendar targets are **44×44 CSS pixels in both modes**. Overflow stays inside the calendar. The 12-week view now includes a short English/Serbian scrolling hint; the existing annual hint remains.
- Calendar activity uses a sage scale with separate readable foreground colors. Today retains a terracotta border/underline; selected dates have an inset ring and checkmark. Focus remains distinct.
- History gains a named section and presentation styles. Its name follows the current heading, including a selected historical date. Record order, timestamps, feedback, filtering and retired-tip fallback remain unchanged.
- No behavioral hooks, utilities, catalog, authentication, completion API, schemas, dependencies or previous phase stylesheets changed. No autonomous motion was added. Existing reduced-motion handling remains.
- A development-only `/__progress` route provides representative records through real components and calculations. No account connection or completion-record writes. Goal preferences and weekly-achievement calculations use the preview origin's normal browser storage, so use the dedicated localhost port for review. The sample Add/Undo buttons change only in-memory records; actual application completion/Undo was also checked separately.
- The fixture and its strings are absent from the production bundle. Existing `/__design` and `/__support` previews remain available.

## Validation

Baseline: **352 tests in 43 files passed**, production build passed. No pre-existing test failures.

Final: **354 tests in 43 files passed**, production build and `git diff --check` passed. Added bilingual leap-day coverage ensures visible date numerals do not replace full date/count accessibility labels or remove dates. Existing tests cover weekly active-day deduplication, Monday boundaries, DST/year boundaries, storage/account isolation, goal changes, annual navigation, selected-day filtering, retired records, completion and Undo.

Browser verification:

- Every goal setting 1–7 and Off; Off removes the progress bar. An extra completion on an already-active day changes actions from 5 to 6 while active days remain 4; removing it restores 5 actions.
- Actual app guest completion updated weekly goal, calendar and history; Undo removed the test record and restored zero active days/history. No account was used.
- Twelve-week selection shows the exact matching records and helpfulness data. ArrowLeft moved seven days, Enter selected an empty day, and Show recent actions restored focus to the history heading.
- Annual mode, previous year, retained June 2025 record, Ctrl+Home/End and future-navigation bounds checked. Keyboard focus scrolls the relevant cell into the internal viewport.
- English/Serbian, light/dark, 320px, 390px, 768px and 1440px inspected. No page-level horizontal overflow observed. At 320px, the calendar viewport was 255px wide while its 639px content scrolled internally; cells stayed 44px.
- Actual mobile Menu → Progress closed the menu and focused `completed-actions-title` without covering the new controls.
- New date-number text contrast ranges from **5.07:1 to 12.77:1** across the ten light/dark activity fills. This is a token calculation, not a full accessibility certification.

Final build: main JS **646.41KB / 193.16KB gzip**, CSS **69.13KB / 12.59KB gzip**. The existing >500KB JS warning remains. The existing growth image is now included in production at **25.72KB**; no new raster asset, font or dependency was created.

Limits: in-app Chromium testing, not physical-device or cross-browser certification. Screen-reader behavior, OS forced-colors and OS reduced-motion were not manually exercised; semantics/styles were reviewed and regression tests pass. Signed-in account flows were covered by the existing tests rather than manually using an account.

## Local review

- [Application](http://127.0.0.1:5180/)
- [Progress review with sample records](http://127.0.0.1:5180/__progress)

The screenshot fixture contains sample records, not the user's history. Before/after comparisons use the same underlying sample records. Achieved-week totals can vary in later state captures after exercising the real goal settings. Complete mobile captures include all weekly, calendar and history content vertically; horizontally offscreen calendar dates are intentionally reached through internal scrolling.

| View | Before | After |
| --- | --- | --- |
| Complete desktop, English light | [Before](screenshots/before-desktop.jpg) | [After](screenshots/after-desktop-en-light.jpg) |
| Complete mobile, 320px English light | [Before](screenshots/before-mobile-320.jpg) | [After](screenshots/after-mobile-320-en-light.jpg) |

Additional review states:

- [Weekly illustration close-up](screenshots/after-weekly-closeup.jpg)
- [320px Serbian dark, complete progress](screenshots/after-mobile-320-sr-dark.jpg)
- [390px Serbian light, complete progress](screenshots/after-mobile-390-sr-light.jpg)
- [390px Serbian dark, complete progress](screenshots/after-mobile-390-sr-dark.jpg)
- [Tablet Serbian light](screenshots/after-tablet-sr-light.jpg)
- [Desktop Serbian dark](screenshots/after-desktop-sr-dark.jpg)
- [Annual desktop calendar, Serbian dark](screenshots/after-desktop-year-sr-dark.jpg)
- [Annual calendar selection at 320px](screenshots/after-mobile-year-selected.jpg)
- [Mobile calendar keyboard focus](screenshots/after-mobile-calendar-focus.jpg)
- [Selected empty day](screenshots/after-selected-empty-day.jpg)
- [Empty history](screenshots/after-empty-desktop.jpg)
- [Actual app after completion/Undo](screenshots/actual-app-mobile-progress.jpg)

## Future artwork

The current growth asset works as a small pencil study. For a richer later illustration pass, commission a compact transparent botanical vignette with two or three healthy growth forms, a companion short winding-path mark, and light/dark treatments. Keep the same terracotta/sage/ochre pencil-watercolor vocabulary, no embedded words, no declining plants and no numerical progress meaning. A purpose-composed small asset would preserve leaf detail better than cropping a wide background. A larger SVG illustration set was considered but deferred: generic vector plants would weaken the existing hand-drawn style.

Review priorities: botanical visibility, weekly-card height, the larger scrollable calendar, date-state clarity and the timeline's reading rhythm. Stop after Phase 5 for approval before committing, pushing or deploying.
