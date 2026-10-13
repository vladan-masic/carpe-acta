# Phase 7.5A — Visual identity and illustration audit

12 October 2026 · Audit and proposed art direction only

## Decision and verified baseline

**The next improvement should combine stronger composition with a small commissioned illustration family. Adding more faint backgrounds will not close the gap.** Keep the Living Notebook interface, its real features and its existing emblem. Introduce a few confident editorial focal points, with quieter functional areas between them.

The user confirmed Phase 7 approval during this audit. Local HEAD and the live GitHub branch `codex/discovery-account` both resolve to `9a190a3fb6ed45ff6949819e27d2f4ee3468ad3b`. The working tree was clean before this document was created. No application code, artwork, account data or dependencies were changed. No commit, push or deployment was performed.

Evidence reviewed: the four supplied concept mockups; Phase 0 comparison documentation and B/C desktop references; the current application at localhost:5180 in light/dark, desktop/narrow layouts; existing populated achievement and collection review evidence; raster assets at full size; illustration components and their responsive/theme CSS. Live inspection used a guest state without creating completion or favourite records. The browser's viewport override was affected by its current scaling, so this is a visual audit rather than a fresh exact-width regression certification. Theme preference was restored to System. No test suite was rerun for this documentation-only task.

## 1. The visual gap

The original references make illustration part of the composition: a landscape establishes a place, a notebook still life introduces action, plants give progress a physical presence, and stamps feel like small collected objects. The real application now has the right typography, semantic colours, clean controls and encouraging progression semantics. Its illustrations are usually small accents attached to otherwise conventional panels.

Phase 0 B established the editorial foundation, but it was itself much sparser than the original Illustrated Notebook mockup. Matching that prototype more closely would not, on its own, deliver the richer reference atmosphere.

| Area | Observed gap | Composition/CSS work | Original artwork needed? |
| --- | --- | --- | --- |
| Opening | Branding and Daily Quest form two similarly bounded panels. The path is visible in light mode, but cropped and very faint; dark mode largely loses its colour. There is little sense of an illustrated place. | Give the opening one dominant scene and keep the quest as a readable paper entry. Reserve a real art area instead of increasing opacity behind text. Retain the short route to the action. | **Yes, highest priority:** stronger landscape with purposeful foreground, middle distance and sunrise. |
| Active action | The Fraunces title, terracotta instruction and action/timer grouping already provide strong hierarchy. A large image would compete with this successful structure. The current generator pencil is detached from the action itself. | Keep the card structure. Consolidate the generator/action ornament into one small location; retain the existing pencil stroke. | Not initially. Reuse the existing pencil, or defer a notebook vignette until the hero/stamps establish the art style. |
| Guided support | The pencil and unfinished circle are relevant, but look pasted into a corner. Choice tiles remain understandably clean. | Better crop and placement; align the sketch with the introduction rather than the choices. Remove redundant generator decoration when support is open, as current CSS already does. | No new subject needed. A future transparent edition may help dark mode. |
| Weekly progress | The large right-hand seedling gives the section a real identity, but the source crop shows only one of the original growth subjects. A 260px desktop art column contains a relatively faint vignette. | Balance illustration and active-day information; make the image deliberately framed rather than a fading patch. Keep numeric progress and day states dominant. | **Yes, second priority:** a compact, more legible botanical composition. |
| Calendar/history | Both are clear, but broad full-width paper rectangles and repeated borders give a dashboard rhythm. The calendar has unused lateral space in its 12-week state. | Group the progress introduction, weekly entry and calendar more coherently. Consider a bounded desktop side-by-side composition only when both have enough usable width; annual mode retains full width. Use a single quiet margin mark, not a landscape inside the date grid. | No separate calendar or history painting. |
| Milestones/Personal Best | The four SVG subjects are appropriate. Smooth outlines, flat fills and repeated identical stamps feel diagrammatic compared with the textured collected miniatures in the mockups. Unstarted states remove almost all colour, making the first visit the least inviting state. | Keep the stamp slots, readable labels and actual thresholds. Give not-yet-earned art a warm sketch treatment rather than a lifeless disabled appearance. Differentiate state with text and frame treatment, not colour alone. | **Yes, third priority:** four coordinated painted stamp interiors. No new achievement types. |
| Exploration | Category icons are consistent; the journey identity mainly appears inside the disclosure. | Keep disclosure behaviour and the 21 icons. A compact version of the existing exploration stamp can anchor the heading without expanding the section. | Reuse the stamp family; do not commission 21 category paintings. |
| Library/Favourites | Compact paper cards, bookmarks and category labels now work well. The entry illustration is simple but readable. | Keep browsing quiet. Improve visual rhythm through heading/collection spacing, not a picture on every tip. | No initial commission. |
| What Helps Me | Populated entries have useful bookmark framing; the empty state is intentionally plain. | Preserve the reflection tone. Reuse the small bookmark motif sparingly if a stronger section introduction is needed. | No unique image required. |
| Footer | The onward path is a useful, distinctive closing metaphor. Its far-right crop can leave most of the scene outside the visible area. | Reposition the path bend so it survives shallow and mobile crops; preserve the dark foundation and readable credits. | Retain current artwork first. |
| Whole page | Warm colours are present, but repeated card boundaries and large gaps produce a sequence of separate modules. There is no consistent scale relationship between raster sketches and flat SVG miniatures. | Establish a rhythm of illustrated opening → clear action → botanical journal → collected stamps → quiet collection → onward footer. Reduce redundant frames where appropriate without altering controls or disclosures. | A shared art direction is needed, not an image for every section. |

