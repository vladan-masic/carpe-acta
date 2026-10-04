# Carpe Acta

Carpe Acta is an anti-procrastination web app built around practical tips, small quests, and repeatable daily action.

The first version focuses on a small, useful loop:

- show a featured daily quest
- generate a random anti-procrastination tip
- browse tips by category
- keep the content data-driven so the app can grow without rewrites

## Tech Stack

- React
- TypeScript
- Vite
- Plain CSS with design tokens

This keeps the first version lightweight while leaving room for later features such as search, streaks, Pomodoro sessions, XP, achievements, and RPG progression.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - type-check and build the app
- `npm run preview` - preview the production build locally
- `npm test` - check tip content integrity, localization, and selection behavior

## Project Shape

```text
src/
  components/   Reusable React UI components
  data/         Static app content for the MVP
  types/        Shared TypeScript domain types
  utils/        Pure helper functions
```

## Adding a bilingual tip

The library now contains 177 bilingual tips. See
[the CA-041–CA-160 expansion notes](docs/tip-library-expansion.md) for the
12 earlier batches, editorial ID mapping, category choices, and references.
The additional [one-minute Help Me Start actions](docs/help-me-start.md) ensure
every blocker has at least two suggestions at the shortest time budget.

1. Add metadata to `src/data/tips.ts`: a unique, stable `id`, an existing
   `categoryId`, positive `effortMinutes`, and `tags` (use `[]` until tags are
   curated). Effort estimates the immediate action, not the whole project.
   Preserve existing IDs and ordering; order affects daily quests and library results.
2. Add the same ID to both `src/i18n/tips/en.ts` and
   `src/i18n/tips/sr-Latn.ts`, with nonempty `title`, `text`, and `action`.
   `whyItWorks` is optional; add it only when reviewed content exists. It appears
   in the action card's **Why this helps** disclosure. Keep tags language-independent and consistently lowercase.
3. Run `npm test` and `npm run build`, then check both languages in the app.

`TipId` is derived from the metadata catalog. TypeScript requires every tip in
both translation maps; there is no separate ID list to maintain. Base metadata
types live in `src/types/tipMetadata.ts` so they do not depend on the catalog.
Interface copy remains in `src/i18n/messages.ts`; `src/i18n/localizeTip.ts`
combines it with tip translations for display. Completion records reference tip IDs
instead of becoming fields on shared content; favorites use separate per-user storage too.

## Action completion

The random tip card's “I did it” button records the suggested immediate action,
not completion of the user's larger task. Each displayed action can be completed
once. Generating another tip or selecting a category starts a fresh attempt,
even if a single-tip category returns the same tip. Switching language preserves
the current completion state. Reloading starts a fresh attempt and retains history.

Guest history is stored in this browser under `carpe-acta-completions-v1` as an
array of `{ id, tipId, completedAt }` records, with unique completion IDs and ISO
timestamps. There is no history screen or account sync yet. Blocked storage,
invalid stored data, or a failed write leaves existing data untouched and shows
that the completion could not be saved. The current card still acknowledges it.

## Navigation

The sticky desktop navigation links to **Start**, **Browse tips**, **Progress**,
and **Favorites**, with account and language controls on the right. Browse tips
opens the library and focuses search; other links focus their section headings.
Navigation preserves the current action and library filters. The former starter
preview has been removed because the full library includes those tips.

On screens up to 1000px wide, the floating **Menu** at the top-right contains these
four links, followed by account and language controls below a divider. Its panel
scrolls independently when space is limited. On screens up to 600px wide, the category picker shows the current selection and expands with
**Show categories**. These disclosures only change the layout, not tip selection.
The floating **Back to top** arrow stays in the lower-right corner, scrolls smoothly
to the top, and returns keyboard focus to the page start. Reduced-motion preferences
disable the animation. Account dialogs remain available independently
of the collapsed menu, including login callbacks and password recovery.

## Searchable tip library

