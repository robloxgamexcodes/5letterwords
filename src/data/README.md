# Word-list provenance

`generated/` is produced by `scripts/build-words.mjs` (runs before `dev` and `build`). Never edit it by hand.

| Output | Source | Notes |
| --- | --- | --- |
| `words-3..7.json`, `meta.json` | `data-sources/enable1.txt` (+ optional dictionaries) | ENABLE word list, public domain. |
| `answers-5.json` | `data-sources/answers-5.txt` | Curated everyday 5-letter words used by the games, the Wordle helper and "common first" ordering. Proper nouns, brands, places and offensive words are excluded. |
| `common.json` | `data-sources/common-words.txt` | Everyday 3, 4, 6 and 7 letter words, listed first on sample lists. |

Edit the files in `data-sources/`, then run `npm run build:words`.