### What to borrow from each mockup

- **Illustrated Notebook:** layered paper, deliberate asymmetry, tactile illustration, editorial composition. Do not copy tape, handwritten sentences and distressed texture onto every surface.
- **Optimistic Bloom:** warm light, organic foreground detail, a few generous botanical focal points. Do not fill every margin with flowers.
- **Enchanted Adventure:** a path that continues beyond the frame and recurring natural forms. Avoid castles, destination flags, avatars or invented journeys.
- **Playful Momentum:** a clear current action and readable feedback. Keep its functional hierarchy, not its heavier dashboard styling.

The reference screenshots compress and simplify real functionality. Their five-across progress rows, picture-heavy tip cards and monthly calendars are not appropriate templates for the actual 12-week/annual calendar, long localized text and complete action workflow.

## 2. Existing asset decisions

Raster dimensions and sizes below are from the current files; sizes are rounded decimal kB. All four background WebPs are opaque 1536 × 1024 images. Their background colours are baked in, which explains the current masks/blending and dark-mode compromises. Together they occupy approximately **137 kB**.

| Asset | Current purpose and quality | Recommendation |
| --- | --- | --- |
| `src/assets/backgrounds/small-steps.webp` · 56.1 kB | Delicate path and pale sunrise concentrated on the right; large blank cream area. Used by the hero. Attractive pencil texture, insufficient visual weight for the new hero ambition. | Retain as a source/style reference. Replace its production hero role only after the richer landscape is approved; do not show both scenes together. |
| `imperfect-start.webp` · 24.8 kB | Terracotta pencil, practice marks, open circle and small sprig. Used around the generator and in Help Me Start. Strong conceptual match. | Retain and deliberately crop. Prefer one visible instance at a time. Do not commission another pencil image by default. |
| `gradual-growth.webp` · 25.7 kB | Several growth stages along the lower margins, large empty centre. Current weekly card extracts the taller right plant. The bent emerging shoot must never be used as a missed-day/decline state. | Retain source; replace the weekly vignette only if the new botanical work is clearly better. No decorative background duplication elsewhere. |
| `onward-path.webp` · 30.3 kB | Dark charcoal landscape with a warm pencil path; strongest existing theme-specific scene. | Retain and recrop/reposition. Use as a colour/composition reference for the new hero's dark treatment. |
| `src/assets/branding/emblem.png` · 192 × 192 RGBA · 23.2 kB | Recognizable blue quill/path/sun emblem, shown on cream backing. | Retain unchanged. Its sun and flowing curve can inform illustrations without turning the emblem into scenery. Do not replace it with a mockup's sunrise logo. |
| `public/favicon-32.png`, `favicon-48.png` | Existing small identity exports. | Retain. No new favicon or product name. |
| `AchievementStamp.tsx` | Four decorative SVG subjects: actions/notebook, days/plant, best/sun-path, exploration/landscape-signpost. Theme-aware; labels and progression live outside the image. | Retain component contract and four semantic subjects. Use it as the frame/state shell for approved painted interiors, with its existing vectors as a fallback if new art fails at small sizes. |
| `NotebookIllustration.tsx` | Page, bookmark and path sketches; used through `NotebookEmptyState` and in the library. | Retain. These solve small-scale communication well. Harmonize colours/line weight later, not an immediate three-image replacement. |
| `CategoryIcon.tsx` | Coherent lightweight icons for actual categories. | Retain as functional icons; no textured raster replacements at icon size. |
| Inline/CSS details | Daily Quest sun stamp, ReturnMessage sprig, action arrow, heading underlines, helpful/reflection bookmarks, calendar/history marks. | Retain selectively. Standardize stroke weight and placement. These are UI-scale motifs, not substitutes for feature artwork. |
| Phase 0 `JourneyArt` and comparison assets | Useful isolated record of the chosen design direction. | Preserve preview. Do not copy its separate icon implementation into production. |

