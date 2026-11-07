# 5letter-words.io — Astro replica

A static Astro 7 + React + Tailwind 4 rebuild of the 5letter-words.io word-finder site: same routes, page
structure, navigation, footer settings, solver controls and result format as the reference.

## Run

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static output in dist/ (1,700+ pages)
npm run preview
```

Node 22.19+ required. `predev`/`prebuild` regenerate the word data from `data-sources/`.

## What's in the box

| Route | Page |
| --- | --- |
| `/` | 5-letter finder (tile rows, More filters, Display options, FAQ, browse lists) |
| `/3-letter-word-finder`, `/4-…`, `/6-…`, `/7-…` | Same finder for other lengths |
| `/5-letter-words-that-start-with-a` · `…that-end-with-a` · `…containing-a` | List pages for every length 3–7 |
| `/5-letter-words-that-start-with-ab` | Two-letter-prefix pages (linked from each starting-letter page) |
| `/wordle-solver` | The finder preset to the Wordle-answers dictionary (when that list is supplied) |
| `/word-unscrambler`, `/anagram-solver`, `/word-scramble` | Tile-input tools with Scrabble / Words With Friends scoring, wildcards, filters |
| `/word-lists` | Hub linking every list |
| `/wordle`, `/dordle`, `/quordle`, `/crossword`, `/scrabble` | Game pages (player frame, like/share/report, copy) |
| `/about-us`, `/contact-us`, `/dmca`, `/privacy-policy`, `/terms-of-service` | Legal pages |

Finder behaviour: right-spot / wrong-spot / not-in-word rows (5 + 5 + 20 slots), begins/ends/letter-run (`_` gap)/rack
(`?` blanks)/built-only filters, Count repeats, Wordle colours, best-first sort, uppercase, high contrast, dark mode.
Dark mode and Scrabble scores are also in the footer; every display option persists in `localStorage`.

## ⚠️ Things you must finish before launch

1. **Word lists.** Only the public-domain ENABLE list ships (8,636 five-letter words, 51,852 total for 3–7 letters).
   The reference uses licensed Scrabble/Collins/Wordle data (12,975 five-letter words). Drop your lists into
   `data-sources/` (`nwl.txt`, `collins.txt`, `wwf.txt`, `wordle-guesses.txt`, `wordle-answers.txt`) — see
   `data-sources/README.md`. The Dictionary dropdown, `/wordle-solver` preset and every count update automatically; the dropdown
   stays hidden until at least one extra list exists.
2. **Game players.** The five game pages have the full UI, but the player frame needs an `embedUrl` per game in
   `src/lib/games.ts`.
3. **Copy.** All page text is original wording that follows the reference's structure — paste your own final copy into
   `src/lib/copy.ts`, `src/lib/games.ts` and the legal pages. `contact@5letter-words.io` is a placeholder address.
4. **Branding / images.** The logo is a CSS tile mark and OG images point at the reference URLs from
   `src/lib/site.ts`; replace them with your own assets in `public/`.
5. **Visual fidelity.** Structure and behaviour follow the reference page text, but colours, fonts and spacing were
   designed independently (the reference's stylesheet wasn't available). Tune `src/styles/global.css` (tokens at the top).

## Deploying to Vercel

`vercel.json` uses `cleanUrls` so `/wordle.html` is served at `/wordle`. (The original starter combined `routes` with
`headers`, which Vercel rejects — that's been removed.) The CSP allows common ad/analytics origins and `frame-src https:`
for game embeds; tighten it to the exact providers you use.
