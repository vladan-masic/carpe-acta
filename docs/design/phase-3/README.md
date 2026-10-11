# Phase 3 — Introduction and navigation

Review candidate, 11 October 2026. Branch: `codex/introduction-navigation`.
Phase 3 is uncommitted and has not been pushed or deployed. No Phase 4 work is included.

## Checkpoint and scope

The approved Phase 2 refinements were already committed as `4e78b84` (`Refine mobile current action layout and category selection`). The baseline passed 346 tests in 42 files and the production build. Pushing `codex/current-action-experience` confirmed that GitHub was already up to date; no duplicate checkpoint commit was needed.

Phase 3 adds one scoped stylesheet, small hero/Daily Quest markup changes, and four bilingual regression tests. The Phase 0 comparison, Phase 1 foundations, Phase 2 current action styles, behavioral hooks, tip catalog, localization strings, dependencies, account integration and persistence remain unchanged.

## Design changes

- **Hero:** a warm paper opening with the existing small-steps illustration, cream emblem mount and expressive heading. An existing localized Start label links directly to the generator and transfers keyboard focus to its heading. The artwork is decorative and creates no additional image height.
- **Daily Quest:** a small sun stamp, sage notebook margin, editorial title and compact category/save row. The existing category icon system is reused. This remains one date-selected suggestion, with the same favorite control and source attribution.
- **Navigation:** quieter links, a clearer utility divider, paper surface and consistent hover/active treatments. Start receives action emphasis; this is not scroll-position tracking. Existing destinations and menu/focus behavior are retained. The approved Phase 2 mobile menu remains in normal flow, not fixed over the Tip Card.
- **Footer:** existing onward-path artwork becomes more visible against charcoal, with a cream emblem, readable motto and restrained attribution rule. It retains its original content and links in both themes.
- **Mobile:** smaller emblem, tighter introductory spacing and a shared category/save row keep the opening compact. English generator heading starts at approximately 632px rather than 652px at 320px width, and 583px rather than 599px at 390px width. These measurements describe the current date-selected quest; longer daily content naturally varies. The direct Start link also bypasses the introduction.

## Verification

- Full suite: **350 tests passed in 43 files**.
- Production build: passed. The pre-existing JavaScript chunk warning above 500kB remains. Final main JS: 644.69kB / 192.78kB gzip; CSS: 53.82kB / 10.54kB gzip. No new dependency, font or raster image was added.
- `git diff --check`: passed.
- English and Serbian Latin inspected in light and dark themes; existing font loading and localized content retained.
- Inspected widths: 320, 390, 768, 1001, 1100 and 1440px. No horizontal overflow observed, including the toolbar breakpoint transition.
- Keyboard: hero Start focuses the generator; Browse tips opens the library and focuses search; Progress/Favorites focus their headings; mobile Escape closes the menu and returns focus to Menu. Visible focus checked in dark mode.
- Daily Quest favorite toggled on and back off; navigation count updated. Login dialog opened and closed without submitting credentials. No account data was changed.
- Added English/Serbian tests ensure the hero link does not replace the active action and Daily Quest retains its actual content, category, favorite callback and source disclosure without an invented progress tracker.
- No animation was introduced; existing reduced-motion handling remains untouched. Decorative artwork/stamp is hidden for forced colors and print.

Browser checks used the Codex in-app browser. Physical devices, other browser engines, a full screen-reader audit and authenticated account flows were not manually retested. The existing account/behavior tests remain passing. This is visual regression coverage, not a formal accessibility certification.

## Screenshot comparison

Before images come from the committed Phase 2 checkpoint; after images show this working tree. The Daily Quest is the same October 11 suggestion. Random generator suggestions can differ between sessions. Viewports are CSS sizes; captured image dimensions differ slightly because of browser capture scaling and scrollbar space. Mobile images show the entire viewport, not a cropped hero.

| View | Before | After |
| --- | --- | --- |
| Desktop, English light, 1440×900 | [Before](screenshots/before-desktop-en-light.jpg) | [After](screenshots/after-desktop-en-light.jpg) |
| Hero and Daily Quest close-up | [Before](screenshots/before-hero-quest-en-light.jpg) | [After](screenshots/after-hero-quest-en-light.jpg) |
| Mobile first screen, English, 320×800 | [Before](screenshots/before-mobile-en-320.jpg) | [After](screenshots/after-mobile-en-320.jpg) |
| Mobile first screen, English, 390×844 | [Before](screenshots/before-mobile-en-390.jpg) | [After](screenshots/after-mobile-en-390.jpg) |
| Mobile first screen, Serbian light, 320×800 | [Before](screenshots/before-mobile-sr-320.jpg) | [After](screenshots/after-mobile-sr-light-320.jpg) |
| Footer, desktop | [Before](screenshots/before-footer-desktop.jpg) | [After](screenshots/after-footer-desktop.jpg) |

Additional coverage: [Serbian dark mobile](screenshots/after-mobile-sr-dark-320.jpg), [Serbian dark tablet](screenshots/after-tablet-sr-dark.jpg), [Serbian dark desktop](screenshots/after-desktop-sr-dark.jpg).

## Visual review

Please assess the strength of the hero illustration, the sage Daily Quest stamp/margin, navigation emphasis and the more visible footer pathway. Dark-mode hero artwork is intentionally quieter to protect text readability. The first screen is more compact, but does not guarantee the active action appears above the fold at 320px; all existing introduction and daily content is preserved.

Local preview: http://127.0.0.1:5175/ . Stop here for Phase 3 approval before committing, pushing or starting Phase 4.