The original background briefs explicitly requested “very low contrast”, “extremely sparse” and large blank areas. The gap is partly a brief mismatch, not poor implementation. The next briefs must ask for **readable focal illustrations with controlled detail**, not near-invisible backgrounds.

## 3. Curated collection: three commissions, six core images

Recommended initial scope: **one opening landscape, one botanical vignette, and four stamp interiors**. Theme/crop exports are derivatives of those compositions, not additional subjects. No new footer painting, category image collection, per-tip thumbnails or empty-state collection in this batch.

Sizes and budgets are proposed delivery targets, not measurements of generated files. Retain editable/high-resolution masters outside the runtime bundle; approve compressed exports at their real rendered sizes.

### A. “A path begins” — priority 1

- **Location:** hero branding area; visually paired with, but not painted behind, Daily Quest text.
- **Composition:** a gently bending path beginning near the lower edge, low sage hills, a modest warm sunrise and two foreground botanical clusters. Asymmetric, open and welcoming. No summit, destination building or figure. The foreground should be noticeably more substantial than `small-steps.webp` while the horizon stays quiet.
- **Relationship:** evolve the existing path/sun motif and emblem's flowing curve. This replaces the current hero background role, not the brand emblem.
- **Master/export:** landscape 2:1, about 1600 × 800 master; desktop 1200 × 600 and compact 600 × 300 WebP exports. Compose the key path bend, sun and plant cluster so a 4:3 crop around the right-centre also works.
- **Transparency:** alpha around the outer landscape silhouette/wash; avoid a large rectangular cream sky. If the transparent version loses delicate pencil edges, use an intentionally framed opaque illustration with explicit light/dark paper editions instead of an unreliable CSS mask.
- **Desktop:** approximately 260–360px wide in a reserved art region when space allows. Keep hero height governed by existing content; do not introduce a tall new banner above it.
- **Mobile:** small 80–120px crop in a reserved margin/slot, or omit secondary foreground details. Do not shrink the entire desktop scene to a postage stamp or narrow the localized heading to accommodate it. Maximum added illustration-only height around 56–72px; omit when it would delay the action excessively.
- **Dark:** warm cream pencil highlights, sage midtones and a muted ochre sun on the dark paper palette. Produce a matched colour grade if necessary; never blanket-invert or grayscale the scene.
- **Budget:** desktop ≤100 kB, mobile ≤35 kB per selected theme; load one appropriate source. Static raster, not animated SVG.

