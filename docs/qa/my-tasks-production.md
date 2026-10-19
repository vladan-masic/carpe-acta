# My Tasks release verification — 19 October 2026

Branch: `codex/my-tasks-production`, based on `origin/main` at `95d979b030b8d9ee25040c349968b03b373ca8ec`. Existing prototypes were carried onto the branch without resetting the working tree. The user authorized hosted setup and release after the initial local-only checkpoint.

## Implemented

- `/tasks`, a lazy production page, defaults to Board and remembers Board/List preference. Native links preserve browser history; `vercel.json` rewrites direct `/tasks` requests to the application. Existing homepage anchors remain intact.
- `src/tasks/domain.ts` owns one plain-text task model: UUIDs, ownership, independent difficulty/urgency/importance, notes, deadline/duration, status, remembered active status, per-status order, completion/creation/modification timestamps and ordered subtasks.
- `TaskStore` owns the canonical collection. Both views use the same operations and detail editor. Filters and deadline sorting derive visible arrays without changing saved ranks. Dragging/reordering is enabled in All + Manual; status changes remain available in other filters.
- Shared visual controls moved to `src/tasks/presentation`; the original List and Kanban development pages still use them through compatibility exports. Their fixtures remain under `src/dev`, outside the production import graph.
- `persistence.ts` provides versioned guest storage and owner-checked Supabase RPC adapters. No task action calls tip-completion or Realm APIs. Start opens a focus prompt; Make it smaller supports adding a step; I'm stuck offers local guidance. No timer or completion-statistic integration is implied.

## Persistence and conflict policy

Guests use `carpe-acta.tasks.v1`. Web Locks serialize browser writes, storage events update clean tabs, and revisions reject stale writes. Storage failures retain edits in memory and display a warning/retry/recovery-download action. Corrupt storage is never silently replaced; its original content can be downloaded. Browsers without Web Locks retain an unsaved in-memory session rather than claiming unsafe multi-tab saves.

Accounts use `read_tasks` and `write_tasks`. Saves debounce for 400ms, serialize per owner and atomically compare a collection revision. A stable mutation UUID makes a lost-response retry idempotent. A concurrent write produces a visible conflict; local edits remain available to download, then the user explicitly discards them and loads the server version before manually reapplying desired changes. There is no automatic last-write-wins merge.

Clean account data refreshes on window focus, visible-tab return or Refresh. This release does not use Realtime. Pending changes are kept in this page, not an offline account cache. Save or download them before leaving after an error; unload warnings are a best-effort browser safeguard, not crash recovery. Account-scoped stores and owner checks isolate late responses and pending saves when sessions change.

Guest import is explicit, adds to account tasks, preserves IDs/subtask relationships and meaningful metadata, appends per-column ranks, and leaves browser data untouched. Imported-ID receipts survive deletion, preventing repeat imports from resurrecting tasks. Import retries use the same save mechanism.

Initial bounds: 1,000 tasks per collection, 100 subtasks per task, 200-character titles, 10,000-character notes, 1–10,000 estimated minutes. Collection-level conflicts favor correctness and a small implementation; finer-grained merging and an offline queue are future work.

## Database

Migrations (applied in order through the authenticated Supabase SQL editor):

- `202610180001_my_tasks.sql`
- `202610190001_task_conflict_response.sql`

Adds only `user_tasks`, `user_subtasks`, `task_collections`, their indexes, RLS policies, timestamp/revision triggers and two SECURITY INVOKER RPC functions. Every user-data table is owner-scoped. Subtasks have a composite owner/parent foreign key; neither INSERT nor UPDATE can attach them to a different user's parent. Anonymous access and PUBLIC function execution are revoked. Completion timestamps and active statuses are constrained. Direct owner table changes also invalidate collection revisions.

Verified dashboard and deployed frontend project: `ipfjdjuwlnbkchqirxli`. The deployed public key matches local configuration. No privileged key was retrieved or used. The existing project has no `supabase_migrations.schema_migrations` registry; these dashboard applications are recorded here instead of fabricating CLI history.

## Validation performed locally

