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
deletion cascades to its completion records. Updating/deleting individual events
is not exposed in this increment.

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