**Subject brief:** “An inviting, modest winding path beginning at the viewer's lower edge and continuing between low soft hills toward a small sunrise. Two uneven clusters of ordinary meadow leaves give the foreground a human scale. Pencil edges, translucent sage and terracotta watercolour washes, gently varied pigment, warm ochre light. Quiet sky/negative space, no destination, people, buildings, lettering, UI or logo. Designed as a compact editorial illustration with a clear silhouette, not a detailed fantasy landscape.”

### B. “Growth remains” — priority 2

- **Location:** weekly activity goal, beside the active-day count and day markers.
- **Composition:** two or three healthy seedlings of different shapes sharing a short, gently curved soil contour. No numbered stages, measurement ticks, pots in a row or wilting state. A small taller leaf creates an upward gesture without a success/failure ladder.
- **Relationship:** reinterpret the subjects of `gradual-growth.webp` with stronger pigment and less blank canvas. Plant shapes should match the hero foreground and the days stamp.
- **Master/export:** approximately 1000 × 750 master, 4:3; 640 × 480 desktop and 240 × 180 mobile WebP.
- **Transparency:** yes, with clean soft edges; no baked cream rectangle. A small local paper wash can remain within the silhouette.
- **Desktop:** approximately 180–230px wide, integrated into the existing art column. Mobile: 64–88px detail, with reserved space; remove decorative space if a long Serbian heading needs it.
- **Dark:** retain living green and warm earth rather than the current inverted grayscale treatment. Check edge contrast on the actual dark surface. Use a matched export only if a single alpha image cannot work well in both themes.
- **Budget:** ≤45 kB desktop and ≤15 kB mobile per selected theme. Static raster. **Never change the image according to weekly inactivity, goal settings or a reset.** Real progress remains in native text, day markers and the progress element.

**Subject brief:** “A small editorial botanical study of three healthy, imperfect seedlings on one gently uneven earth contour, each with a distinct natural leaf shape. Pencil veins and stems, soft sage watercolour, tiny warm terracotta soil accents, generous breathing room. Growth is quiet and enduring. No decay, comparative arrows, numbers, labels, trophies, pots in a sequence or surrounding landscape. Transparent outer background; readable as a 200px-wide vignette and as one selected leaf detail at 72px.”

### C. “Notebook keepsakes” — priority 3

- **Location:** existing PersonalMilestones, PersonalBest and CategoryExploration slots.
- **Subjects:** actions = open notebook and short pencil; active days = healthy seedling; personal best = low sun above a gentle path; exploration = path branching between low hills with a small unlettered wooden marker. Retain the existing four meanings.
- **Composition:** one prominent subject per stamp, irregular pencil edge and two or three washes. Same visual scale, light direction, paper grain and viewing angle across the family. Enough detail to feel drawn, few enough marks to remain legible at 64px.
- **Relationship:** extend the existing `AchievementStamp` vocabulary. Reuse the hero's sun/path and botanical vignette's leaves. Do not create a different painting for every threshold.
- **Master/export:** 1:1, 768 × 768 master per subject; 256 × 256 alpha WebP per interior. Native SVG/CSS frame and localized labels remain outside the raster.
- **Transparency:** yes around the motif; optional contained pale paper wash. Do not bake a number, earned state or text into artwork.
- **Desktop/mobile:** same artwork at existing roughly 64–112px slots, without increasing card height. Use textual labels and a native frame distinction for earned/not-yet-earned; the sketch should remain attractive before earning it. No padlocks or celebratory rays that imply a new rule.
- **Dark:** a restrained warm paper medallion can protect pigment and pencil visibility, with surrounding frame adapted by theme. If it looks too bright, use a matched interior grade, not global inversion.
- **Budget:** ≤15 kB each at runtime, ≤60 kB for the four interiors per selected theme, plus ≤8 kB compressed for any shared SVG frame/motif additions. Static raster interiors with native vector framing.

