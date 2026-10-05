# Account-synced completed actions

Guests keep using `carpe-acta-completions-v1`. Signing in switches new completions
to Supabase. **Import browser history** explicitly copies guest events into the
current account, retaining their IDs and original timestamps. The guest copy is
never deleted. Repeated imports are safe; unknown/retired tip IDs are preserved.

Each action attempt has its own event ID. Repeating an action later creates a new
event. Double clicks, retries of uncertain writes and repeat imports reuse the
same event ID and cannot create another row for that account. Copies of the same
event with different IDs are intentionally treated as distinct completions.

## Setup

Apply `supabase/migrations/202610010002_tip_completions.sql` once before deploying
this frontend. It creates `tip_completions` with owner-only read/insert policies
and a primary key of `(user_id, id)`. Existing favorites/authentication are not
changed. No new environment variables or server secrets are needed. Account
deletion cascades to its completion records. The optional Undo feature below adds
owner-only deletion through a separate migration; event updates remain disallowed.

Run `supabase/tests/completions-access.sql` to verify permissions, owner access,
account isolation, idempotency and timestamp preservation in a rollback-only
transaction. An existing auth user is required.

## Sync and errors

The small completed-actions total uses an exact server count, so it is not limited
to the first 1,000 history rows. It refreshes on sign-in, focus/visibility, successful
writes, and the Refresh button. This is not realtime synchronization.

Account saves never fall back to shared guest storage. If a save is uncertain,
**Retry save** reuses the original ID. Failed saves are retained only for the
current card and visit: retry before changing cards or reloading. Guest storage
failures still acknowledge the action with the existing unsaved notice.

Imports use batches of 200 records. A partially completed import may be retried
safely. Malformed/inaccessible local history is left untouched and reported.
Browser history remains available after logout. The progress view below adds recent history; streak calculations and intervention
ranking remain outside this feature.

## Validation

Run `npm test` and `npm run build`. Tests cover local storage, account changes,
late responses, duplicate clicks, retries, explicit imports, errors and batching.
After deployment, complete an action, sign in on a second device, and refresh its
completed-actions total. Import guest history twice and confirm the count only
increases once. Check both English and Serbian controls.

Duplicate handling follows [Supabase upsert semantics](https://supabase.com/docs/reference/javascript/upsert).

### Verification on 2026-10-01

- Migration applied to the Carpe Acta project (`ipfjdjuwlnbkchqirxli`). Do not
  rerun it there; apply it once when setting up another environment.
- 90 automated tests passed. Production build passed with the existing bundle-size
  warning. The database rollback tests passed for owner access, cross-account
  isolation, duplicate prevention, timestamp preservation and role privileges.
- Verified an account completion save, persistence in a second tab, English and
  Serbian controls, and refresh against the live database through the local app.
  Removed only the temporary verification record afterward. Existing guest history
  was not imported or changed by this browser check; imports are covered by hook,
  API and database idempotency tests.
- Frontend changes have not been deployed. After deployment, verify the flow on a
  separate device and optionally import your guest history through the new button.

## Simple progress view

The completed-actions section now shows seven local calendar days (today and the
previous six), the week's completion total, days with activity, and the ten most
recent completions with localized tip titles, actions and timestamps. Unknown tip
IDs retain their history with a translated fallback title. Repeated actions count
as separate events; duplicate event IDs count once. Future timestamps are excluded
from the progress view; the existing all-time database total remains unchanged.

Account progress uses the existing owner-only table policies. Recent records are
limited separately, and weekly records are paginated in batches of 500 so busy
weeks are not silently truncated. Guests use their readable browser history.
Progress refreshes with completion saves/imports, focus, manual refresh and local
midnight. Dates reflect the current device timezone, so traveling may regroup past
activity. A failed refresh preserves the last snapshot with the existing error
notice; an initial failure is not presented as an empty history.

No new migration, environment variables or chart dependency is required.

## Undo a recent completion

After a confirmed save, the latest completion offers **Undo** for 15 seconds.
The offer follows that exact event across tip changes, and includes its localized
title. Switching languages preserves it. Hovering or focusing the notice, or an
ongoing completion sync operation, pauses dismissal and grants a fresh 15 seconds
afterward. A new confirmed completion replaces the previous offer. Dismissal,
reloading, or switching accounts ends the offer; this is not a history editor.

Undo removes just that event. Guest deletion rereads local storage and removes
the event plus its embedded feedback, preserving unrelated records and malformed
history. Account deletion filters by owner and event ID; the existing foreign key
atomically cascades to the corresponding feedback. Neither deleting feedback nor
saving late feedback can recreate the parent completion. Feedback controls are
unmounted during an undo attempt. Other accounts, prior attempts of the same tip,
favorites, daily quests, and tip selection remain unchanged.

A successful undo re-enables **I did it** for the same active attempt and resets
its optional timer to idle. Completing it again creates a fresh event ID. Failed
or uncertain deletion offers **Retry undo** without a timeout; retries use the
same event ID, including if the first deletion actually succeeded. Retry before
leaving, dismissing, or saving another completion. Account operations never fall
back to browser history. Failed saves must first be confirmed with **Retry save**
before Undo is offered.

Progress, recent history and helpfulness summaries refresh after undo. If that
read fails after a successful deletion, the undo remains successful and account
summaries are unavailable until refreshed; stale totals are not presented as
current. Other devices see the deletion on their normal refresh/focus cycle.
Guest Undo affects only browser history, not copies already explicitly imported
into an account by another tab. The feature does not undo older imported history.

### Deployment and verification

Apply `supabase/migrations/202610040001_completion_undo.sql` before using account
Undo with this frontend. It grants authenticated users DELETE on their own
`tip_completions` rows under RLS. It grants no event UPDATE or direct feedback
DELETE permission. The short offer is a UI policy, not a server-side retention
rule: an authenticated client can delete any of its own events.

Run `supabase/tests/completion-undo-access.sql`, `completions-access.sql`, and
`feedback-access.sql` after the migration. The new rollback-only test checks
cross-account denial, owner deletion, feedback cascade, preservation of other
events, idempotent retries, and rejection of late orphan feedback.

The migration was applied to the live Carpe Acta project on 2026-10-04 after
user approval. Do not rerun it there. Apply it once for new environments before
using account Undo. No new packages, environment variables, or secrets are required.

### Verification on 2026-10-04

- All 203 automated tests passed; production build passed with the existing
  bundle-size warning. `git diff --check` passed.
- Applied the completion, feedback and Undo migrations to a temporary local
  PostgreSQL 16 database with representative Supabase roles and `auth.uid()`.
  All three rollback-only SQL access tests passed. This checks the SQL behavior,
  not the deployed Supabase configuration; the live migration is still pending.
- Verified guest completion, feedback, Undo, updated progress and focus restoration
  in the browser, with English desktop and Serbian narrow-mobile layouts. Used
  isolated in-memory history; existing user history was not changed.

### Live repair on 2026-10-04

- Confirmed the live project lacked both the DELETE grant and deletion policy.
  Applied `202610040001_completion_undo.sql` after explicit user approval.
- Removed the three specifically approved October 4 One Tiny Step events and
  their associated feedback. The other 11 account completions were retained.
- Live rollback-only checks passed for authenticated owner deletion, denial of
  cross-account deletion, feedback cascade, and idempotent retry. No SQL test
  records were retained.
- Verified the actual signed-in browser flow: a temporary completion raised the
  total from 11 to 12; clicking Undo showed success and restored 11 total and
  zero for today. The temporary browser test event was removed by Undo.
