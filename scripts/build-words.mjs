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

// Curated "common word" list (data-sources/answers-5.txt): used for the daily games, the Wordle helper ranking,
// the best-starting-words maths and the common-words-first ordering of sample lists. Every entry must be a valid 5-letter word.
const answersFile = join(src, 'answers-5.txt');
if (existsSync(answersFile)) {
  const valid = new Set(JSON.parse(readFileSync(join(out, 'words-5.json'), 'utf8')).w.split(' '));
  const answers = [...new Set(readFileSync(answersFile, 'utf8').split(/\r?\n/).map((w) => w.trim().toLowerCase()).filter((w) => /^[a-z]{5}$/.test(w)))];
  const unknown = answers.filter((w) => !valid.has(w));
  if (unknown.length) throw new Error(`[build-words] answers-5.txt has words missing from the dictionary: ${unknown.join(', ')}`);
  writeFileSync(join(out, 'answers-5.json'), JSON.stringify({ a: answers.join(' ') }));
  console.log(`[build-words] ${answers.length} common words`);
}
console.log(`[build-words] ${meta.total} words`, Object.fromEntries(LENGTHS.map((l) => [l, meta.lengths[l].count])));

// Familiar words for the other lengths (data-sources/common-words.txt, one length detected per word).
// Sample lists show these first so visitors see everyday words instead of obscure dictionary entries.
const commonFile = join(src, 'common-words.txt');
if (existsSync(commonFile)) {
  const byLen = {};
  const dropped = [];
  const words = readFileSync(commonFile, 'utf8').split(/\r?\n/).filter((l) => !l.trim().startsWith('#')).join(' ').split(/\s+/).map((w) => w.trim().toLowerCase()).filter(Boolean);
  for (const len of LENGTHS) {
    if (len === 5) continue;
    const valid = new Set(JSON.parse(readFileSync(join(out, `words-${len}.json`), 'utf8')).w.split(' '));
    const list = [...new Set(words.filter((w) => w.length === len))];
    byLen[len] = list.filter((w) => valid.has(w));
    dropped.push(...list.filter((w) => !valid.has(w)));
  }
  writeFileSync(join(out, 'common.json'), JSON.stringify(byLen));
  console.log('[build-words] common words per length', Object.fromEntries(Object.entries(byLen).map(([k, v]) => [k, v.length])), dropped.length ? `(ignored ${dropped.length} not in dictionary)` : '');
}
