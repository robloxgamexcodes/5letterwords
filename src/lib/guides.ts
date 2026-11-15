import { getWords, fmt } from './words';
import { score } from './scoring';
import { ANSWERS } from './game';

export type Block =
  | { t: 'p'; x: string } | { t: 'h2'; x: string } | { t: 'ul'; x: string[] }
  | { t: 'chips'; x: { w: string; n?: string | number }[]; lg?: boolean }
  | { t: 'table'; head: string[]; rows: string[][] };
export type Guide = { slug: string; title: string; h1: string; description: string; blurb: string; minutes: number; blocks: Block[] };

const w = (n: number) => getWords(n);
const W5 = w(5);

// shared data
const present = new Map<string, number>();
for (const word of W5) for (const c of new Set(word)) present.set(c, (present.get(c) || 0) + 1);
const pct = (n: number) => `${Math.round((n / W5.length) * 100)}%`;

const seen = new Set<string>();
const starters = ANSWERS.filter((x) => new Set(x).size === 5)
  .map((x) => ({ x, s: [...x].reduce((t, c) => t + (present.get(c) || 0), 0) }))
  .sort((a, b) => b.s - a.s)
  .filter(({ x }) => { const k = [...x].sort().join(''); if (seen.has(k)) return false; seen.add(k); return true; })
  .slice(0, 10);

const posFreq = (i: number) => { const m = new Map<string, number>(); for (const x of W5) m.set(x[i], (m.get(x[i]) || 0) + 1); return [...m].sort((a, b) => b[1] - a[1]); };
const firstLetters = posFreq(0).slice(0, 8), lastLetters = posFreq(4).slice(0, 8);
const doubles = W5.filter((x) => /(.)\1/.test(x)).length;
const vowelsOf = (x: string) => [...x].filter((c) => 'aeiou'.includes(c)).length;

// anagram demo from the real data
const groups = new Map<string, string[]>();
for (const x of w(6)) { const k = [...x].sort().join(''); groups.set(k, [...(groups.get(k) || []), x]); }
const anaDemo = [...groups.values()].filter((g) => g.length >= 3).sort((a, b) => b.length - a.length || a[0].localeCompare(b[0])).slice(0, 6);

const topFor = (n: number, k = 6) => [...w(n)].sort((a, b) => score(b) - score(a) || a.localeCompare(b)).slice(0, k);
const qNoU = [...w(5), ...w(4), ...w(3)].filter((x) => x.includes('q') && !x.includes('u')).sort((a, b) => a.length - b.length || a.localeCompare(b)).slice(0, 14);

