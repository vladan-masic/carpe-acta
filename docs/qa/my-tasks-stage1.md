# My Tasks — Stage 1 review

- Working directory: `/home/vladan/Documents/Web development projects/carpe-acta`.
- Branch: `codex/my-tasks-design-prototype`, based on approved merge `95d979b` from `origin/main`. The starting working tree was clean.
- Development-only entry: `/__tasks-preview`. No production navigation, backend, migrations, persistence, dependencies, or changes to existing shared components.
- Stop here for design review. Nothing committed, pushed, or deployed.

## Structure

`src/dev/tasks/TasksPreview.tsx` owns in-memory tasks, quick add, filters, sorting, selection, language, and theme. `TaskDetail.tsx` contains properties, one-level subtasks, and lightweight action demonstrations. `TaskControls.tsx` provides shared difficulty, property, and reorder controls. `model.ts` holds local fixtures and small filter/reorder functions; `copy.ts` holds English/Serbian Latin text. `tasks.css` is scoped to the preview. The existing toolbar, footer, language selector, fonts, tokens, and illustrations are reused.

All Tasks includes completed entries; the other dated views show unfinished tasks. Today means today's deadline, Upcoming means a future deadline, and Someday means no deadline. Manual reordering is available in All Tasks with My order selected; deadline sorting does not mutate that order. Handles open working Move Up/Move Down controls for tasks and subtasks. Pointer/touch dragging is intentionally deferred and labeled as such in the UI.

Below 1100px, opening details replaces the list with a separate page-like view. Focus moves to the detail heading; Back/Escape restores focus to the opening control. Native radio inputs support keyboard difficulty selection. Prototype theme/language changes do not write preferences.

## Verification

- Production build: passed (`tsc -b` and `vite build` through the bundled Node runtime; npm is unavailable in this shell).
- Existing non-blocking >500 kB bundle warning remains. Production output contains no TasksPreview, preview-route, task fixture, or task stylesheet markers.
- 17 focused tests passed across `tasks-preview`, `design-preview`, and `theme`.
- Tests cover creation, completion/reopening, property edits, independent difficulty/urgency/importance, subtask add/complete/remove, ordering, filters, support actions, localization, empty-state recovery, and no storage/network writes.
- Browser checked at measured CSS widths 1440, 768, 390, and 320; no horizontal document overflow. English and Serbian Latin checked, light/dark rendering checked, keyboard arrow selection and detail focus restoration verified.
- Five review images: desktop light, desktop dark, mobile light, expanded subtasks, and empty list.

## Later implementation, after design approval

- Production task data model, validation, ownership/access control, persistence, synchronization, and error recovery.
- Pointer/touch dragging and its keyboard equivalent, preserving the distinction between sorting and manual order.
- Task-specific timer and Help Me Start integration. Current actions are local demonstrations; task completion never creates tip-completion records.
- Production navigation and durable task identifiers; expanded integration/accessibility testing before release.