**Subject brief:** “A sophisticated miniature editorial illustration for a personal notebook keepsake: [SUBJECT]. Draw a single memorable silhouette using delicate uneven pencil strokes and restrained sage, terracotta, ochre and muted blue watercolour. Soft local pigment variation, sparse fine hatching, warm paper influence. Centred with generous safe margin; consistent scale with the companion pieces. No letters, numbers, medal hardware, stars, trophy shine, game badge bevels, heavy outlines or elaborate background. Transparent outside the small illustration.”

Produce and approve **one actions stamp first**. Use it as a visual reference for the remaining three rather than independently prompting four different styles.

### Deferred, conditional asset

A small open-notebook/pencil still life for the action area is a plausible later addition, but it is not yet justified alongside the existing pencil and new actions stamp. If review shows a real gap after A–C: use a 3:2 transparent 480 × 320 WebP ≤20 kB, display at 80–120px desktop and ≤56px mobile, with no text and the same dark treatment as the stamps. Reuse it for support or collection introductions only where those views are mutually exclusive. It should replace an existing motif, not accumulate beside it.

## 4. Unified generation style guide

Use this common direction with each subject brief:

> Warm, sophisticated hand-drawn editorial illustration for Carpe Acta, a personal notebook for taking small practical actions. Delicate graphite/coloured-pencil contours with visible but restrained variation, translucent watercolour pigment, small areas of natural paper grain, imperfect organic silhouettes and calm asymmetric balance. Optimistic through light and living plants, never through cartoon faces. Clear foreground subject, quiet secondary forms and generous negative space. Palette based on warm cream #f7f3ea and #fffaf0, terracotta #d8582b, sage #2f765d, muted blue #315f8c and charcoal #1f2933; ochre only as a small sunlight accent. Illustration only: no typography, letters, numerals, logo, interface, buttons, frame of a website or screenshot. No glossy rendering, vector-stock appearance, neon, exaggerated gradients, plastic 3D, fantasy castle, trophy or dense ornamental border.

Additional production rules:

- Pencil is the structural layer; wash supplies depth. Avoid uniform black outlines and smooth vector blobs pretending to be watercolour.
- Use the existing raster pencil work as the texture reference and original mockup 2 as the composition/material reference. Mockup 4 supplies light and botanical warmth. Reference images guide style; their text and feature inventions do not enter the brief.
- Keep the original brand colours recognizable, but allow diluted pigments. Terracotta remains primarily associated with action, sage with progress, blue with exploration, ochre with warmth/support. Do not place equally saturated patches of all four colours in every asset.
- Keep texture inside illustrated objects and small paper areas. Avoid a repeated full-page grain bitmap or texture beneath body text.
- Illustrations need no embedded language. English and Serbian UI remain native Fraunces/Inter text.
- Require a transparent PNG master for cutouts and compressed WebP delivery; inspect alpha edges on both actual surfaces. Do not automatically vector-trace painterly artwork into huge SVGs. Use SVG only for simple rules, branches, frames and functional icons.
- No motion in this art batch. Static sunlight and plants are enough. No parallax, auto-drawing paths or growth animations tied to personal records.

## 5. Integration map for a later approved phase

