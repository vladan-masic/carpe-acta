# Phase 7 — Discovery, Favourites and Account Polish

Ready for review, October 12, 2026. No commit, push or deployment. The illustration phase and Phase 8 have not started.

## Checkpoint and preview

The starting working tree was clean at approved Phase 6 commit `fab2fbc1d60af7240d29aebd00f5fbcd16bff747`. `git ls-remote` confirmed the matching remote `codex/milestones-exploration` ref before creating `codex/discovery-account`.

- [Local review showcase](http://127.0.0.1:5182/__discovery)
- [Real application](http://127.0.0.1:5182/)
- Restart with `npm run dev -- --host 127.0.0.1 --port 5182` if needed.

The development-only showcase renders the real Library, Favourites, AuthPanel and BrowserImport components. Favourites are in-memory examples. Account views use a clearly labelled synthetic account; authentication methods return simulated errors, and imports only update fixture state. No network or browser-storage operations are performed by the fixture. Actual guest persistence and reopening were checked separately in the real application. The showcase is excluded from production, as verified in the built JS. Prior previews remain intact.

## Changes and scope

| Area | Visual change | Preserved behavior |
| --- | --- | --- |
| Tip Library | Notebook heading tab, small editorial sketch, grouped filters, blue discovery accents, category icons, compact cards, separate action text and metadata | All 180 tips and IDs, 21 categories, original text and sources, search normalization, category/effort filters, reset, six-at-a-time reveal, first-new-heading focus, opening and stars |
| Favourites | Sage accents, small bookmark detail, matching category icons and effort metadata, visible saved-star controls | Search/filtering, count, identity, ordering, removal, focus restoration, browser/account storage and retry behavior |
| Empty states | Shared decorative page, bookmark and beginning-path sketches with existing localized messages | Genuine empty, no-match, selected-day empty, loading and error branches remain distinct; existing reset controls remain available |
| Account | Existing emblem, clearer heading/form spacing, browser/account storage note, framed import sections, explicit failed/copied/unavailable states | Native dialog semantics, dismissal/focus restoration, validation, recovery, sign-in/up/out, sync and explicit import operations |

No hooks, catalog, search utilities, authentication actions, Supabase integration, data models, backend or database files were changed. No dependencies or new localization strings were added. Star semantics and labels are unchanged. Guest use remains available without an account.

One narrow presentation fix: an unreadable guest favourites list no longer shows the normal friendly empty message. The existing unsaved/storage warning remains visible and corrupt storage is untouched. In-memory favourites still display their result counts if a later save fails. Two bilingual regression cases cover the unreadable-empty case.

## Visual comparison with the references

The original Illustrated Notebook moodboard and Phase 0 Notebook/Adventure references informed the composition. Cards now read as collected practical entries: compact category markers, editorial titles, a fine paper rule separating the action, and clearly grouped controls. Sage bookmarks distinguish the personal saved collection from blue discovery. Small page/pencil and botanical-path sketches give empty states a recognizable beginning, while the account interface uses the established emblem rather than adding decorative art around sensitive form fields.

This is still more restrained than the richly painted original moodboards. It introduces coherent illustration and collection details without inserting large landscapes, replacing functionality, truncating tip content or turning the library into an image gallery.

## Screenshots

The baseline and updated showcase use the same initial six library tips and three saved tips.

| Comparison | Before | After |
| --- | --- | --- |
| Desktop collections | [Before](screenshots/before-desktop-populated.jpg) | [After](screenshots/after-desktop-populated.jpg) |
| 390px collections | [Before](screenshots/before-mobile-populated.jpg) | [After](screenshots/populated-390-en-light.jpg) |
| 390px no library matches / no saved tips | [Before](screenshots/before-mobile-empty.jpg) | [After](screenshots/after-mobile-empty.jpg) |
| Desktop login | [Before](screenshots/before-login-desktop.jpg) | [After](screenshots/after-login-desktop.jpg) |

Detail and state captures:

- [Library close-up](screenshots/library-desktop-closeup.jpg) · [Saved collection close-up](screenshots/favorites-desktop-closeup.jpg)
- [Empty-state illustrations](screenshots/empty-states-closeup.jpg) · [Desktop empty states](screenshots/empty-desktop-en-light.jpg)
- [320px Serbian/dark populated collections](screenshots/populated-320-sr-dark.jpg) · [Card detail](screenshots/card-320-sr-dark.jpg) · [Empty states](screenshots/empty-320-sr-dark.jpg)
- [390px Serbian/light](screenshots/populated-390-sr-Latn-light.jpg) · [Serbian/dark](screenshots/populated-390-sr-Latn-dark.jpg) · [English/dark](screenshots/populated-390-en-dark.jpg)
- [Tablet Serbian/dark](screenshots/populated-tablet-sr-dark.jpg) · [Desktop Serbian/dark](screenshots/populated-desktop-sr-dark.jpg)
- [Account at 320px, Serbian/dark](screenshots/account-320-sr-dark.jpg) · [Login at 390px, Serbian/dark](screenshots/login-390-sr-dark.jpg)
- [Failed import](screenshots/account-error-desktop.jpg) · [Copied import](screenshots/account-imported-desktop.jpg) · [Syncing](screenshots/account-syncing-mobile.jpg) · [Unreadable storage](screenshots/account-unreadable-mobile.jpg)
- [Authentication error](screenshots/auth-error-mobile.jpg) · [Recovery form](screenshots/recovery-mobile.jpg)
- [Real-app empty favourites at 320px](screenshots/favorites-empty-320-closeup.jpg) · [Real-app history empty state](screenshots/history-empty-320.jpg)

## Verification

- Baseline: **354 tests across 43 files passed**, production build passed.
- Final: **356 tests across 43 files passed**, TypeScript/production build passed, `git diff --check` passed.
- Existing tests exercise bilingual search, accent normalization, all categories and source content, six-result reveal and focus, favourites removal/opening, disabled account controls, authentication/recovery/validation, guest/account separation, explicit imports, retry states and account owner isolation.
- Browser: combined category/effort/search filters, reset and no-match messages; reveal from 6 to 12 with focus on the seventh heading; favourite removal returned focus to the collection heading; expansion and selected-star states retained.
- Real application: saved a tip from the library, reloaded and confirmed persistence, reopened the exact tip with focus on its active heading, then removed the test favourite. The local saved collection returned to its original empty state. No live account was used.
- Account fixture: inspected login, signup and reset forms, authentication error, syncing, failed import, copied import and unreadable-browser states. Busy import exposes `aria-disabled`; closing the dialog restores focus to its trigger. At 320px the Serbian account dialog scrolls internally without horizontal overflow.
- Both languages and both themes checked at **320, 390, 768 and 1440px**. No page overflow in the [16-case measurement matrix](screenshots/responsive-checks.json). Existing mobile navigation was left unchanged and did not cover inspected collection controls.
- Inspected collection buttons and filter controls have targets at least 44px high; source disclosures now have the same minimum. Existing 3px focus outlines remain visible. Native labels, dialog semantics and alert/status containers are preserved. Illustrations use empty/decorative accessibility treatment; their messages remain text.
- Existing readable colour roles and reduced-motion rules are retained. New artwork is static; no new animations or transitions. No console errors observed in real-app checks.

The existing >500 kB JS chunk warning remains. Production gzip JS changed from 194.85 to 195.83 kB and CSS from 13.80 to 14.99 kB. No new bitmap or font downloads.

Authenticated storage and recovery operations are verified through existing mocked integration tests and isolated visual states, not a live hosted account. This is not an exhaustive browser or assistive-technology audit; reduced-motion preservation was reviewed in source rather than by changing an OS preference.

## Review and future art brief

Please review card density, blue versus sage collection accents, the small empty-state sketches and the account spacing. Full tip content remains visible, so unusually long localized tips will naturally create taller cards.

For the dedicated illustration phase, refine these three scenes as a coordinated editorial set: (1) open notebook with unfinished pencil circle, (2) a quietly bookmarked notebook for the first saved idea, and (3) a short path beside a seedling and low sun. Use transparent backgrounds, fine imperfect ink, restrained cream/sage/terracotta/blue washes, no baked-in text, and legible silhouettes at 68–140px. If painted assets replace SVGs, target roughly 10–20 kB per scene and provide light/dark proofs. The library header can reuse the notebook scene. Avoid a separate illustration for every tip/category and keep account form areas visually quiet.
