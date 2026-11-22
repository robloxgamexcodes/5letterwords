# SEO changelog (22 Nov 2026 audit)

## Critical
- `public/robots.txt` hard-coded a sitemap on another domain and shadowed the dynamic route. Deleted; `src/pages/robots.txt.ts` is the only source and always uses the site URL.
- Canonical, og:url, twitter:url and sitemap fall back to `https://5letterwords.se` when `PUBLIC_SITE_URL` is missing (never `example.com`).
- `scripts/check-seo.mjs` runs after every build and fails it on placeholder or foreign domains, wrong canonicals, missing/duplicate/over-long titles and descriptions, missing or multiple H1, invalid JSON-LD, wrong robots.txt sitemap and off-site sitemap URLs.

## Content and topical SEO
- List pages server-render up to 500 words (all words for about 90% of lists), everyday words first. Titles say "All N" only when true.
- Every list page has a unique data-driven "About these words" block, 3-4 FAQs (FAQPage schema), related links and CollectionPage/ItemList schema.
- Finder pages (3-7 letters) have a unique facts paragraph computed from their words.
- Sample lists show everyday words instead of obscure alphabetical entries.
- New pages: 2-3 letter endings (ER, ED, ING...) and pattern collections (double letters, no repeated letters, without vowels, one/two/three vowels, same first and last letter, palindromes, Q without U). 1,951 pages in total.
- `/wordle-solver` no longer repeats the homepage word list; it has its own intent, schema and a short likely-answers list.
- Answer list cleaned: 85 proper nouns, brands, places and offensive words removed (`data-sources/answers-5.txt`).

## Schema
Organization + WebSite (home), WebApplication (finders, tools, games), CollectionPage + ItemList + FAQPage (lists), Article with dates (guides), BreadcrumbList (all subpages).

## Technical
- Viewport tag cleaned, correct og:type per page, og:image size and alt, hreflang en + x-default, theme-color, PNG favicon and apple-touch-icon.
- Visible breadcrumbs on all subpages; navigation order fixed (3, 4, 5, 6, 7).
- Sitemap has lastmod; 404 excluded. Cache headers for assets and word data in `vercel.json`.
- Counts on pill links are CSS `data-count`, not anchor text; "Click for definition" no longer repeats 80 times in the text.
- UI labels are no longer headings.

## Accessibility (local Lighthouse: 100 on home, lists, tools, game, guides)
- Brand green darkened (`--accent` #2f7d32, white text 5.1:1, was 2.8:1). This was the main cause of the 93 score.
- Like buttons 24px; word chip names match their visible text; game boards have a role.

## Removed
- Non-functional comments box, Dislike/Add buttons and report dialog on game pages (report is now a link to the contact page).
