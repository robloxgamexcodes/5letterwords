# AI Guide

Notes for AI coding assistants working in this repo.

- **Stack**: Astro 7 (static), React islands only for the interactive tools, Tailwind 4 (+ hand-written tokens in `src/styles/global.css`).
- **Routing**: `src/pages/index.astro`, tool/legal pages as files, and one catch-all `src/pages/[...slug].astro` that generates the
  length finders, every list page (`/5-letter-words-that-start-with-a` etc.) and the game pages. URL shapes live in `src/lib/site.ts` (`listPath`, `lengthPath`).
- **Data**: never edit `src/data/generated/`. Edit `data-sources/*.txt` (enable1, answers-5, common-words) and run `npm run build:words`.
  Dictionaries are optional files; UI must hide options that have no data.
- **Filter logic**: `src/lib/filter.ts` is the single source of truth (used by the React island). Keep semantics: wrong-spot excludes its slot,
  dead letters only drop *spare* copies, Count repeats toggles whether a letter in both rows needs one copy or two.
- **Settings**: display options are shared between the finder, unscrambler and footer via `src/lib/settings.ts` (localStorage + `lw:settings` event).
- **Copy**: page text is in `src/lib/copy.ts` / `src/lib/games.ts`; counts are computed from data, never hard-coded.
- After changes run `npm run build` and spot-check `/`, a list page and `/word-unscrambler`.
- `npm run build` ends with `scripts/check-seo.mjs`; keep it passing (titles <= 65, descriptions 70-165, one H1, correct canonicals).
