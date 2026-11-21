import w3 from '../data/generated/words-3.json';
import w4 from '../data/generated/words-4.json';
import w5 from '../data/generated/words-5.json';
import w6 from '../data/generated/words-6.json';
import w7 from '../data/generated/words-7.json';
import meta from '../data/generated/meta.json';
import { availableDictionaries, parseLengthData, type LengthData } from './dictionaries';
import { ALPHABET, LENGTHS, type ListKind } from './site';
import { score } from './scoring';

export const RAW: Record<number, { w: string; s: Record<string, number[]> }> = { 3: w3, 4: w4, 5: w5, 6: w6, 7: w7 };
const cache = new Map<number, LengthData>();

export function getData(len: number): LengthData {
  if (!cache.has(len)) cache.set(len, parseLengthData(RAW[len]));
  return cache.get(len)!;
}
export const getWords = (len: number) => getData(len).words;
export const dictionariesFor = (len: number) => availableDictionaries(RAW[len]);
export const totalWords = meta.total;
export const countFor = (len: number) => getWords(len).length;
export const fmt = (n: number) => n.toLocaleString('en-US');

export const wordsWhere = (len: number, kind: ListKind, value: string) =>
  getWords(len).filter((w) => (kind === 'start' ? w.startsWith(value) : kind === 'end' ? w.endsWith(value) : w.includes(value)));

/**
 * A list page is only built (and only linked to) when it has at least this many words.
 * Thinner pages were previously built as noindex but still linked from everywhere, which Ahrefs flags
 * ("Noindex page") and which wastes crawl budget. Lower this if you would rather keep tiny lists.
 */
export const MIN_WORDS = 5;

/** True when a list page for this length/kind/value is worth building and linking to. */
export const hasList = (len: number, kind: ListKind, value: string) => wordsWhere(len, kind, value).length >= MIN_WORDS;

/** Every list page the site generates: {len, kind, value} (value is 1 letter, or 2 letters for start prefixes). */
export function listRoutes() {
  const routes: { len: number; kind: ListKind; value: string }[] = [];
  for (const len of LENGTHS) {
    for (const kind of ['start', 'end', 'contain'] as ListKind[])
      for (const l of ALPHABET) if (hasList(len, kind, l)) routes.push({ len, kind, value: l });
    for (const { prefix } of allPrefixes(len)) routes.push({ len, kind: 'start', value: prefix });
  }
  return routes;
}

/** Every two-letter prefix of one length that has enough words for its own page. */
function allPrefixes(len: number) {
  const counts = new Map<string, number>();
  for (const w of getWords(len)) counts.set(w.slice(0, 2), (counts.get(w.slice(0, 2)) || 0) + 1);
  return [...counts].filter(([, n]) => n >= MIN_WORDS).sort(([a], [b]) => a.localeCompare(b)).map(([prefix, n]) => ({ prefix, n }));
}

/** Two-letter prefixes (with counts) for one starting letter - only those that have their own page. */
export function prefixCounts(len: number, letter: string) {
  return allPrefixes(len).filter(({ prefix }) => prefix[0] === letter);
}
export const withScores = (words: string[]) => words.map((w) => [w, score(w)] as const);
export const listCount = () => listRoutes().filter((r) => r.value.length === 1).length;

import type { Base } from './filter';
export const matchesBaseServer = (w: string, base: Base) =>
  !base || (base.kind === 'start' ? w.startsWith(base.value) : base.kind === 'end' ? w.endsWith(base.value) : w.includes(base.value));