Open **Browse all tips** below the action card to search the full catalog in the
selected language. Search matches words across titles, descriptions, and actions,
ignoring case and Latin accents (including `dj` for Serbian `đ`). Combine search
with a category and maximum effort, including one-minute actions. Results keep
catalog order and show six at a time; **Show more** adds six and moves keyboard
focus to the first new result. Changing search, filters, or language returns to
the first six matches. Clear search and filters restores the full catalog.

Favorite stars use the existing guest/account controls. **Try this** opens the
exact tip in the main action card with a fresh completion attempt, leaving Help
Me Start if needed. Browsing does not change the active tip or daily quest.
The collapsed library preserves its search while keeping the main page compact.
No backend changes, dependencies, or additional persistent data are required.

## Favorites

Use the star on a daily quest, random tip, or library result to save or unsave it.
The Favorites link jumps to a collection ordered by most recently saved first.
Each saved card shows the advice and immediate action; “Use this tip” opens it in
the main card, selects its category, and starts a fresh completion attempt.
Saving or removing a favorite does not change completion history.

Search Favorites by title, description, or action in the selected language and
combine it with a category filter. Matching follows the library's case- and
accent-insensitive search; results retain newest-saved order. The heading shows
the full saved count, while a separate result count describes the filtered view.
Clear search and filters restores the collection. Filters stay local to this view
and do not alter saved tips or account sync.

Guest favorites persist in this browser as an array of stable tip IDs under
`carpe-acta-favorites-v1`. They follow the selected language, survive reloads,
and synchronize across tabs through storage events. Unknown IDs are retained in
storage but omitted from the visible collection. Invalid or inaccessible storage
is not overwritten: favorites remain usable for this visit with an unsaved notice.
Signed-in favorites sync through Supabase. Browser favorites can be explicitly
imported into an account; the browser copy remains intact. See
[account favorites setup](docs/favorites-sync.md) for the required migration and
sync behavior. Clearing browser data removes guest favorites.

## Login

Optional Supabase login supports email/password, email login links, and Google.
Account creation, email confirmation, password reset, persistent sessions, and
logout are supported in English and Serbian. The app remains usable as a guest.
Favorites and completed actions sync with the signed-in account. Guest data remains browser-local; import it explicitly after login. See [completion sync](docs/completions-sync.md) for setup, retry behavior, and verification.
See [authentication setup](docs/authentication.md) for public environment settings,
Google and email-provider configuration, and the pre-release verification checklist.

## Help Me Start

Choose **Help me start** in the generator, select what is getting in the way,
and try one relevant action estimated at five minutes or less. Further suggestions
stay within that choice. Favorites, completion tracking and progress work as usual.
See [guided-start behavior and mappings](docs/help-me-start.md).

## Why this helps

When the selected tip has an explanation, the action card offers a collapsed
**Why this helps** section beneath the action controls and feedback. This uses
the existing translated explanation without changing tip content or selection.
It works in Random Tip and Help Me Start, and for tips opened from the library,
favorites, or progress. A different tip starts collapsed; switching languages
preserves whether the explanation is open. Tips without an explanation omit it.

## Action feedback

After saving a completion, optionally select **Helped me start** or **Not helpful
this time**. Feedback appears in recent history; it does not change suggestions.
Apply the [feedback migration and access checks](docs/completion-feedback.md)
before deploying this version.

## What helps me

The progress view shows tips marked as helpful, with feedback counts and a
**Try again** button. It uses all saved feedback and leaves favorites and random
suggestions unchanged. See [behavior and data rules](docs/what-helps-me.md).

## Optional action timer

The action card offers a timer using the tip's estimated effort. It starts only
when requested, supports pause/resume and reset, and stops at zero. **Keep going**
then counts extra time upward. Timer expiry never records a completion; **I did
it** remains a separate, manual action.

Timers belong to the current action attempt: choosing another action (including
reopening the same tip), resetting the guided selection, completing the action,
or reloading the page clears the timer. Switching languages preserves it.
Elapsed clock time keeps the countdown accurate when browser updates are delayed.
Timers are not saved or synced to accounts and do not request notification access.
