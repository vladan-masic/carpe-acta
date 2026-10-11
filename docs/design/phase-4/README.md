# Phase 4 — Guided support

Review candidate on `codex/guided-support`, based on approved Phase 3 commit `f1bc005`. No Phase 4 commit, push or deployment. No Phase 5 work.

## Direction and reference comparison

The original notebook/bloom/adventure mockups use prominent editorial illustrations, overlapping paper and richer foreground/background composition. The existing production UI has stronger typography and consistency, but remains more regular and card-based. Phase 0's notebook comparison also has relatively sparse illustration; copying it alone would not achieve the original moodboards' richness. The original images were reviewed from the conversation (the old Downloads paths are no longer available), along with the repository's Phase 0 notebook screenshot and source.

This phase makes one purposeful illustration visible inside the support interaction: the existing pencil, unfinished circle and practice marks in `imperfect-start.webp`. It represents beginning before everything is perfect. A warm notebook page, double margin, paper edge, editorial questions, ochre selection marks and small icons give it a clearer visual identity. The image has no independent height on desktop; on mobile it occupies a small margin beside the introduction. The old background sketch is hidden while this panel is present, avoiding duplicate artwork.

Helpful actions now resemble saved notebook entries: a bookmark heading, readable action titles, short supporting instructions and retry arrows. The return message retains its already warm, nonjudgmental wording, with a small botanical line accent. These are deliberate steps toward the references, not a claim that the entire application now matches their illustration richness.

## Behavior and architecture

- All eight barriers, their labels/order and category mapping remain unchanged. Icons reuse the category vocabulary via each barrier's existing first mapped category.
- All four time choices remain: no preference, up to 1, 2 and 5 minutes. Time can still be selected before a barrier. A visually quieter second question guides the sequence without adding a wizard or hiding existing controls.
- Suggestions, smaller-action limits, timer/completion behavior and announcements are unchanged. Selected barriers have a checkmark and pressed semantics; time options retain pressed semantics and an emphasized lower border.
- Helpful ordering, first-five expansion, exact-tip retry and Escape focus restoration are unchanged.
- Return-gap, per-owner dismissal and completion suppression logic are unchanged.
- No changes to hooks, catalog, localization strings, accounts, completion data, backend, dependencies or the approved Phase 1–3 stylesheets. Phase 0 remains available.
- `guided-support.css` is scoped to the notebook design. Transitions are limited to 160ms color/border changes and only enabled when reduced motion is not requested.
- A development-only `/__support` route renders the actual HelpfulActionPicker and ReturnMessage with sample history. It makes no completion/account writes. ReturnMessage uses only its own `phase4-visual-preview` owner key for welcome suppression. This fixture and its strings were verified absent from the production bundle.

## Verification

Baseline: **350 tests, 43 files passed**; production build passed.

After implementation: **352 tests, 43 files passed**; production build and `git diff --check` passed. The two new bilingual keyboard tests traverse and activate every barrier and every time option. Existing tests cover all barrier/time pools, strict smaller-action behavior, empty matches, helpful ordering/expansion/retry and return-gap/dismissal rules.

Browser checks:

- All eight barriers produced valid suggestions in the running app; a 2-minute suggestion reduced to 1 minute and disabled further reduction with the existing explanation.
- English/Serbian, light/dark, desktop, 768px tablet, 390px and 320px mobile layouts inspected. No horizontal overflow observed. Long Serbian labels wrap; controls retain at least 44 CSS-pixel target sizing (small fractional values in browser geometry reflect scaling).
- Visible keyboard focus checked on time controls. Menu remains in page flow and does not overlay choices.
- Helpful fixture: first five entries, expansion to six, exact chosen title, Escape returning focus to trigger. Return fixture: localized welcome and dismissal.
- No new motion was introduced beyond preference-gated color transitions. Screen-reader semantics retained; no full screen-reader or OS reduced-motion emulation was performed.

Final production assets: JS **645.67KB / 193.05KB gzip**, CSS **60.69KB / 11.43KB gzip**. Existing >500KB JS warning remains; there were no pre-existing failing tests. No new raster asset or font is added. The reused pencil artwork is 24.81KB and was already bundled.

Limits: browser coverage is the in-app Chromium browser, not physical devices or a cross-browser certification. Authenticated account workflows were not manually re-exercised. The support panel is still scrollable at narrow widths; preserving eight readable choices and all time controls means the resulting Tip Card is below them. No automatic focus jump or forced scrolling was added on selection.

## Review locally

- Main app: http://127.0.0.1:5176/ — choose **Help me start**.
- History/welcome fixtures: http://127.0.0.1:5176/__support . Clearly marked sample content, development only.
- Original comparison: http://127.0.0.1:5176/__design .

## Screenshots

Screenshots show actual app interactions, except the explicitly labeled helpful/return fixtures. Different generated suggestions are expected; no tip data was changed for capture. Mobile images are viewport captures at different scroll positions so both choices and their relationship to the action are visible.

| State | Screenshot |
| --- | --- |
| Initial prompt, desktop light | [Initial](screenshots/desktop-initial-en-light.jpg) |
| Barrier and time selected, desktop light | [Selected](screenshots/desktop-selected-en-light.jpg) |
| Smallest suggestion and disabled smaller control | [Smallest](screenshots/desktop-smallest-action.jpg) |
| Desktop dark | [Dark](screenshots/desktop-en-dark.jpg) |
| English choices, 320px | [Choices](screenshots/mobile-320-en-choices.jpg) |
| English time controls and action, 320px | [Time and action](screenshots/mobile-320-en-time-action.jpg) |
| English choices, 390px | [Choices](screenshots/mobile-390-en-light.jpg) |
| English time controls and action, 390px | [Time and action](screenshots/mobile-390-en-time-action.jpg) |
| Serbian 320px light | [Light](screenshots/mobile-320-sr-light.jpg) |
| Serbian 320px dark | [Dark](screenshots/mobile-320-sr-dark.jpg) |
| Serbian time controls and action, 320px dark | [Time and action](screenshots/mobile-320-sr-dark-time-action.jpg) |
| Serbian 390px dark | [390px](screenshots/mobile-390-sr-dark.jpg) |
| Serbian tablet dark | [Tablet](screenshots/tablet-sr-dark.jpg) |
| Helpful actions and return message, desktop fixture | [Desktop](screenshots/helpful-return-desktop-en.jpg) |
| Helpful actions and return message, Serbian mobile dark fixture | [Mobile](screenshots/helpful-return-mobile-sr-dark.jpg) |

## Future illustration brief

A dedicated future pass would benefit from a compact transparent pencil/open-notebook vignette and a small seedling-to-path family in the original warm pencil/watercolor style. Deliver dark-friendly variants with clear silhouettes, restrained terracotta/sage/ochre and no embedded text. Current wide background assets can be cropped only so far; purpose-composed small vignettes would retain detail more effectively at mobile sizes. Do not add a separate illustration for every barrier or card.

Review priorities: the illustration's size/visibility, warmth of the notebook panel, mobile choice density, and whether saved-note entries feel sufficiently personal. Stop for Phase 4 approval before committing, pushing or proceeding.