export const GUIDES: Guide[] = [
  {
    slug: 'best-wordle-starting-words',
    title: 'Best Wordle Starting Words', h1: 'Best Wordle Starting Words (Ranked by Our Word List)',
    description: 'The best Wordle starting words, ranked by how many five-letter words share their letters, plus how to pick your second guess.',
    blurb: 'Ten opening words ranked from our own data, and what to play next.', minutes: 4,
    blocks: [
      { t: 'p', x: `A good opening word does one job: it tells you as much as possible about the hidden word. We ranked every common five-letter word with five different letters by how many of the ${fmt(W5.length)} words in our list contain those letters. The higher the total, the more often your tiles will turn yellow or green.` },
      { t: 'h2', x: 'Top 10 starting words' },
      { t: 'chips', lg: true, x: starters.map(({ x }) => ({ w: x })) },
      { t: 'p', x: 'None of these is magic. They are all built from the letters that show up in the most words, so whichever you choose, your first guess will usually light up two or three tiles.' },
      { t: 'h2', x: 'Which letters matter most?' },
      { t: 'table', head: ['Letter', 'Words containing it'], rows: [...present].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => [c.toUpperCase(), pct(n)]) },
      { t: 'h2', x: 'How to choose your second guess' },
      { t: 'ul', x: ['If the first word gave you nothing, play a second word with five completely new common letters.', 'If you got yellows, move those letters to new positions instead of repeating them in the same slot.', 'If you got greens, build the next word around them and add two or three untested letters.', 'From the third guess on, switch to the <a href="/wordle-solver">Wordle Solver</a> and play a word that is still possible.'] },
      { t: 'p', x: 'Want to play it out? Try today\'s <a href="/wordle">Wordle</a>, or practise on unlimited puzzles to test an opener.' },
    ],
  },
  {
    slug: 'wordle-strategy-tips',
    title: 'Wordle Strategy Tips', h1: 'Wordle Strategy: 9 Tips to Solve in Fewer Guesses',
    description: 'Practical Wordle strategy: how to use letter position, avoid common traps, handle double letters and know when to use a burn word.',
    blurb: 'Nine habits that turn four-guess solves into three.', minutes: 5,
    blocks: [
      { t: 'p', x: 'Most Wordle losses come from the same few mistakes. These habits fix them.' },
      { t: 'h2', x: 'Nine habits that help' },
      { t: 'ul', x: [
        '<strong>Use your first two guesses to gather letters.</strong> Spend them on common letters, not on trying to win.',
        `<strong>Think about where letters go.</strong> The most common first letters in our list are ${firstLetters.slice(0, 5).map(([c]) => c.toUpperCase()).join(', ')}; the most common last letters are ${lastLetters.slice(0, 5).map(([c]) => c.toUpperCase()).join(', ')}.`,
        '<strong>Move yellow letters.</strong> A yellow tile tells you the letter is in the word but not in that spot. Repeating it in the same column wastes a guess.',
        `<strong>Remember double letters.</strong> About ${pct(doubles)} of five-letter words repeat a letter (like <em>floor</em> or <em>sweet</em>). If you are stuck with a few greens, a double might be hiding.`,
        '<strong>Watch for word families.</strong> Patterns such as _IGHT, _OUND or _ATCH have many answers. Test several first letters at once with a word that splits them.',
        '<strong>Use a burn word when the pattern is crowded.</strong> If six words fit, a guess that tests four of the differing letters beats guessing one of them.',
        '<strong>Keep hard mode in mind.</strong> In hard mode you must reuse every hint, so avoid traps like _ATCH early.',
        '<strong>Check the list when you are stuck.</strong> Put your board into the <a href="/wordle-solver">Wordle Solver</a> to see what is still possible, then pick the one that also tests the most new letters.',
        '<strong>Practise without pressure.</strong> Unlimited play on <a href="/wordle">Wordle</a> helps patterns stick.',
      ] },
      { t: 'p', x: 'For a bigger challenge, try <a href="/dordle">Dordle</a> (two boards) or <a href="/quordle">Quordle</a> (four boards): the same habits apply, just with more to track.' },
    ],
  },
  {
    slug: 'highest-scoring-scrabble-words',
    title: 'Highest-Scoring Scrabble Words', h1: 'Highest-Scoring Scrabble Words by Length',
    description: 'The highest-scoring 3, 4, 5, 6 and 7 letter Scrabble words from our list, plus Q-without-U words and tips for high scores.',
    blurb: 'Top words for every length, plus the Q words that do not need a U.', minutes: 4,
    blocks: [
      { t: 'p', x: 'Tile values decide a lot in Scrabble: J, X, Q and Z are worth 8 to 10 points each. Here are the top words in our list for each length, scored with standard Scrabble tile values (before any premium squares).' },
      ...[3, 4, 5, 6, 7].flatMap((n): Block[] => [
        { t: 'h2', x: `Highest-scoring ${n} letter words` },
        { t: 'chips', x: topFor(n).map((x) => ({ w: x, n: score(x) })) },
      ]),
      { t: 'h2', x: 'Q words without a U' },
      { t: 'p', x: 'A lone Q is a headache. These words let you play it without waiting for a U:' },
      { t: 'chips', x: qNoU.map((x) => ({ w: x, n: score(x) })) },
      { t: 'h2', x: 'Quick tips for higher scores' },
      { t: 'ul', x: ['Play the high-value tiles on double or triple letter squares, and the word on a triple-word square when you can.', 'Keep a balance of vowels and consonants on your rack.', 'Learn the short words that use J, X, Q and Z.', 'Use the <a href="/scrabble">Scrabble Word Finder</a> to see every word your rack can make, scored and sorted.'] },
    ],
  },
  {
    slug: 'how-to-unscramble-words',
    title: 'How to Unscramble Words', h1: 'How to Unscramble Words Faster',
    description: 'A simple method for unscrambling letters into words, with real anagram examples and tips for blanks, prefixes and suffixes.',
    blurb: 'A five-step method for jumbled letters, with real anagram examples.', minutes: 4,
    blocks: [
      { t: 'p', x: 'Unscrambling is pattern recognition. These steps work whether you are facing a jumble, an anagram clue or a Scrabble rack.' },
      { t: 'h2', x: 'Five steps' },
      { t: 'ul', x: ['<strong>Sort the letters.</strong> Separate vowels from consonants. Most English words alternate between them.', '<strong>Look for endings.</strong> Pull out common suffixes like -ING, -ED, -ER and -S first.', '<strong>Look for starts.</strong> Common prefixes such as RE-, UN- and DE- give you a head start.', '<strong>Spot blends.</strong> Pairs like TH, CH, ST, SH and QU almost always travel together.', '<strong>Check your guess</strong> in the <a href="/word-unscrambler">Word Unscrambler</a> to see every word your letters can make.'] },
      { t: 'h2', x: 'Real anagram examples' },
      { t: 'p', x: 'These six-letter words all share the same letters, so the same jumble can have several answers:' },
      { t: 'table', head: ['Same letters, different words'], rows: anaDemo.map((g) => [g.join(' · ')]) },
      { t: 'h2', x: 'Which tool for which puzzle?' },
      { t: 'ul', x: ['<a href="/anagram-solver">Anagram Solver</a>: use every letter, once each.', '<a href="/word-scramble">Word Scramble Solver</a>: jumbled-word puzzles, longest answer first.', '<a href="/word-unscrambler">Word Unscrambler</a>: any word you can build from your tiles, blanks allowed.', '<a href="/crossword">Crossword Solver</a>: you know some letters and the length.'] },
    ],
  },
  {
    slug: 'most-common-letters-in-words',
    title: 'Most Common Letters in Words', h1: 'Most Common Letters in 3 to 7 Letter Words',
    description: 'Which letters appear most often in 3, 4, 5, 6 and 7 letter words, and what the numbers mean for Wordle and Scrabble.',
    blurb: 'Letter frequency tables computed from our full word lists.', minutes: 3,
    blocks: [
      { t: 'p', x: 'Letter frequency is the quiet engine behind every good word-game strategy. We counted how many words in our list contain each letter, for every length from three to seven.' },
      { t: 'table', head: ['Length', 'Top 6 letters (share of words)', 'Words'], rows: [3, 4, 5, 6, 7].map((n) => {
        const m = new Map<string, number>(); for (const x of w(n)) for (const c of new Set(x)) m.set(c, (m.get(c) || 0) + 1);
        return [`${n} letters`, [...m].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, k]) => `${c.toUpperCase()} ${Math.round((k / w(n).length) * 100)}%`).join(', '), fmt(w(n).length)];
      }) },
      { t: 'h2', x: '5 letter words: first and last letters' },
      { t: 'table', head: ['Position', 'Most common letters'], rows: [['First letter', firstLetters.map(([c, k]) => `${c.toUpperCase()} (${fmt(k)})`).join(', ')], ['Last letter', lastLetters.map(([c, k]) => `${c.toUpperCase()} (${fmt(k)})`).join(', ')]] },
      { t: 'h2', x: 'Vowels' },
      { t: 'p', x: `The average five-letter word in our list has about ${(W5.reduce((t, x) => t + vowelsOf(x), 0) / W5.length).toFixed(1)} vowels, so a starting word with two or three of them is a safe bet.` },
      { t: 'p', x: 'Use these numbers with the <a href="/guides/best-wordle-starting-words">best Wordle starting words</a> or browse every list on the <a href="/word-lists">word lists</a> page.' },
    ],
  },
];
export const guideBySlug = (s: string) => GUIDES.find((g) => g.slug === s);
