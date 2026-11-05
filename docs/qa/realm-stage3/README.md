# Realm Stage 3 validation — 2026-11-05

Baseline: `origin/main` / `7aa370c` (PR #35). Feature branch: `codex/realm-ten-buildings`. Local disposable state only; release authorized after the final maximum-level correction and validation; no migrations or manual deployment.

- TypeScript: `tsc -b` passed.
- Focused Realm coverage: 4 files, **92 tests passed** (including 40 building-detail cases that each exercise construction, intermediate upgrades and maximum states).
- Complete suite: **59 files, 555 tests passed**.
- Production build: passed. Existing non-blocking >500 kB main-chunk warning remains (710.74 kB main JS).
- `scripts/check-task-build.mjs`: production tasks present and preview fixtures excluded.
- `scripts/check-realm-build.mjs`: Realm route marker, styles, chunks and new bilingual catalogs excluded from the actual built output.
- `git diff --check`: passed.
- Browser: English/Serbian Latin × light/dark × 1440/768/390/320px: all 16 combinations passed, no page overflow or JavaScript page errors. All ten targets remain separate. Native selector selects locked/unlocked locations and focuses the details heading. Keyboard Enter selection, close/focus return, keyboard horizontal panning and a touch-enabled mobile tap passed.
- Browser gameplay: replayed all **145 commands** from the conservative finite simulation through actual UI controls, ending with ten level-5 buildings and the same 117-coin balance as the domain run. All research, original forest stages, destinations and contracts completed. No state injection was used for the browser playthrough.
- Unit coverage includes all Marketplace routes at all five levels, cycle value loss, once-only research effects, expedition/contract duplicate rejection, Hall/Workshop gates, insufficient resources, reversal debt on all new actions, exact final partial claims and cap-preserving undo/replay.

Machine-readable evidence: [economy.json](economy.json), [browser-checks.json](browser-checks.json). Executable domain playthrough: `tests/helpers/realmSimulation.ts`. Browser runner: [verify-browser.mjs](verify-browser.mjs); requires a local Vite server at port 4174 (or `REALM_PREVIEW_URL`), Playwright (`PLAYWRIGHT_MODULE` can select an installed module) and Chromium (`CHROME_BIN` can select the executable). The runner writes only these local QA artifacts and uses disposable browser contexts.

## Screenshots

These show a labeled temporary placement plan, not finished village artwork. The fixed shared toolbar is hidden only during element screenshot capture to avoid covering the scene; normal browser interaction uses the real toolbar. Review composition, functionality and mobile selection separately from the future illustration approval.

- [Initial desktop, English/light](screenshots/initial-1440-en-light.png)
- [Expanded ten-building desktop, English/light](screenshots/expanded-1440-en-light.png)
- [Mobile selector and locked plot, Serbian/dark](screenshots/initial-390-sr-Latn-dark.png)
- [Completed finite research catalog](screenshots/research-completed.png)

The [Stage 3 review](../../design/realm-stage3.md) describes the gameplay, exact economy changes, placement manifest, art handoff and unresolved decisions. The simulations prove reachable progression with spare resources; they do not guarantee recovery from arbitrarily wasteful purchases or trades. The finite catalog has no refill other than an explicit disposable reset. Screen-reader support was checked through semantic DOM/accessible controls, not a manual assistive-technology session.

## Final approved usability check

All ten buildings show **Fully upgraded — Level 5** / **Potpuno unapređeno — Nivo 5**, with no upgrade invitation, costs or construction timing at the cap. Native disabled semantics and the linked explanatory text remain. Browser validation covers all 40 building/language/theme maximum combinations; both the button label and status exceed 4.5:1 contrast and the completed control remains fully opaque. The detail tests also verify construction, intermediate upgrades and the live level-4-to-5 transition in both languages/themes.

- [Maximum status, English/light](screenshots/maximum-en-light.png)
- [Maximum status, English/dark](screenshots/maximum-en-dark.png)
- [Maximum status, Serbian/light](screenshots/maximum-sr-Latn-light.png)
- [Maximum status, Serbian/dark](screenshots/maximum-sr-Latn-dark.png)

The approved 900-coin fictional cap is unchanged and explicitly provisional. Reassess this economy before connecting The Realm to any real user accomplishments. The placement manifest and gameplay mechanics were unchanged in this final correction.
