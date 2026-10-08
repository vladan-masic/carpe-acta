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

See the [loading performance investigation](docs/loading-performance.md) for
production bundle measurements, the tested split, and a local benchmark command.

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
scrolls independently when space is limited. At every screen width, the category picker shows the current selection and expands with
**Show categories**. These disclosures only change the layout, not tip selection.
The floating **Back to top** arrow appears after the introduction scrolls out of view. A reserved right-hand margin keeps it clear of page controls. It scrolls smoothly
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

### Timer alerts

The **Timer alerts** disclosure offers a soft chime with a preview, optional
browser notifications, and a tab-title indicator. Sound and notifications
start off; the tab-title indicator starts on and can be disabled. Preferences
are stored only in this browser (`carpe-acta-timer-alerts-v1`), not in the account.
Previewing the sound does not enable it. Audio is prepared during a user gesture
when sound is enabled or a timer starts/resumes.

Expiry alerts happen once per run. Language changes do not replay them.
**Dismiss alert**, **Keep going**, resetting, switching tips, and completing an
action clear the title indicator. Clicking a notification attempts to focus the
window and active action. Notifications are silent so the optional chime is the
only app-requested sound. They close when acknowledged or the timer is removed.

Permission is requested only when the user enables notifications. Unsupported,
denied, and failed notification delivery fall back to the in-page timer and
optional title indicator. This uses page notifications, not push or a service
worker: keep the page open, and expect delays if the browser suspends it. Mobile
support varies; see [MDN's Notifications API guidance](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API).
No alert completes an action or changes account data.

## Activity calendar

Progress includes twelve Monday-start week columns: eleven complete weeks and
this week through today. Squares use five fixed activity levels (0, 1, 2, 3–4,
5+ completions) in the app's terracotta palette. Future days are blank. Today
has an outline; a selected day has an inset marker. The seven-day totals remain
as a compact summary.

Hover or keyboard focus reveals the date and exact count below the calendar.
Click, tap, Enter or Space selects a day and shows its full completion history,
including feedback and unknown-tip fallbacks. **Show recent actions** restores
the usual latest-ten history. Tab enters the calendar once; arrow keys explore
its dates, Home/End move within a week, and Ctrl+Home/End reach the first/last day.
Escape dismisses the date preview. Each square has a complete accessible label.
The calendar can scroll horizontally on very narrow screens.

Calendar dates use local calendar arithmetic through DST and year boundaries.
Guest and account views share the same aggregation; the existing account read
now paginates the twelve-week range. Completion saves, Undo, imports and refresh
update counts and selected-day history. No schema, tip data, or account-write
changes are required.

Choose **Calendar view → Year** for a full January–December calendar, then use
**Previous year / Next year** to browse older history. Future years cannot be
selected; future days in the current year are blank. Leap years and partial
Monday-start week columns are supported. The year grid scrolls horizontally on
smaller screens. Switching ranges clears the selected day but never resets the
current action, timer or Undo.

Guests use their full saved browser history. For accounts, only the selected year
is fetched, with owner filtering and pagination in batches of 500. Year requests
are independent of completion writes; stale responses after year/account switches
are discarded. Saves, Undo, imports and progress refreshes invalidate the year
view. Loading and failures are explicit, with a separate retry button. Switching
back to **12 weeks** stops using the year view; no new storage or schema is needed.

## Optional weekly activity goal

Above the activity calendar, choose 1–7 active days per week (3 suggested), or
leave the goal off. Weeks run Monday–Sunday in the device timezone; days need not
be consecutive. Several completions on one day count once. Undoing the last
completion on a day removes that active day. The target carries into each new
week; progress starts fresh. Calendar year selection does not affect the goal.

Guests store the preference in `carpe-acta-weekly-goal-v1`. Signed-in users store
`weekly_goal_days` in Supabase user metadata (0 means off); no migration is needed.
Account preferences refresh on sign-in and window focus/visibility. Guest targets
are not automatically imported. Failed preference saves are reported and retain
the previous target. Activity uses the existing completion sync and local midnight
refresh. No reminders, streaks, or historical goal snapshots are added.

## Personal milestones

The compact milestone section below the weekly goal shows the highest earned
badge and progress to the next badge in two groups: 1/10/50/100/250/500/1,000 completed actions
and 1/7/25/50/100/180/365 active days. Only earned badges and the next target
in each group are revealed, including inside the expandable collection.
Distinct active dates use the device timezone, need not be consecutive, and span
all saved history. Future timestamps are excluded. Undo can make a badge unearned.
Existing history and imports unlock badges quietly; only a new completion in the
current visit can show an inline celebration. No earned-badge records, XP, or
notifications are stored; account totals use the read-only summary below.

Guest milestones use complete browser history with no active-day cap. After the
original ladder, new action badges appear every 500 actions (1,500, 2,000, ...)
and active-day badges every 100 days (465, 565, ...). Existing thresholds and
badge identities remain unchanged. Only earned badges and the next target show.

Accounts now use a single `milestone_totals` aggregate response, independently of
history length. It counts lifetime actions and distinct dates in the device's
timezone, excludes future completions, and preserves completion-table RLS plus
an explicit authenticated-owner check. Completion writes, Undo, imports, refresh
and local midnight refresh the totals; failed reads expose retry without blocking
completions. No fallback to capped or partial counts is used.

Apply `supabase/migrations/202610070002_milestone_totals.sql` before deploying this
frontend. This read-only summary migration was **applied to hosted Carpe Acta
Supabase (`ipfjdjuwlnbkchqirxli`) on 2026-10-07 with user approval**. Do not
rerun it on that project. `supabase/tests/milestone-totals-access.sql` verifies
uncapped counts, timezone boundaries, future exclusion, cutoffs and account
isolation in a rollback-only transaction. It passed on local PostgreSQL 16.


## Recorded weekly achievements

**Weeks I met my goal** counts achievements recorded from now on while using the
app; it does not infer past goals from current settings. Each successful week
stores its Monday date, original achieved target, timezone and achievement time.
Changing or disabling the current goal leaves achieved targets unchanged. Weeks
need not be consecutive. Undo may revoke the current week's achievement if its
original target is no longer met; completed past weeks remain historical snapshots.
Guest records use one `carpe-acta-week-achievement-v1:YYYY-MM-DD` storage entry per
week, independently of account records. Importing browser completion history does
not import historical guest achievements or invent older account achievements.

Account support requires applying
`supabase/migrations/202610070001_weekly_achievements.sql` before deploying this
frontend. **Applied to hosted Carpe Acta Supabase (`ipfjdjuwlnbkchqirxli`) on
2026-10-07 with user approval.** Do not rerun it on that project. It adds an
owner-readable table and a narrowly scoped authenticated RPC.
The RPC reads the current goal and completion dates on the server, freezes the
first achieved target, and serializes concurrent devices per user. Clients cannot
directly insert, update or delete award rows. It never touches completion records.
Run `supabase/tests/weekly-achievements-access.sql` as postgres for rollback-only
access, idempotency, goal-change, timezone and Undo checks. It passed against a
temporary PostgreSQL 16 database with a minimal Supabase auth fixture.

Missing migrations, read failures and unsaved achievements display an error and
retry control; account failures never fall back to guest storage. No achievements
are claimed as saved before persistence succeeds. Goal/completion writes pause
achievement synchronization; account changes discard old responses. Window focus,
visibility, storage events, goal changes and current-week activity trigger refresh.

Live verification on 2026-10-07 confirmed row-level security, the owner-read
policy, authenticated SELECT-only table access, blocked anonymous access, and
authenticated RPC execution. The existing completion count remained 23 before
and after the migration. These hosted checks were read-only; behavioral and
rollback tests were run against the temporary local PostgreSQL instance.

Live milestone-summary verification on 2026-10-07 passed in a read-only
transaction: authenticated totals matched direct aggregates, cross-owner reads
were rejected, anonymous execution was blocked, and the function retained RLS
through SECURITY INVOKER. All 23 existing completion records remained unchanged.

## Gentle return message

On a return visit after at least three local calendar days without a completed
action, the action area quietly says “Good to see you. One small action counts.”
English and Serbian are supported. There are no streak-loss warnings, progress
changes, popups, sounds, or focus moves. The message can be dismissed and clears
when an action is completed (including a local save failure).

Eligibility is checked once after the visit's history is available. New users,
recent activity, failed/loading history and later imports do not trigger a welcome.
A browser-local marker per guest/account remembers the latest completion ID, so
the same gap is welcomed once in that browser; a later completion followed by a
new gap can trigger another welcome. Blocked storage limits suppression to the
current visit. This feature uses existing history and needs no backend changes.

## Category exploration

The optional, initially collapsed “Explore categories” section counts categories
with at least one completed action. Existing history counts quietly, with badges
at 3, 5, 10 and all available categories (currently 21). Only the next target is
shown; there are no deadlines or streak requirements. Undo removes a category
when its last completion is removed. Unknown tip IDs and future records do not
count. Catalog IDs, content and order are unchanged.

“Find something different” opens the library on the first unexplored category in
catalog order, clearing search and effort filters and focusing search. It does
not choose or complete an action. Both English and Serbian Latin are supported.

Guests use full browser history. Accounts lazily request distinct known tip IDs
when exploration is expanded, avoiding download of the full completion history.
The SECURITY INVOKER RPC checks the authenticated owner and retains table RLS.
Read failures show retry; account failures never fall back to guest data.

**Applied to hosted Supabase on 2026-10-07:**
`supabase/migrations/202610070003_category_exploration.sql`.
The migration and rollback-only `supabase/tests/category-exploration-access.sql`
passed against the temporary local PostgreSQL 16 database. Hosted read-only
verification confirmed authenticated query results, cross-owner rejection,
blocked anonymous execution and retained row-level security. All 23 completion
records remained unchanged, verified with a before/after row-content fingerprint.
The frontend has not been deployed.

## Personal best

A quiet summary beside milestones shows the most distinct active days in a
Monday–Sunday week, including the current partial week, and the earliest week
that reached that count. It uses the device timezone and full saved history.
Repeated actions on one day count once. Future/invalid guest timestamps are
excluded. Undo and imports recalculate the record; nothing is stored separately.
There are no targets, streak comparisons, popups, sounds or competitive prompts.
English and Serbian Latin include empty, loading and retry states.

Guests use browser history. Accounts use the one-row `personal_best_week` RPC,
with authenticated owner checks and SECURITY INVOKER retaining completion RLS.
Account failures never use guest history. Writes hide stale summaries; account
switches discard outstanding responses.

**Applied to hosted Supabase on 2026-10-08:**
`supabase/migrations/202610080001_personal_best_week.sql`.
The migration and rollback-only `supabase/tests/personal-best-access.sql` passed
against temporary PostgreSQL 16, including week/year boundaries, distinct days,
ties, Undo, cutoff, timezone grouping and owner isolation. Hosted read-only
verification confirmed that the authenticated summary matched direct aggregates,
cross-owner reads were rejected, anonymous execution was blocked, and RLS was
retained. All 23 completion records were unchanged, verified by a before/after
row-content fingerprint. The frontend has not been deployed.

## Page hierarchy

The compact logo/title and daily-quest introduction lead into the action card.
Categories are collapsed initially on desktop and mobile; expanding them does not
change the current action. Weekly-goal settings and the explanation of recorded
weeks are available through disclosures, with save errors still visible.
Progress shows the weekly goal, calendar and recent actions before a grouped
Achievements section (milestones, personal best and category exploration).
Milestones and personal best sit side by side on wider screens and stack on mobile.
This layout does not change tip selection, completion calculations or account data.
