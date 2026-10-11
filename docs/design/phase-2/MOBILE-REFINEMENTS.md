# Phase 2 mobile refinements — 11 October 2026

Ready for review, based on the existing `3b30f6f` Phase 2 commit on `codex/current-action-experience`. These refinements are uncommitted. No push, deployment or Phase 3 work.

## Changes

- **Category selection at 600px and below:** one labeled native select replaces the expanded pill list. It contains the existing All option and all 21 categories in their existing order, with unchanged labels, IDs and selection callback. It supports native keyboard/type-ahead and platform touch pickers. Above 600px the existing icon pills and disclosure remain. Both presentations share the same controlled selection; CSS exposes only one at a time.
- **Mobile Menu at 1000px and below:** the existing toolbar now participates in document flow and scrolls away instead of floating over content. Its open panel also occupies document space. Existing Escape, outside dismissal, destination focus, language/theme and account controls remain unchanged. Desktop retains its sticky toolbar. The former fixed-toolbar top padding is removed.
- **Card spacing:** smaller mobile grid/divider gaps; fewer stacked margins around timer settings; no reserved blank line for an empty completion message. The live region remains mounted. Touch targets remain at least 44px. Timer optionality, completion order and handlers are unchanged.

A native picker was chosen over a quick-selection subset because it keeps every category equally available, avoids inventing priorities or another taxonomy, and adds no selection state or dependencies. It is less visually expressive than the desktop pills but much more compact when choosing a category on a phone.

The Menu tradeoff is deliberate: it is no longer always onscreen on mobile. The existing Back to top control returns to it. No broader navigation redesign was undertaken.

## Verification

- Complete suite: **346 tests, 42 files passed**. Production build passed. `git diff --check` passed.
- Two added bilingual tests exercise all 22 native options, exact names/IDs, selection callbacks and controlled value updates.
- Chromium checks: 320px Serbian light/dark; 390px English light/dark; English 320px; 600/601px breakpoint transition; 768px tablet and 1440px desktop. No page overflow.
- Keyboard Home/ArrowDown selection, visible select focus, timer start/pause/reset and dark focus ring checked. Expanded Serbian timer settings fit at 320px. DOM hit testing confirmed the focused timer button is unobstructed; the Menu was above the viewport while viewing the card.
- Desktop pill selection remained synchronized when resizing back to mobile. Desktop exposes 22 pill buttons, mobile exposes one combobox with 22 options.
- The full existing suite continues to cover timer expiry/additional time, completion/undo, favourites and Help Me Start. No business logic was changed.
- No new animation, colour tokens, typography, illustration assets or dependencies. The existing bundle-size warning remains.

## Updated screenshots

All show the real Two-Minute Start tip and the compact selector above the complete card.

| English, 390px | Serbian, 320px |
| --- | --- |
| [Light](screenshots/refinements/en-light-390.jpg) | [Light](screenshots/refinements/sr-light-320.jpg) |
| [Dark](screenshots/refinements/en-dark-390.jpg) | [Dark](screenshots/refinements/sr-dark-320.jpg) |

Local preview: http://127.0.0.1:5175/

## Review and limitations

Please review the compact native selector and the Menu scrolling away with the page. Native option menus look different across operating systems; physical iOS/Android picker and screen-reader testing remain outstanding. Browser verification used Chromium responsive viewports.