- Full Vitest suite: **49 files, 418 tests passed** (`vitest run --maxWorkers=2`).
- TypeScript production check and Vite production build passed. Existing main-chunk >500 kB warning remains; the task page is a separate approximately 47 kB JS chunk before gzip.
- `node scripts/check-task-build.mjs` passed: production task route present, Realm simulator/routes and task sample fixtures absent from emitted JS/chunks.
- Fresh disposable PostgreSQL 18 database: migration applied successfully; `tests/sql/my_tasks.sql` passed and rolled back. It checks A/B SELECT/INSERT/UPDATE/DELETE isolation, foreign-parent attachment including UPDATE, anonymous denial, invalid fields, atomic saves, stable retry IDs, stale revisions, completion/reopening, cascades and retained import receipts. Local bootstrap uses an `auth.uid()`/`auth.users` stub; it does not replace hosted Supabase verification.
- Browser checks on Vite dev and the **built production bundle**: empty Board default, creation, shared List/Board edits, difficulty/urgency, subtasks, completion/reopening, pointer drag to Done, accessible ordering, persisted order after reload, remembered view, cross-tab guest updates, homepage anchors, back/forward and direct `/tasks` loads.
- English and Serbian Latin, light/dark, desktop 1440px, tablet 768px, mobile 390px and narrow 320px inspected. No measured page overflow at checked sizes. Mobile details use a separate full-width presentation and restore focus on return. Mouse dragging verified in-browser; shared pointer behavior has automated coverage, but physical touch-device testing remains pending.
- Built preview `/__realm-preview` renders no game; Realm source is not emitted. No console warnings/errors were captured in the built-page browser checks.
- Older storage-flow test mock now supplies the existing calendar-year API; navigation tests explicitly retain the original four links and assert the added task route. No test was removed or weakened.

## Hosted verification

- Both migrations applied successfully on 19 October 2026. The original migration remains immutable; the second changes only the task write function's application-conflict error code.
- Hosted rollback-only SQL tests passed after both migrations: RLS ownership, foreign parent INSERT/UPDATE rejection, invalid data, anonymous denial, completion, cascading deletion, idempotency and stale writes. Synthetic SQL users/rows were rolled back.
- Created two dedicated email/password test users through the Auth dashboard with auto-confirm and no outgoing email. Random credentials are outside Git in a mode-0600 local file under a mode-0700 temporary directory. No personal account was used for task tests.
- **14 real authenticated API checks passed**, using the public frontend key plus the dedicated user tokens: isolated initial state; task/subtask save; idempotent retry; account reload; cross-owner RPC denial; direct SELECT/UPDATE/DELETE isolation; foreign-parent subtask denial; stale-write rejection; invalid-save atomicity; completion/subtask completion; reopening; independent-session refresh; cascade/import-receipt retention; anonymous denial.
- Hosted testing caught a PostgREST retry loop when application conflicts used SQLSTATE `40001`. The corrective migration uses `PT409`, returning HTTP 409 immediately. The adapter recognizes it, unit coverage was updated, and both SQL/API tests passed afterward. Reference: https://supabase.com/docs/guides/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
- Browser testing against the built bundle and hosted Supabase confirmed real sign-in, explicit guest import, duplicate-import prevention, Board/List sharing, Serbian characters, difficulty/urgency/notes/subtasks, creation from List appearing in Board, preserved local edits after a remote conflict, explicit reload of the newer server version, guest restoration on logout, and empty isolated account B after switching.
- Auth redirect allowlist now includes `https://carpe-acta.vercel.app/tasks`; existing URLs are unchanged.
- Unrelated table integrity before/after hosted testing: `tip_completions` 28 rows, `tip_favorites` 7, `completion_feedback` 18, `weekly_achievements` 1. Each aggregate row-content fingerprint matched exactly; no personal rows were modified.
- Full suite after the correction: **49 files / 418 tests passed**. TypeScript, Vite build and production-isolation check passed; existing main-chunk size warning remains.

### Release gates still to record

- GitHub PR/checks/merge and Vercel deployment.
- Actual production URL smoke tests after deployment, using only dedicated test data.

### Applied migration checksums (SHA-256)

- `202610180001_my_tasks.sql`: `f1ffd18410d63596ee4970d994804accd16f5002938028526eb3e5ec482f0eee`
- `202610190001_task_conflict_response.sql`: `d3ec68e2a0eed5c59f88778bee67d5b3ef249cc41a4e1a0e2b708c54d32be43d`

## Rollback

Previous production deployment: `2a8n9y9S6bgmdMiNkAEZRxyG5pxZ` (`carpe-acta-axykancc5-vladanmaske.vercel.app`). If rollback is needed, restore that deployment in Vercel or redeploy baseline `95d979b030b8d9ee25040c349968b03b373ca8ec`. Leave the additive task tables/data in place; the old application does not use them. Do not drop tables or erase guest task storage. A database rollback, if ever needed, requires a separate reviewed data-preserving plan.
