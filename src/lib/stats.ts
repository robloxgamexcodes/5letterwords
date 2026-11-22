// Data-driven facts about a set of words. Everything is computed from the dictionary, never hard-coded,
// so each page's copy is unique to its words and always accurate.
import { score } from './scoring';
import { fmt, isCommon, orderWords } from './words';
import { collectionBySlug } from './collections';

const VOWELS = 'aeiou';
const NUM = ['', '', '', 'three', 'four', 'five', 'six', 'seven'];
export const numWord = (n: number) => NUM[n] ?? String(n);

const top = <T,>(m: Map<T, number>, n: number) => [...m].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, n);

export function wordStats(words: string[], len: number) {
  const total = words.length;
  const letterShare = new Map<string, number>();
  const first = new Map<string, number>();
  const last = new Map<string, number>();
  let doubles = 0;
  let noRepeat = 0;
  let vowelTotal = 0;
  let yOnly = 0;
  for (const w of words) {
    for (const c of new Set(w)) letterShare.set(c, (letterShare.get(c) || 0) + 1);
    first.set(w[0], (first.get(w[0]) || 0) + 1);
    last.set(w[w.length - 1], (last.get(w[w.length - 1]) || 0) + 1);
    if (/(.)\1/.test(w)) doubles++;
    if (new Set(w).size === w.length) noRepeat++;
    const v = [...w].filter((c) => VOWELS.includes(c)).length;
    vowelTotal += v;
    if (v === 0) yOnly++;
  }
  const best = [...words].sort((a, b) => score(b) - score(a) || a.localeCompare(b)).slice(0, 8);
  const everyday = orderWords(len, words).filter((w) => isCommon(len, w));
  return {
    total,
    topLetters: top(letterShare, 5).map(([c, n]) => ({ c, pct: Math.round((n / total) * 100) })),
    topFirst: top(first, 3).map(([c, n]) => ({ c, n })),
    topLast: top(last, 3).map(([c, n]) => ({ c, n })),
    doubles,
    doublesPct: Math.round((doubles / total) * 100),
    noRepeat,
    avgVowels: total ? (vowelTotal / total).toFixed(1) : '0.0',
    noVowel: yOnly,
    best,
    bestScore: best[0] ? score(best[0]) : 0,
    everyday: everyday.slice(0, 12),
    everydayCount: everyday.length,
  };
}

const upper = (c: string) => c.toUpperCase();
const join = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : xs[0] ?? '');

/** One unique, factual paragraph for a finder page (3 to 7 letters). */
export function finderFacts(words: string[], len: number): string {
  const s = wordStats(words, len);
  return [
    `The ${fmt(s.total)} ${numWord(len)}-letter words in this finder most often start with ${join(s.topFirst.map((x) => upper(x.c)))} and end in ${join(s.topLast.map((x) => upper(x.c)))}.`,
    `The most common letters are ${join(s.topLetters.slice(0, 4).map((x) => `${upper(x.c)} (${x.pct}% of words)`))}.`,
    s.doubles ? `${fmt(s.doubles)} of them (${s.doublesPct}%) repeat a letter, and ${fmt(s.noRepeat)} use ${len} different letters.` : '',
    `The highest-scoring word is ${upper(s.best[0])}, worth ${s.bestScore} points in Scrabble.`,
  ].filter(Boolean).join(' ');
}

export type Kind = 'start' | 'end' | 'contain' | 'set';
const phrase = (kind: Kind, v: string) => (kind === 'set' ? collectionBySlug(v)!.phrase : kind === 'start' ? `starting with ${upper(v)}` : kind === 'end' ? `ending in ${upper(v)}` : `containing ${upper(v)}`);

/** Unique intro + facts for a list page, built from that list's own words. */
export function listFacts(words: string[], len: number, kind: Kind, value: string) {
  const s = wordStats(words, len);
  const V = kind === 'set' ? '' : upper(value);
  const where = phrase(kind, value);
  const sentences: string[] = [];
  sentences.push(`There are ${fmt(s.total)} ${numWord(len)}-letter words ${where} in this dictionary${s.everydayCount ? `, and ${fmt(s.everydayCount)} of them are everyday words` : ''}.`);
  if (s.everyday.length >= 3) sentences.push(`Familiar examples include ${join(s.everyday.slice(0, 6).map(upper))}.`);
  if (kind === 'start') {
    const next = new Map<string, number>();
    for (const w of words) next.set(w[value.length] ?? '', (next.get(w[value.length] ?? '') || 0) + 1);
    const t = top(next, 3).filter(([c]) => c);
    if (t.length >= 2) sentences.push(`After ${V}, the most common next letters are ${join(t.map(([c]) => upper(c)))}.`);
  } else if (kind === 'set') {
    if (s.topFirst.length >= 2) sentences.push(`They most often begin with ${join(s.topFirst.map((x) => upper(x.c)))} and end in ${join(s.topLast.map((x) => upper(x.c)))}.`);
  } else if (kind === 'end') {
    const prev = new Map<string, number>();
    for (const w of words) prev.set(w[w.length - value.length - 1] ?? '', (prev.get(w[w.length - value.length - 1] ?? '') || 0) + 1);
    const t = top(prev, 3).filter(([c]) => c);
    if (t.length >= 2) sentences.push(`Right before the ${V}, the most common letters are ${join(t.map(([c]) => upper(c)))}.`);
  } else if (s.topFirst.length >= 2) {
    sentences.push(`These words most often begin with ${join(s.topFirst.map((x) => upper(x.c)))}.`);
  }
  if (s.doubles >= 3) sentences.push(`${fmt(s.doubles)} of them contain a double letter.`);
  sentences.push(`The top Scrabble scorer is ${upper(s.best[0])} (${s.bestScore} points).`);
  return { stats: s, intro: sentences.join(' '), where };
}

/** 3 FAQs for a list page, with answers computed from its words. */
export function listFaq(words: string[], len: number, kind: Kind, value: string) {
  const s = wordStats(words, len);
  const where = phrase(kind, value);
  const V = kind === 'set' ? '' : upper(value);
  const faq = [
    { q: `How many ${len} letter words ${where} are there?`, a: `This dictionary has ${fmt(s.total)} ${numWord(len)}-letter words ${where}. Games differ in which words they accept, so check a result against your own game before you play it.` },
    { q: `What are some common ${len} letter words ${where}?`, a: s.everyday.length ? `Everyday examples include ${join(s.everyday.slice(0, 8).map(upper))}. Everyday words are listed first in the grid above.` : `Most of these are uncommon dictionary words. The highest scorers are ${join(s.best.slice(0, 5).map(upper))}.` },
    { q: `Which ${len} letter word ${where} scores the most in Scrabble?`, a: `${upper(s.best[0])} scores ${s.bestScore} points using standard Scrabble tile values, before any premium squares. The next best are ${join(s.best.slice(1, 4).map(upper))}.` },
  ];
  if (len === 5) faq.push({ q: `Can I use these words for Wordle?`, a: `Yes. Use the finder above to add the letters your board has already shown, and the list shrinks to the words that still fit. Everyday words come first because they are the likeliest answers.` });
  return faq;
}
