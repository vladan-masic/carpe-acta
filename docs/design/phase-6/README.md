# Phase 6 — Milestones and Exploration

Ready for visual review, October 12, 2026. No commit, push or deployment.

## Checkpoint and preview

- Started with a clean working tree at approved Phase 5 commit `597d827774b66c341992f04483cbb288b2b74097`. The remote `codex/activity-history` ref was verified to match before branching.
- Work is on `codex/milestones-exploration`.
- Local review: [achievement showcase](http://127.0.0.1:5182/__achievements) and [real application](http://127.0.0.1:5182/).
- To restart: `npm run dev -- --host 127.0.0.1 --port 5182`.
- The showcase renders the actual four components with deterministic in-memory records and the existing calculation functions. Language, theme, empty, loading and error controls are provided. Its retry/discovery callbacks report the requested action; actual application navigation was tested separately. No account connection or sample-record persistence.
- Vite removes the showcase route and sample content from production. Existing Phase 0, support and activity previews remain intact.

## What changed

| Area | Presentation | Preserved behavior |
| --- | --- | --- |
| Personal milestones | Illustrated notebook-and-pencil / botanical stamps; two clearly separated progress entries; earned and upcoming collection sheet | Exact thresholds, ongoing thresholds, lifetime actions, distinct active days, disclosure, quiet loads/imports and Undo |
| Personal Best | Sunny-path emblem, prominent record, quieter date and explanatory note | Best Monday–Sunday week, earliest tied week, nonconsecutive days, loading/empty/error/retry |
| Category Exploration | Signpost-and-path miniature, collected discovery stamps, existing category icons, discovered labels and a named next-category marker | All 21 categories, targets, order, disclosure and filtered-library navigation |
| What Helps Me | Bookmarked journal entries, editorial titles, separated feedback and timestamps | Recency ordering, mixed feedback counts, retired-tip fallback, expansion and exact retry target |

Only presentation components, a scoped stylesheet, one reusable decorative SVG component and a development preview were changed. No hooks, calculation utilities, catalog data, localization strings, storage, authentication or backend code changed. No dependencies added.

## Relationship to the references

The Phase 0 Notebook and Adventure comparisons and original moodboards guided this work. The earlier UI used text chips for nearly all accomplishments, with little distinction between the record and its supporting detail. Phase 6 adds small illustrated objects, irregular printed rims, soft colour washes, notebook collection spacing and bookmark details. These connect completed actions, gradual growth and discovery while keeping the numerical information explicit.

The new SVGs are intentionally simple miniatures, not a claim to reproduce the rich painted mockups. All four share one outline, wash and paper vocabulary. Upcoming stamps remain visible as pencil studies with explicit “Not yet earned” captions; inactivity does not erase earned achievements. No new milestones, streaks, celebration effects or decorative metrics were introduced.

## Screenshots

Before and after use the same sample data and expanded disclosures.

| View | Before | After |
| --- | --- | --- |
| Desktop, English/light | [Before](screenshots/before-desktop-en-light.jpg) | [After](screenshots/after-desktop-en-light.jpg) |
| 390px, English/light | [Before](screenshots/before-mobile-en-light.jpg) | [After](screenshots/after-390-en-light.jpg) |

Additional review captures:

- [Illustrated stamp sheet and Personal Best close-up](screenshots/stamps-desktop-closeup.jpg)
- [Discovery composition](screenshots/discovery-reflection-desktop.jpg)
- [What Helps Me close-up](screenshots/reflection-desktop-closeup.jpg)
- [320px Serbian/dark, complete view](screenshots/after-320-sr-dark.jpg)
- [320px stamp details](screenshots/stamps-320-sr-dark.jpg)
- [320px keyboard focus](screenshots/focus-320-sr-dark.jpg)
- [320px Serbian journal entries](screenshots/reflection-320-sr-dark.jpg)
- [390px Serbian/light](screenshots/after-390-sr-Latn-light.jpg) · [Serbian/dark](screenshots/after-390-sr-Latn-dark.jpg) · [English/dark](screenshots/after-390-en-dark.jpg)
- [Tablet Serbian/dark](screenshots/after-tablet-sr-dark.jpg)
- [Desktop Serbian/light](screenshots/after-desktop-sr-light.jpg) · [English/dark](screenshots/after-desktop-en-dark.jpg)
- [Empty mobile state](screenshots/empty-mobile-en-light.jpg)

## Validation

- Baseline: **354 tests / 43 files passed**; production build passed.
- Final: **354 tests / 43 files passed**; TypeScript and production build passed; `git diff --check` passed.
- Existing tests cover milestone thresholds and extended ladders, nonconsecutive active days, local dates/DST, quiet initial loads/imports, completion/Undo, account isolation, import IDs/timestamps, weekly record ties, all-category exploration, library focus/filter reset, helpfulness ordering, retired tips and retry/expansion in both languages.
- Real-browser application smoke checks: completion created the first action/day milestones and weekly record; helpful feedback appeared in What Helps Me; Undo removed the event/feedback and restored the empty achievement states. Discovery opened the Focus-filtered library, focused search and preserved the active tip.
- Empty/loading/error states and retry recovery inspected in the showcase. Helpful actions expanded from five to eight examples and retry targeted the correct tip.
- 320, 390, 768 and 1440 CSS-pixel widths checked in **both languages and both themes**. No horizontal page overflow in the 16-case matrix; [measurements](screenshots/responsive-checks.json). Mobile stamp collections use two columns; controls remain separate from illustrations.
- Keyboard disclosure works with Enter; focus uses the existing visible 3px ring. Inspected mobile control targets are at least 44px high. Decorative SVGs have `aria-hidden="true"` and `focusable="false"`; meaningful information remains localized text. List semantics are explicit.
- Existing palette roles retained. Main text, muted text, green and blue text on the paper surface exceed 4.5:1 in both themes. Existing reduced-motion rules remain intact; Phase 6 adds no animations or transitions.
- No preview console errors or warnings observed. Showcase strings/routes absent from the generated production JS.

The existing >500 kB JS chunk warning remains. Gzipped production JS grew from 193.16 to 194.85 kB; CSS from 12.59 to 13.80 kB. No image downloads or new font assets were added.

Account/import checks use the existing automated mocks; no live account data or hosted backend was modified. Browser inspection is not a substitute for testing every browser or a full assistive-technology audit. Reduced-motion preservation was reviewed in CSS, not through an OS preference toggle.

## Visual decisions for review and future artwork

Please review the stamp drawing style, the balance between visible progress and the optional collection, and Personal Best’s larger sunny-path emblem. The category markers reuse the approved icon system rather than adding 21 competing illustrations.

For the dedicated art-direction phase, commission four small matching transparent editorial miniatures: an open notebook with pencil and sprig, a potted growing plant, a sun over a winding hillside path, and a modest wooden trail sign. Preserve the current silhouettes, low-contrast cream/sage/ochre washes and fine imperfect graphite/terracotta lines. Provide light-paper and dark-paper proofs at 64, 96 and 152px; keep artwork free of baked-in text or numbers. If painted versions are used, target roughly 10–20 kB per WebP and retain textual states outside the art. Higher milestone-specific art can be considered later without changing thresholds. No large landscapes or extra illustration collection is needed in this phase.

Stop here for Phase 6 approval. Phase 7 is not started.
