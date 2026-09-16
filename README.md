# Carpe Acta

Carpe Acta is an anti-procrastination web app built around practical tips, small quests, and repeatable daily action.

The first version focuses on a small, useful loop:

- show a featured daily quest
- generate a random anti-procrastination tip
- browse tips by category
- keep the content data-driven so the app can grow without rewrites

## Tech Stack

- React
- TypeScript
- Vite
- Plain CSS with design tokens

This keeps the first version lightweight while leaving room for later features such as favorites, search, streaks, Pomodoro sessions, XP, achievements, and RPG progression.

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the local development server
- `npm run build` - type-check and build the app
- `npm run preview` - preview the production build locally
- `npm test` - check tip content integrity, localization, and selection behavior

## Project Shape

```text
src/
  components/   Reusable React UI components
  data/         Static app content for the MVP
  types/        Shared TypeScript domain types
  utils/        Pure helper functions
```

## Adding a bilingual tip

1. Add metadata to `src/data/tips.ts`: a unique, stable `id`, an existing
   `categoryId`, positive `effortMinutes`, and `tags` (use `[]` until tags are
   curated). Effort estimates the immediate action, not the whole project.
   Preserve existing IDs and ordering; order affects daily quests and previews.
2. Add the same ID to both `src/i18n/tips/en.ts` and
   `src/i18n/tips/sr-Latn.ts`, with nonempty `title`, `text`, and `action`.
   `whyItWorks` is optional; add it only when reviewed content exists. It is not
   displayed yet. Keep tags language-independent and consistently lowercase.
3. Run `npm test` and `npm run build`, then check both languages in the app.

`TipId` is derived from the metadata catalog. TypeScript requires every tip in
both translation maps; there is no separate ID list to maintain. Base metadata
types live in `src/types/tipMetadata.ts` so they do not depend on the catalog.
Interface copy remains in `src/i18n/messages.ts`; `src/i18n/localizeTip.ts`
combines it with tip translations for display. Favorites and completion records
should eventually reference tip IDs rather than become fields on shared content.
