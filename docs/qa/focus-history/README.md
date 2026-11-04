# Focus History and Statistics V1 — review checkpoint

4 November 2026. Branch `codex/focus-history-statistics`, based on freshly fetched `origin/main` at `594a8b2` (PR #34). The authoritative checkout was clean before implementation. No commit, push, merge, deployment or hosted database change has been made.

## Behavior

Finish/End opens a native review dialog. Expiry, closing the browser, navigation, and task status changes never create history. Actual duration starts blank and must be explicitly entered (1 second through the smaller of elapsed time and 12 hours). Save records it; Discard ends without history; Continue resumes eligible work. Closing the review retains it. Reviewing an existing session is required before starting a different action.

Outcome is optional and descriptive. Separate completion buttons use the existing task store; history save/delete never changes completion. Completion failures retain the task store's existing recovery UI. History retains task/subtask IDs, not title snapshots; deleted references receive neutral labels.

The focus controller's v1 record gains optional cumulative timing, original start, last timed work, review end, and pending confirmation fields. Timer reset and overtime preserve cumulative work; pauses do not add time. Expiry stops at the timer deadline. A later review uses the last timed work as the session end. Existing v1 sessions restore without changing IDs or timer behavior. **Legacy sessions cannot recover time already erased by old resets/overtime transitions or a missing original start timestamp**; only retained elapsed time is used and unknown start is null. No historical records are generated from old completions.

## Persistence and duplicate protection

- Guests: `carpe-acta.focus-history.v1`, separate from tasks and active focus. Web Locks serialize read/modify/write operations across tabs. Corrupt, blocked, full storage and unavailable Web Locks fail visibly without replacing existing data. A browser-storage failure requires keeping the page open until retry succeeds.
- Accounts: additive `202611040001_focus_history.sql`; owner RLS on `focus_history` and `focus_history_receipts`, restricted grants, bounded duration/outcome constraints, owner/date/task indexes, SECURITY INVOKER recording RPC. No task/tip/account table changes. Stable keyset pagination avoids truncated totals and shifting-offset duplicates.
- Session UUID is also entry ID and the idempotency key. The exact confirmed payload is persisted inside the owner-scoped active session **before** history I/O. An ambiguous/failed request retains it across reload; retry reuses it unchanged. The active session ends only after acknowledgement. Pending saves cannot be continued, replaced or discarded until resolved.
- Deletion removes the entry, retaining only owner/session-ID receipts. Retries and repeated imports cannot resurrect it. Explicit guest import is separate from task import, preserves source data, never overwrites account records, and can resume after partial failure.
- Active sessions remain browser-local. Recorded account history is server-persisted; it refreshes on tab focus/visibility, mutations and retry, without Realtime.

## Interface and calendar rules

My Focus sits below the task workspace. Monday-based This week, Last 30 days (today plus 29 local calendar days), and All time aggregate confirmed records only. Days group by session end in the viewer's local timezone using calendar arithmetic, including DST. The chart always shows the current week with an explicit label, visible duration labels, and screen-reader text equivalents. Recent history follows the selected period, initially five entries with Show more. Per-task summaries work in both Board and List.

Existing notebook tokens/fonts are reused. No chart dependency, rewards, streaks, tip statistics, or Realm production imports were added.

## Validation

- Full Vitest suite: **56 files / 482 tests passed**. Added recording, cumulative timing, legacy restoration, ambiguous acknowledgement/reload, duplicate tabs, storage failure, guest import, deletion, calendar, owner/pagination adapter, and UI tests. Existing tests retain their prior behavioral assertions with the explicit review step added.
- Final focused suite after accessibility feedback: **4 files / 36 tests passed**.
- TypeScript project check passed; Vite production build passed. Existing >500 kB main-chunk warning remains. `scripts/check-task-build.mjs` confirms the task route and excludes Realm and development task fixtures.
- Fresh disposable PostgreSQL 18 database: existing task migrations plus the new additive migration applied locally. `tests/sql/focus_history.sql` passed and rolled back: owner SELECT/INSERT/DELETE isolation, anonymous denial, denied UPDATE/receipt deletion, constraints, atomic receipt rollback, retry idempotency, non-resurrection, parent deletion and no automatic task completion. Uses the existing local `auth.uid()`/`auth.users` stub, not real Supabase Auth.
- Disposable Chromium context against the built production bundle: EN/SR × light/dark × 1440/768/390/320 px, measured no page horizontal overflow. Inspected chart text, task references, Board/List, Home/tasks navigation, save without completion, cross-tab deletion, native modal initial focus and Tab wrapping. No captured JavaScript page errors. Dialog content scrolls at narrow heights.
- `git diff --check` passed.

Screenshots use synthetic guest fixtures and the actual production build. Section crops omit the unrelated sticky toolbar:

- [Desktop My Focus](screenshots/desktop-en-light.png)
- [390 px mobile My Focus](screenshots/mobile-390-en-light.png)
- [320 px Serbian dark My Focus](screenshots/mobile-320-sr-dark.png)
- [Session review](screenshots/session-review-en-light.png)
- [320 px scrollable review](screenshots/session-review-320.png)

## Before release — requires approval

Apply `supabase/migrations/202611040001_focus_history.sql` to the hosted project only after approval. Then verify with dedicated test accounts: real Supabase Auth/PostgREST persistence, account isolation, ambiguous-network retry, logout/account switching, explicit import, and deletion. Local SQL and adapter tests do not replace hosted authenticated browser testing. Physical mobile-device and assistive-technology testing remain outside the automated/browser checks above. Browser data eviction cannot be prevented; account history is durable after server acknowledgement.

The feature is ready for local visual/functional review. Hosted migration, commit, push, merge and deployment remain pending approval.

## Release progress — 4 November 2026

Deployment approved by the user. Refetched main and confirmed the feature still starts from PR #34 without divergence. Full release checks passed again: 482 tests, TypeScript, production build, Realm/fixture exclusion, and diff whitespace check. The hosted migration remains a prerequisite for merging; dashboard automation is currently unavailable, and no hosted migration has been attempted.
