# Stage C1 — desktop visual review

13 October 2026 · `codex/homepage-reconstruction` · no commit, push or deployment.

[Complete 1440px light-mode screenshot](desktop-1440-light.png)

- Preserved Stage B's panoramic hero, Daily Quest and generator composition.
- Combined the real weekly goal, 12-week calendar, milestones and personal best into a shared illustrated journal row. Annual navigation and all dates remain available in the calendar's scroll area.
- History and reflection entries are expandable; selecting a calendar day opens its history. Category exploration retains its existing on-demand loading and detail controls.
- Saved tips form a horizontal illustrated collection with search, filtering, action details, opening and removal. The empty collection offers a real route to the library, now positioned beneath favourites.
- Integrated the approved growth and four achievement paintings. Four action themes have explicit category mappings; similar adjacent desk thumbnails yield to category icons. The second path scene is reserved for saved thumbnails so it does not repeat the hero beside the active tip.
- Source PNGs are untouched and are not served. Action exports: 320px (25–31 kB) and 640px (92–114 kB); growth: 640px/33 kB; stamps: 240px/8–10 kB. Only selected images render, with responsive sources and lazy loading. Existing Stage B art remains available.

The screenshot uses isolated empty guest storage, English, Europe/Belgrade timezone and the real daily quest. No saved tips, completions or goals were invented for the review. Populated saved-tip interactions were separately exercised through the UI in disposable test storage.

Validation: production build passed (existing >500 kB chunk warning); 88 focused tests passed across 10 files. Browser checks passed for empty states, library focus, calendar/history, category exploration, saved-tip search/open/remove/focus, active-day goal/completion/undo and 1440px overflow. Backend, schemas, authentication and calculations were not changed.

Optional future artwork: one transparent low botanical cluster at the left edge of the progress-section entrance, and a complementary trailing sprig at the right edge between the library and footer. No substitutes were introduced.

Stopped for desktop visual approval. Mobile/tablet composition, dark-mode refinement and comprehensive release regression testing are deferred.
