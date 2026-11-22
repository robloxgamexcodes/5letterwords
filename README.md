# 5 Letter Words

Static word-finder site: 3 to 7 letter finders, Wordle solver, unscrambler, anagram solver, word lists, games and guides.
Astro 7 (static output), React islands and Tailwind 4. About 1,950 pages.

## Run
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/ plus the automatic SEO check (scripts/check-seo.mjs)
npm run preview
```
Node 22.19+. `predev` and `prebuild` regenerate word data from `data-sources/`.

## Configuration
- `PUBLIC_SITE_URL` (see `.env.example`): production origin. Falls back to `https://5letterwords.se`.
- Domain notes: `docs/DOMAIN-AND-LOCALE.md`. What changed and why: `docs/SEO-CHANGELOG.md`.

## Structure
- `src/pages/[...slug].astro` generates the finders, every list page (start, end, contain, 2-letter prefixes, 2-3 letter endings, pattern collections) and the game pages. URL shapes live in `src/lib/site.ts`.
- `src/lib/collections.ts` pattern collections, `src/lib/stats.ts` data-driven copy, `src/lib/copy.ts` and `src/lib/games.ts` page text.
- Word data: edit `data-sources/*.txt`, run `npm run build:words`. See `src/data/README.md`.

## Before launch
1. Confirm the `contact@` mailbox exists (the address is derived from the domain).
2. Add real author or team names to About Us and Sources (E-E-A-T).
3. The games are named Wordle, Dordle and Quordle, which are trademarked names. Get advice or rename.
4. Submit `/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
