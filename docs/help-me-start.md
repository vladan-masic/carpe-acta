# Help Me Start

The tip generator offers a guided mode: choose what is making it hard to start,
then receive one existing tip with an immediate action. “Try another suggestion”
keeps the same selection and excludes the immediately previous tip where possible.
The suggestion uses the normal favorite and completion controls, including account
sync and progress history. Completion state resets when the suggestion changes.

The eight choices map to existing categories in `src/data/startBarriers.ts`:

| Choice | Categories |
| --- | --- |
| Little energy | Low Energy |
| Too much to do | Overwhelm |
| Worry | Fear & Anxiety |
| Unclear next step | Planning, Overthinking & Decision Paralysis |
| Perfectionism | Perfectionism |
| Distraction | Focus, Phone & Internet Procrastination, Dopamine |
| Low motivation | Low Motivation |
| Not sure | Starting |

Only tips with an estimated effort of five minutes or less are eligible. This is
transparent category matching, not diagnosis or learned personalization. No new
categories or tips were added, and existing IDs and catalog order are unchanged.
Tests ensure each choice has several eligible tips; maintain that invariant when
editing the catalog or mappings.

Back to random tips restores the previously selected category with a fresh tip.
Opening a favorite leaves guided mode and uses that tip's category. Switching
languages preserves the selected blocker and active tip. All copy is English and
Serbian Latin. Selection lives only in memory; it is not added to account history
or stored in localStorage. Completed actions still record the ordinary tip ID.

No database migration or new environment variables are required. Verification:
`npm test` and `npm run build`, plus browser checks for choosing a blocker,
requesting another suggestion, changing languages, and returning to random tips.
