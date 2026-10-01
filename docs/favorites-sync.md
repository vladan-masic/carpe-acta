# Account favorites

Guests continue to use `carpe-acta-favorites-v1` in localStorage. Signed-in users use
`public.tip_favorites` in Supabase. Login does not upload guest data automatically;
**Import browser favorites** explicitly merges missing IDs into the current account.
The browser copy stays intact for guests and after logout. The import button can
be used again if a browser favorite is later removed from the account.

## Database setup (before deploying this version)

Run `supabase/migrations/202610010001_tip_favorites.sql` once in this project's
Supabase SQL Editor, or apply it with your normal Supabase migration workflow.
The transaction creates a new table; it does not change existing authentication
or completion data. Do not rerun it once the table exists.

The composite primary key prevents duplicate favorites. Row-level policies allow
signed-in users to select, insert and delete only their own rows. Anonymous users
have no table privileges. Updates are intentionally not granted: repeated saves
use `ON CONFLICT DO NOTHING`. Account deletion cascades to its favorites.
These rules follow [Supabase's RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

No new environment variables or secret keys are needed. Continue using the existing
public Supabase URL/key. Never put a service-role key in the frontend.

## Behavior and limitations

- Newest saves appear first, with tip ID as a stable tie-breaker. A batch import
  shares a server timestamp and sorts by ID within that batch; the guest list's
  original ordering is unchanged.
- Unknown tip IDs are retained in storage; unavailable tips are omitted from cards.
- Changes use individual row operations, never replacement of the whole collection.
- Account data is fetched on login, window focus, becoming visible, and the
  **Refresh favorites** button. This is not a live realtime subscription.
- Changes are confirmed by a successful server read. During requests, favorite
  controls are disabled. If a request fails, the last snapshot remains visible
  with an error and further edits require a successful refresh. Offline account
  writes are not queued.
- Guest storage and completion history remain separate. Completed actions are
  still browser-local.

## Verification

Run `npm test` and `npm run build`. Hook tests cover guest persistence, explicit
imports, account changes, delayed requests, duplicate clicks, errors, and refresh.
API tests verify owner filters and idempotent inserts. These mocks do not prove
that deployed database policies are correct.

The migration was applied to the Carpe Acta Supabase project on 2026-10-01.
For another environment, apply it before deployment.

Run `supabase/tests/favorites-access.sql` in SQL Editor to exercise owner access,
cross-account isolation and duplicate prevention in a rolled-back transaction.
It requires at least one existing auth user and does not retain test data.

After applying the migration, check the policies in Supabase and test with two
accounts: each should see only its own rows, and inserting a row with the other's
user ID must be denied. Anonymous access must be denied. Then save/remove a tip,
reload, sign in on another device and refresh; check that it matches. Verify guest
favorites return after logout, and check the controls in English and Serbian.

### Verification on 2026-10-01

- 78 automated tests passed; production build passed (existing large-chunk warning).
- Migration applied to `ipfjdjuwlnbkchqirxli` through Supabase SQL Editor.
- Rollback-only access checks passed against the deployed table: owner reads,
  inserts and deletes, duplicate prevention, cross-account read/delete isolation,
  rejected cross-account insertion, and restricted role privileges.
- Local app with Google login: guest import, persisted favorite in a second tab,
  removal and refresh, English/Serbian controls, and guest restoration after logout
  verified. Temporary test favorites were removed.
- Frontend has not been deployed to Vercel as part of this change. A separate
  physical-device check remains part of the post-deployment smoke test.
