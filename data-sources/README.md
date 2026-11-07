# Word-list sources

`scripts/build-words.mjs` turns the plain-text lists in this folder into the JSON used by the site
(`src/data/generated/`). One word per line, any case, any length — the script keeps a–z words of 3–7 letters.

| File                     | Dictionary option in the finder | Status in this repo |
| ------------------------ | ------------------------------- | ------------------- |
| `enable1.txt`            | All dictionaries (base list)    | **Included** — ENABLE, public domain |
| `nwl.txt`                | Scrabble US (NWL)               | Not included — add your licensed list |
| `collins.txt`            | Scrabble UK (Collins)           | Not included — add your licensed list |
| `wwf.txt`                | Words With Friends              | Not included — add your licensed list |
| `wordle-guesses.txt`     | Wordle guesses                  | Not included — add your list |
| `wordle-answers.txt`     | Wordle answers only             | Not included — add your list |

Rules:

* "All dictionaries" is the **union** of every file present.
* A dictionary option only appears in the dropdown when its file exists, so the UI never offers a filter that has no data.
* Every count shown on the site (12,975 style totals, per-letter counts, sitemap) is computed from these files.
* Run `npm run build:words` after changing a file (it also runs automatically before `dev` and `build`).

ENABLE (Enhanced North American Benchmark Lexicon) is public domain. The Collins, NWL and Wordle lists are
third-party works — check their licence terms before adding them.
