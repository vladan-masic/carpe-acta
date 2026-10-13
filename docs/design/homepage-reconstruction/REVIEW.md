# Homepage reconstruction — Stage B review

12 October 2026. Branch: `codex/homepage-reconstruction`, based on the clean
`codex/hero-illustration` checkout. No commits, pushes or deployments.

## Desktop direction

- Continuous panoramic landscape connects the introduction and real Daily Quest.
- The generator overlaps the landscape as an open paper section; all 21 real categories remain available.
- The active action has a botanical notebook margin, readable instruction and existing timer/completion/favourite controls.
- Compact navigation retains the real emblem, destinations, account, language and theme controls.
- Added English and Serbian headline copy. Desktop composition applies at 1100px and above; smaller screens retain the existing layout pending approval.

The existing landscape and approved completed-actions notebook are sufficient for this checkpoint. The notebook is a shared decorative action motif, not a category-specific image or earned badge. Its 56 kB WebP is derived from `stamp_completed_actions.png` in the approved artwork ZIP; original artwork is unchanged.

## Remaining art, in priority order

1. **Action scenes:** a coordinated set of 4–6 watercolour still lifes (beginning/writing, focusing, resting/moving, making, connecting, tending everyday tasks). Reuse through an explicit category mapping across active tips and saved-tip thumbnails. No per-tip image collection. Match the approved landscape's graphite edges, sage foliage and terracotta/ochre light; no baked-in text or UI. Deliver 3:2 scenes with useful square crops.
2. **Botanical edges:** two asymmetric transparent foreground sprigs/clusters, matching the landscape, for section transitions and the footer. The current opaque scene cannot supply independently positioned foliage cleanly.

A literal reproduction would invent multi-step daily quests, statistics and thresholds, shorten the real 21-category list, and replace the actual 12-week/year calendar. Those semantic differences remain intentional. The reference's character, lettering and additional scenery are not present in the approved art.

## Review evidence

- [Before, 1440px light](screenshots/before-1440-light.png)
- [After, 1440px light](screenshots/after-1440-light.png)
- Both are full-page captures using isolated, empty guest storage and the same deterministic random selection of a real tip. No account data or invented progress.
- Production build passes (existing >500 kB bundle warning remains); focused tests: 60 passed across five files.
- Browser check passes: 21 categories plus All, generator focus, category selection, favourite, timer start/pause, completion/undo, Help Me Start; no horizontal overflow at 1440px or runtime errors.

**Stopped for visual approval.** Progress composition, saved-tip previews, smaller-screen adaptation, dark-mode refinement and comprehensive regression checks are Stage C. The full screenshots deliberately show the remaining lower-page work.