| Actual component/area | Relevant stylesheet | Proposed integration boundary |
| --- | --- | --- |
| `App.tsx` hero / `BrandEmblem.tsx` / `DailyQuest.tsx` | `styles/introduction.css`; inherited hero pseudo-element in `styles.css` | Dedicated decorative image slot or picture element; retire the old hero pseudo-image in that scope. Keep brand text, quest, star and start link native and in current reading order. No duplicate scene behind quest copy. |
| `TipCard.tsx`, generator in `App.tsx` | `styles/current-action.css`, generator background in `styles.css` | Retain active card layout and pencil arrow. Reposition/reduce the existing generator sketch if it competes with the new hero. No illustration between instructions and completion controls. |
| `HelpMeStart.tsx`, `HelpfulActionPicker.tsx`, `ReturnMessage.tsx` | `styles/guided-support.css` | Reuse pencil crop, bookmark and sprig. Keep decorative content outside option/focus bounds. Consider an alpha pencil export later if dark treatment is unsatisfactory. |
| `WeeklyGoal.tsx` | `styles/activity-history.css` `.weekly-growth-art` | Replace the CSS background slot with an intrinsically sized decorative picture if the botanical asset is approved. Retain all active-day calculations, goal settings and recorded-week text. |
| `ProgressView.tsx`, `ActivityCalendar.tsx` | `styles/activity-history.css` | Improve grouping and available space. Calendar remains native, scrollable and selectable; no image-backed cells or simplified monthly replacement. History retains dates, filters and its small native timeline marks. |
| `AchievementStamp.tsx`, `PersonalMilestones.tsx`, `PersonalBest.tsx`, `CategoryExploration.tsx` | `styles/achievements.css` | Replace only the decorative interior renderer. Existing kind/earned props, labels, thresholds, disclosure and celebration/import/undo handling remain unchanged. Keep one shared implementation. |
| `TipLibrary.tsx`, `FavoriteTips.tsx`, `NotebookIllustration.tsx`, `NotebookEmptyState.tsx` | `styles/discovery-account.css` | Retain existing compact art. Match the new family through palette/line discipline only. Do not add images to every tip or turn errors/loading into empty states. |
| `WhatHelpsMe.tsx` | `styles/achievements.css` | Retain bookmark/journal treatment. Any motif is a reused section accent, not one image per feedback entry. |
| `AppFooter.tsx` | `styles/introduction.css`; inherited footer pseudo-element in `styles.css` | Reposition existing onward-path image; maintain text/credit clearance and shallow mobile crop. |
| `src/dev/design/*` and later phase previews | Preview-only styles | Preserve original comparisons. After artwork approval, an isolated art review can show actual assets at intended sizes on both theme surfaces before integration. |

Do not stack another broad override stylesheet on top of all prior phases. Later integration should update the owning phase rules and remove superseded declarations in the same narrow review. A new general illustration abstraction is unnecessary unless the approved assets actually share rendering requirements.

## 6. Responsive, accessibility and performance rules

- **Art never owns the text box.** Reserve a grid/flex slot; allow long Serbian strings to wrap before deciding whether there is space for art. At narrow widths hide secondary decoration rather than shrinking text or buttons.
- Preserve one DOM reading order across breakpoints. No mobile duplicate of the action, quest or controls.
- Use intrinsic `width`/`height` and an agreed aspect ratio for every image. Reserve the slot before decode; artwork must not shift controls after loading.
- Use `picture`/`srcset` where art direction requires it, with sizes matching actual slots. Avoid loading both hidden desktop and mobile images. Load the opening appropriately; lazy-load below-fold painted stamps/progress if using native images.
- Proposed maximum new selected-source artwork budget is approximately **205 kB desktop** (100 + 45 + 60) or **110 kB mobile** (35 + 15 + 60), before allowing for replacement of existing loaded assets. These are caps, not quotas; measure actual network transfer and decoding after integration. Theme alternatives need not all be fetched initially.
- Decorative raster images use `alt=""`; decorative SVGs retain `aria-hidden="true"` and `focusable="false"`. Earned state, category identity and numeric progress remain accessible text/native semantics.
- Decoration uses `pointer-events: none` and never covers controls, focus outlines, Menu, Undo or dialog boundaries. Do not use negative stacking tricks that make art dependent on unrelated ancestor backgrounds.
- Text retains a solid surface beneath it. Verify actual contrast for text and controls after art placement; image colour itself must not carry essential state.
- In forced-colours and print, suppress optional art without leaving empty layout gaps. Existing reduced-motion support stays intact; no new animation is proposed.
- Dark mode must be an equally deliberate composition. Current hero luminosity/low opacity and inverted-grayscale plant/pencil are technical accommodations, not the final art direction. Preserve warm pigment through transparent art or matched editions; do not brighten whole images indiscriminately.

