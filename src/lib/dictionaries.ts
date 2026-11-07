export const DICTIONARY_LABELS: Record<string, string> = {
  all: 'All dictionaries',
  nwl: 'Scrabble US (NWL)',
  collins: 'Scrabble UK (Collins)',
  wwf: 'Words With Friends',
  'wordle-guesses': 'Wordle guesses',
  'wordle-answers': 'Wordle answers only',
};
export const DICTIONARY_ORDER = ['all', 'nwl', 'collins', 'wwf', 'wordle-guesses', 'wordle-answers'];

export type LengthData = { words: string[]; sets: Record<string, Set<number>> };

/** Parse the compact JSON emitted by scripts/build-words.mjs */
export function parseLengthData(raw: { w: string; s: Record<string, number[]> }): LengthData {
  return {
    words: raw.w ? raw.w.split(' ') : [],
    sets: Object.fromEntries(Object.entries(raw.s).map(([k, v]) => [k, new Set(v)])),
  };
}
export const availableDictionaries = (data: { s: Record<string, number[]> }) =>
  DICTIONARY_ORDER.filter((k) => k === 'all' || (data.s[k] && data.s[k].length > 0));
