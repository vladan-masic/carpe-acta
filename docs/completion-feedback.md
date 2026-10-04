# Optional action feedback

After a completion has been saved, the active card offers **Helped me start** and
**Not helpful this time**. Neither answer is preselected. Moving on skips feedback.
Users can change the answer while that completion remains on the active card.
Feedback is linked to the completion event, not globally to a tip: repeating an
action later can receive a different answer. Suggestions/ranking are unchanged.
Recent history shows the saved answer in English or Serbian.

## Storage and deployment

1. Apply `supabase/migrations/202610010003_completion_feedback.sql` once in Supabase
   SQL Editor, before deploying this frontend. Existing completions are unchanged.
2. Run `supabase/tests/feedback-access.sql` there. It rolls back all test data and
   checks owner-only reads/inserts/answer updates, parent linkage and deduplication.
3. Deploy the frontend and verify saving/changing an answer, reloading history,
   and checking it on another device.

The migration adds `completion_feedback`, with a composite primary key and foreign
key to `(user_id, id)` on completions. Each user can read and insert only their own
feedback and update only its `helpful` column. Deleting the parent completion or
account cascades to its feedback. No new environment variables are needed.

Guest feedback is an optional boolean field on the existing local completion
record. Older records remain compatible; corrupt history is never overwritten.
Feedback cannot create a completion. No answer means `undefined`/no database row;
`false` is a real answer, not missing data.

Guest-history import copies feedback after its parent completions, preserving IDs.
Repeated imports ignore existing account feedback so stale guest answers cannot
overwrite newer account answers. If an import partly fails, retrying is safe.
Account saves never fall back to shared guest storage. A failed answer displays a
retry instruction without claiming success or changing completion status. Feedback
cannot be submitted until the parent save is confirmed. Answers are not queued
offline; retry before leaving the card. Navigating or switching accounts isolates
late responses from the new card/account.

## Verification

Automated tests cover guest persistence, unset/negative/positive answers, changes,
retry failures, duplicate clicks, unmounts, translations and API payloads. Run
`npm test` and `npm run build`. Database policy tests must also be run in Supabase;
mocked client tests do not prove deployed access rules.

### Current validation status

122 automated tests and the production build passed. Browser access initially
failed while loading its request-header policy, but recovered on the next turn.
The migration was applied to `ipfjdjuwlnbkchqirxli` on 2026-10-01; do not rerun it
there. All rollback-only SQL checks passed: owner access, answer changes,
cross-account isolation, parent linkage, repeat-import preservation and privileges.
The local app successfully loaded the existing signed-in history through the new
feedback relation. SQL test records were rolled back, leaving user history intact.

Frontend deployment remains pending. After deploying, complete an action, submit
and change feedback, then refresh on another device to verify end-to-end behavior.

## Undo interaction

Undoing the parent completion also removes its answer: embedded guest feedback is
removed with the local event, and account feedback uses the existing foreign-key
cascade. A concurrent answer either saves before deletion and is then removed,
or arrives after deletion and fails its foreign-key check. Feedback controls
unmount when Undo starts, so late UI responses cannot restore an answer or a
completion. See [completion Undo](completions-sync.md#undo-a-recent-completion)
for setup, retry behavior, and synchronization limits.