## 7. Implementation and review order

1. **Approve this scope:** hero + botanical vignette + four stamp interiors, with composition improvements and reuse elsewhere. No integration yet.
2. **Art exploration:** create the hero and a single actions stamp using the shared guide. Review actual artwork against the original mockups at intended desktop/mobile sizes and on both theme colours. Reject polished-but-generic or overly faint results before multiplying them.
3. **Complete the family:** derive the botanical vignette and remaining stamps from the approved style. Produce necessary mobile/theme exports; review them as a contact sheet and individually at 64–112px.
4. **Artwork approval gate:** approve the actual six images, their cropped versions and colour treatment. Compression must preserve pencil detail and clean alpha edges. No native UI integration before this approval.
5. **Opening integration:** hero composition and responsive artwork placement in one reviewable change. Preserve the existing start route and action prominence.
6. **Progress/stamps integration:** botanical slot and stamp interiors, then limited progress grouping improvements. Do not couple this work to achievement logic or calendar rewrites.
7. **Continuity pass:** consolidate duplicate pencil appearances, retain small sketches, adjust footer crop and remove obsolete image rules. Do not add more artwork unless a demonstrated gap remains.
8. **Validation:** EN/SR, light/dark, 320/390/tablet/desktop, 200% text/zoom, keyboard/focus, forced-colours, reduced-motion, real empty/error/populated states, completion/undo/import non-celebration behavior, existing tests/build and asset/network measurements. Compare before/after with identical content and record any added mobile height.

## 8. Main risks and trade-offs

- **Artwork cannot fix composition by itself.** Large additions inside the existing equal-weight panel stack could make the app longer without making it more distinctive. Limit the number of focal points and adjust placement as part of integration.
- **Raster richness versus flexibility:** painted work best matches the mockups but needs crop/theme exports and byte discipline. Retain SVG for small controls and state frames, where it is sharper and easier to recolour.
- **Visual consistency:** independently generated pieces can differ in perspective, grain and line density. Approve anchor pieces first and use them as references for the rest.
- **First-visit warmth:** withholding all colour until achievements are earned makes an empty account feel less welcoming. Keep base art attractive while state labels remain exact; this does not alter thresholds or imply an earned achievement.
- **False meaning:** seedlings must not encode daily compliance; a path must not imply a new destination, streak or progression system. Missing a day never damages the illustration.
- **Dark halos and noise:** cream-backed rasters and alpha fringe can look pasted on dark brown surfaces. Test real assets against those surfaces before approval; never rely on grayscale as the default fix.
- **Mobile density:** decorative height competes directly with the action. The hero's art must be cropped or omitted before making controls harder to reach. The weekly mobile heading already reserves room for art; review this with long labels.
- **Repeated frames:** irregular borders, bookmarks, underlines and stamps become clutter when all appear together. Allow only one strong notebook cue per local group, with calm geometry around inputs.
- **Scope creep:** no new categories, tip photos, avatar narrative, achievements, metrics, product name, navigation destinations or image-rendered UI. Account forms remain quiet and trustworthy.

**Recommended approval decision:** proceed next to artwork exploration for the three commissions above, not direct integration. The app's existing structure should remain the working foundation. The biggest visible gains should come from confident placement and better original illustration, rather than another layer of card decoration.
