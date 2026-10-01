# What helps me

The progress view groups saved completion feedback by tip. A tip appears when at
least one distinct completion has a positive answer. Each card shows its action,
positive and negative counts, and the answer on its latest rated completion.
Unrated actions do not affect either count. Negative feedback does not erase earlier
positive experiences; changing the only positive answer to negative removes that
tip after refresh. Duplicate event IDs count once.

Counts cover all saved feedback, including old records outside the weekly chart
and recent ten-item history. Account queries paginate rated completions in batches
of 500 through an inner join to the existing owner-protected feedback table.
Guests use their local completion records. Existing progress loading/error handling
and account-switch isolation apply. There is no database migration.

Cards are ordered by the date of the most recent positively rated action, not by
helpfulness score or success rate. Five cards show initially; Show all exposes the
rest. Feedback dates refer to when the action was completed, because the current
schema does not record when the answer was submitted or edited.

Try again opens the existing main action card, selects its category, leaves guided
mode if active, resets the current completion attempt, and focuses the tip heading.
It does not save a favorite or record a completion. A fresh completion is recorded
only when the user clicks I did it. Retired tips retain their counts with a fallback
label and no unusable Try again button.

English and Serbian copy are in `src/i18n/whatHelps.ts`. Favorites and suggestion
selection are unchanged. Tests cover aggregation, mixed answers, duplicate IDs,
recency ordering, old history, pagination, error propagation, expansion and opening
the correct localized tip. Run `npm test` and `npm run build` before deploying.
