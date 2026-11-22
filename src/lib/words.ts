import w3 from '../data/generated/words-3.json';
import w4 from '../data/generated/words-4.json';
import w5 from '../data/generated/words-5.json';
import w6 from '../data/generated/words-6.json';
import w7 from '../data/generated/words-7.json';
import meta from '../data/generated/meta.json';
import commonJson from '../data/generated/common.json';
import { ANSWERS } from './game';
import { availableDictionaries, parseLengthData, type LengthData } from './dictionaries';
import { ALPHABET, LENGTHS, type ListKind } from './site';
import { COLLECTIONS } from './collections';
import { matchesBase } from './filter';
import { score } from './scoring';

export const RAW: Record<number, { w: string; s: Record<string, number[]> }> = { 3: w3, 4: w4, 5: w5, 6: w6, 7: w7 };
const cache = new Map<number, LengthData>();

const COMMON_WORDS: Record<number, string[]> = { ...(commonJson as Record<string, string[]>), 5: ANSWERS } as unknown as Record<number, string[]>;

export function getData(len: number): LengthData {
  if (!cache.has(len)) {
    const data = parseLengthData(RAW[len]);
    const at = new Map(data.words.map((w, i) => [w, i] as const));
    data.common = new Set((COMMON_WORDS[len] ?? []).map((w) => at.get(w)).filter((i): i is number => i !== undefined));
    cache.set(len, data);
  }
  return cache.get(len)!;
}
/** Everyday words for one length (a subset of the dictionary). */
export const commonWords = (len: number) => {
  const d = getData(len);
  return [...d.common].sort((a, b) => a - b).map((i) => d.words[i]);
};
export const isCommon = (len: number, word: string) => commonSet(len).has(word);
const commonSets = new Map<number, Set<string>>();
const commonSet = (len: number) => {
  if (!commonSets.has(len)) commonSets.set(len, new Set(commonWords(len)));
  return commonSets.get(len)!;
};
/** Words in display order: everyday words first, then the rest. */
export const orderWords = (len: number, words: string[]) => {
  const c = commonSet(len);
  if (!c.size) return words;
  const head: string[] = [];
  const tail: string[] = [];
  for (const w of words) (c.has(w) ? head : tail).push(w);
  return head.concat(tail);
};
export const getWords = (len: number) => getData(len).words;
export const dictionariesFor = (len: number) => availableDictionaries(RAW[len]);
export const totalWords = meta.total;
export const countFor = (len: number) => getWords(len).length;
export const fmt = (n: number) => n.toLocaleString('en-US');

export const wordsWhere = (len: number, kind: ListKind, value: string) =>
  getWords(len).filter((w) => matchesBase(w, { kind, value }));

/** Same as wordsWhere but everyday words come first. */
export const orderedWordsWhere = (len: number, kind: ListKind, value: string) => orderWords(len, wordsWhere(len, kind, value));

/**
 * A list page is only built (and only linked to) when it has at least this many words.
 * Thinner pages were previously built as noindex but still linked from everywhere, which Ahrefs flags
 * ("Noindex page") and which wastes crawl budget. Lower this if you would rather keep tiny lists.
 */
export const MIN_WORDS = 5;

/** True when a list page for this length/kind/value is worth building and linking to. */
export const hasList = (len: number, kind: ListKind, value: string) => wordsWhere(len, kind, value).length >= MIN_WORDS;

/**
 * Minimum words for a multi-letter ending page (ER, ING...). Higher than MIN_WORDS because endings multiply
 * quickly and only the well-populated ones are useful.
 */
export const SUFFIX_MIN = 30;

/** Every list page the site generates: {len, kind, value}. Value is one letter, a 2-letter prefix, a 2-3 letter ending, or a collection slug. */
let routeCache: { len: number; kind: ListKind; value: string }[] | null = null;
/** Number of words rendered in the server HTML of a list page. Longer lists get a "Show more" button. */
export const SSR_LIST_LIMIT = 500;

export function listRoutes() {
  if (routeCache) return routeCache;
  const routes: { len: number; kind: ListKind; value: string }[] = [];
  for (const len of LENGTHS) {
    for (const kind of ['start', 'end', 'contain'] as ListKind[])
      for (const l of ALPHABET) if (hasList(len, kind, l)) routes.push({ len, kind, value: l });
    for (const { prefix } of allPrefixes(len)) routes.push({ len, kind: 'start', value: prefix });
    for (const { suffix } of allSuffixes(len)) routes.push({ len, kind: 'end', value: suffix });
    for (const c of COLLECTIONS) {
      if (c.lengths && !c.lengths.includes(len)) continue;
      if (getWords(len).filter(c.test).length >= MIN_WORDS) routes.push({ len, kind: 'set', value: c.slug });
    }
  }
  routeCache = routes;
  return routes;
}

/** Pattern collections that have a page for this length. */
export const collectionsFor = (len: number) => listRoutes().filter((r) => r.len === len && r.kind === 'set').map((r) => r.value);

/** Every two-letter prefix of one length that has enough words for its own page. */
function allPrefixes(len: number) {
  const counts = new Map<string, number>();
  for (const w of getWords(len)) counts.set(w.slice(0, 2), (counts.get(w.slice(0, 2)) || 0) + 1);
  return [...counts].filter(([, n]) => n >= MIN_WORDS).sort(([a], [b]) => a.localeCompare(b)).map(([prefix, n]) => ({ prefix, n }));
}

/** Two and three letter endings that have enough words for their own page. */
function allSuffixes(len: number) {
  const counts = new Map<string, number>();
  for (const w of getWords(len)) {
    counts.set(w.slice(-2), (counts.get(w.slice(-2)) || 0) + 1);
    if (len >= 5) counts.set(w.slice(-3), (counts.get(w.slice(-3)) || 0) + 1);
  }
  return [...counts].filter(([, n]) => n >= SUFFIX_MIN).sort(([a], [b]) => a.localeCompare(b)).map(([suffix, n]) => ({ suffix, n }));
}

/** Endings (with counts) that finish in one given letter: for an "ending in S" page, this lists ES, DS, ING... that end in S. */
export function suffixCounts(len: number, letter: string) {
  return allSuffixes(len).filter(({ suffix }) => suffix.endsWith(letter));
}

/** Two-letter prefixes (with counts) for one starting letter - only those that have their own page. */
export function prefixCounts(len: number, letter: string) {
  return allPrefixes(len).filter(({ prefix }) => prefix[0] === letter);
}
export const withScores = (words: string[]) => words.map((w) => [w, score(w)] as const);
export const listCount = () => listRoutes().length;

import type { Base } from './filter';
export const matchesBaseServer = (w: string, base: Base) => matchesBase(w, base);
