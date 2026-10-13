# Stage C2 — responsive and dark theme review

The approved desktop composition is preserved. Mobile gets a compact illustrated opening, native category selection, comfortable action controls, stacked progress sections and full-width saved-tip cards. Tablet uses two progress columns. Dark paper surfaces retain the artwork's natural colours.

The calendar keeps both 12-week and annual views. Mobile dates are 44px targets; weekday labels remain visible while scrolling. The short view initially shows recent weeks. The scroll region is keyboard focusable and labelled in both languages.

## Screenshots

- [390px light — English, empty](mobile-390-light.png)
- [390px dark — English, empty](mobile-390-dark.png)
- [320px light — Serbian, empty](mobile-320-light.png)
- [1440px dark — English, empty](desktop-1440-dark.png)
- [768px light — Serbian, populated fixture with history and reflections expanded](populated-tablet-768.png)

## Validation

- Production build passed; existing warning for the JavaScript chunk exceeding 500 kB remains.
- 136 focused tests passed across 14 files, covering navigation, action/timer, progress/calendars, goals, milestones, Personal Best, exploration, favourites and contrast.
- Isolated Chromium checks passed for menu/Escape focus, all 21 category choices, year switching, calendar keyboard selection, timer start/pause/reset, completion/undo, opening/removing favourites, and exploration.
- No page overflow at 320, 390, 768, 1024 or 1440px, including populated Serbian content and expanded goal/milestone/history/reflection sections.
- Populated fixtures used a fresh disposable browser context: 12 completion records referencing real tips, a three-active-day goal and four favourites. No ordinary browser profile, account or production data was changed. Populated mobile dark mode was also visually checked.

No new artwork was needed. Ready for visual review; no commit, push or deployment performed.
