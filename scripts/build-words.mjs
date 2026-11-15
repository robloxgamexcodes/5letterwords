// Builds src/data/generated/words-{3..7}.json and meta.json from data-sources/*.txt
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'data-sources');
const out = join(root, 'src/data/generated');
mkdirSync(out, { recursive: true });

// The raw word lists (data-sources/*.txt) are not committed. If they are missing, keep the
// already-generated JSON in src/data/generated so `npm run build` still works.
if (!existsSync(join(src, 'enable1.txt'))) {
  console.log('[build-words] data-sources/enable1.txt not found - using existing src/data/generated files');
  process.exit(0);
}

const LENGTHS = [3, 4, 5, 6, 7];
const BASE = 'enable1.txt';
const DICTS = { nwl: 'nwl.txt', collins: 'collins.txt', wwf: 'wwf.txt', 'wordle-guesses': 'wordle-guesses.txt', 'wordle-answers': 'wordle-answers.txt' };

const read = (file) =>
  new Set(
    readFileSync(join(src, file), 'utf8')
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => /^[a-z]{3,7}$/.test(w)),
  );

const lists = { base: read(BASE) };
for (const [key, file] of Object.entries(DICTS)) if (existsSync(join(src, file))) lists[key] = read(file);

const union = new Set();
for (const set of Object.values(lists)) for (const w of set) union.add(w);

const meta = { total: 0, dictionaries: Object.keys(lists).filter((k) => k !== 'base'), lengths: {} };
for (const len of LENGTHS) {
  const words = [...union].filter((w) => w.length === len).sort();
  const index = new Map(words.map((w, i) => [w, i]));
  const sets = {};
  for (const [key, set] of Object.entries(lists)) {
    if (key === 'base') continue;
    sets[key] = words.filter((w) => set.has(w)).map((w) => index.get(w));
  }
  writeFileSync(join(out, `words-${len}.json`), JSON.stringify({ w: words.join(' '), s: sets }));
  meta.lengths[len] = { count: words.length, sets: Object.fromEntries(Object.entries(sets).map(([k, v]) => [k, v.length])) };
  meta.total += words.length;
}
writeFileSync(join(out, 'meta.json'), JSON.stringify(meta, null, 2));
console.log(`[build-words] ${meta.total} words`, Object.fromEntries(LENGTHS.map((l) => [l, meta.lengths[l].count])));
