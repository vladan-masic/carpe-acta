# Loading performance investigation — 2026-10-05

## Decision

Keep the current application loading behavior. Do not raise Vite's warning
threshold or introduce arbitrary chunks just to suppress its warning.

An experimental deferred Supabase import improved first paint under slower
asset delivery, but delayed when an action could be saved. The experiment was
removed. No application, account, tip catalog, or backend behavior changed.
The retained addition is a local measurement tool; it is not used by the
production build.

## Bundle findings

The production entry is **591,024 bytes** of minified JavaScript, or **174,993
bytes gzipped** using Node's default gzip settings. Vite's 500 kB warning applies
to the uncompressed chunk, not the bytes transferred over a compressed connection.
Vite's own compression estimate differs slightly from Node's default settings.
CSS is 20,862 bytes (5,065 gzipped). Four bundled images total 134,482 bytes.

A Vite `generateBundle` inspection of `chunk.modules` identified React DOM,
Supabase, and the English/Serbian tip catalogs as the main contributors. Module
`renderedLength` values are before final minification and cannot be interpreted
as exact proportions of compressed transfer size. Both tip catalogs are needed
by the current synchronous localization and search implementation.

The experiment dynamically imported `../auth/client` inside the `useAuth`
effect before constructing the client and subscribing to auth events. It kept
saving disabled until session initialization finished. Vite produced:

| JavaScript | Original | Experimental entry | Experimental account chunk |
| --- | ---: | ---: | ---: |
| Minified bytes | 591,024 | 387,493 | 203,443 |
| Gzip bytes, Node default | 174,993 | 123,110 | 51,765 |

This removed the warning and reduced the entry by about 30% compressed, but
barely changed the total JavaScript transferred. It added a request after the
entry executed. A production implementation would also need explicit handling
and tests for chunk-load failures, unmounts during loading, and auth recovery.

## Browser measurements

Production builds were served locally with gzip and `Cache-Control: no-store`.
Each table cell is the median of three navigations in the same desktop Chromium
browser, with a guest session and the initial English view. No completion,
favorite, or account records were written. First paint and LCP were observed
with browser performance entries; a MutationObserver recorded the action card
appearing and its primary completion button first becoming enabled.

| Profile / metric (milliseconds) | Original | Deferred account experiment |
| --- | ---: | ---: |
| Localhost: first contentful paint | 108 | 96 |
| Localhost: LCP snapshot | 108 | 96 |
| Localhost: action card present | 64 | 48 |
| Localhost: completion button enabled | 82 | 74 |
| Slower delivery: first contentful paint | 1,292 | 1,028 |
| Slower delivery: LCP snapshot | 1,744 | 1,492 |
| Slower delivery: action card present | 1,261 | 992 |
| Slower delivery: completion button enabled | 1,276 | 1,420 |

No long tasks were recorded in these samples. Raw first-paint samples were
108/124/104 and 148/88/96 ms on localhost, and 1328/1288/1292 and
1044/1028/1020 ms with slower delivery (original/experiment respectively).
Slower-delivery completion-readiness samples were 1319.5/1271.4/1276.1 and
1453.2/1419.5/1419.8 ms.

The experimental first paint was about 264 ms earlier under slower delivery,
but completion readiness was about 144 ms later. The small localhost sample
is noisy and does not establish a meaningful speedup.

### Limits

- Slower delivery means **150 ms initial delay per response, followed by 4,000
  bytes every 20 ms per response**. Parallel requests do not share a bandwidth
  limit. This is a controlled comparison, not a simulation of a specific mobile
  connection, HTTP/2, CDN, or production server.
- CPU was not throttled. These are desktop lab measurements, not real-user data
  or Core Web Vitals pass/fail results.
- Documents and JavaScript were transferred on each navigation. This was not a
  fresh browser profile per sample; previously used image resources may be
  reused internally. Do not treat it as a completely cold image-cache test.
- Metrics are captured two seconds after `load`. LCP is a snapshot for this
  initial view, not a finalized field measurement. Do not interact or scroll
  before the snapshot. The card-presence timing is a DOM marker, not a paint.
- Completion readiness is a guest-mode proxy for auth initialization. Signed-in
  sessions, token refreshes, callbacks, and Supabase network latency were not
  benchmarked. No live account operations were changed or tested by this experiment.

## Repeat a measurement

```sh
npm run build
node scripts/preview-performance.mjs dist 4173
```

Open `http://127.0.0.1:4173/` in a desktop Chromium browser. Wait at least two
seconds after loading, without interacting. In browser DevTools, read:

```js
JSON.parse(document.documentElement.dataset.perf)
```

For the controlled slower-delivery comparison, use another port:

```sh
node scripts/preview-performance.mjs dist 4175 --slow
```

Repeat at least three times per build/profile and compare medians. Use identical
viewport, locale, guest/account state, CPU settings, and browser version. To
compare builds, save a baseline with `npx vite build --outDir /tmp/carpe-baseline`
before editing, then give that directory to the same server. Never mix Vite's
development server results with production-build results. This tool binds only
to loopback, changes no app files, and injects measurement code only into the
HTML it serves. Stop it with Ctrl+C. Its timings and asset-size output do not
include account data, storage contents, or credentials.

## Next optimization gate

Before accepting a loading change, collect production/mobile measurements with
a shared network cap and CPU throttling, and compare both display and action
readiness. Include signed-in restoration and the Serbian view. A useful future
candidate is loading only the selected tip language, but it needs a designed
loading/failure state and tests for language switching, search, and active-tip
preservation. The current evidence does not justify that added complexity.

## Verification

- `npm test`: 20 files, 207 tests passed.
- `npm run build`: passed, with the original bundle-size warning.
- The final production JS filename and size match the baseline.
- The saved benchmark tool passed `node --check` and returned timing/resource
  measurements in the browser against the final build.
- English and Serbian navigation, action controls, and guest storage labels
  were checked in the browser. Language switching preserved the active tip.
- `git diff --check` passed. No production code, dependencies, or database
  changes remain; nothing was committed, pushed, or deployed.
