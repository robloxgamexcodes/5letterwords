# SEO fixes applied (from the Ahrefs audit of 21 Nov 2026)

| Ahrefs issue | Pages | Root cause | Fix |
|---|---|---|---|
| Pages not indexable (every page) | all | `PUBLIC_SITE_URL` not set on the host, so canonical/og:url/sitemap used `https://example.com` | `src/lib/site.ts`, `astro.config.mjs`, `robots.txt.ts`, `.env.example` now default to `https://5letterwords.se` |
| robots.txt pointed at another domain | 1 | `public/robots.txt` hard-coded `5letter-words.io` sitemap and shadowed the dynamic route | Deleted `public/robots.txt`; `src/pages/robots.txt.ts` is the only source |
| Noindex page / Noindex + follow page | 403 | Lists with <5 words were built as noindex but still linked everywhere | `src/lib/words.ts` (`MIN_WORDS`, `hasList`): thin lists are no longer built or linked. Links updated in `BrowseLists.astro`, `word-lists.astro`, `sitemap.astro` |
| Page has only one dofollow inlink | 132 | "containing X" and rare prefix pages were linked from `/word-lists` only | `BrowseLists.astro` now links all "containing" letters, sibling prefixes and the same list in other lengths; sitemap page lists "containing" too |
| Title too short | 7 | Legal/game pages used a bare name as `<title>` | `seoTitle` added to `LegalPage.astro` and `games.ts`; titles are now 31-60 chars |
| Meta description too short | 7 | One-line descriptions | Rewritten to 110-160 chars (legal pages, games, anagram solver, sitemap) |
| Meta description too long | 5 | Finder description was 168 chars | `finderMeta()` in `copy.ts` shortened to ~140 chars |

## Extra fixes found while auditing
- `vercel.json` CSP blocked the Ahrefs Web Analytics script (`analytics.ahrefs.com`); added to `script-src` and `connect-src`.
- `og:type` was `article` on every page; now `website`.
- `404` page is now `noindex`.

## Must do after deploying
1. In Vercel -> Settings -> Environment Variables set `PUBLIC_SITE_URL=https://5letterwords.se` (optional now, the code falls back to it) and redeploy.
2. Submit `https://5letterwords.se/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
3. Re-run the Ahrefs crawl.
