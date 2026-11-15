import { fmt } from './words';

const NUM = ['', '', '', 'three', 'four', 'five', 'six', 'seven'];

export const finderIntro = (len: number, count: number) =>
  `A free ${len} letter word finder with ${fmt(count)} ${NUM[len]}-letter words. Enter what your puzzle has shown you - letters in place, letters out of place, letters ruled out - and get the words that still fit.`;

export const finderMeta = (len: number) => ({
  title: `${len} Letter Word Finder: Solve & Unscramble ${len} Letter Words`,
  description: `Free ${len} letter word finder and words finder for Wordle, Scrabble and crosswords. Filter by position, included and excluded letters, prefix or suffix to list every match.`,
});

export const finderFaq = (len: number, count: number) => [
  { q: `How many ${len} letter words are in this finder?`, a: `The word list behind this ${len} letter word finder has ${fmt(count)} entries. Games differ in which words they accept, so check a result against your own game before you play it.` },
  { q: `How do I find ${len} letter words with specific letters?`, a: `Put letters whose position you know in the Right spot row, letters that belong elsewhere in Wrong spot, and letters you have eliminated in Not in the word. Search, and the list shrinks to the ${len} letter words that satisfy every clue.` },
  { q: 'Is this a Wordle helper?', a: 'It works as one. Copy the colours from your Wordle board into the three rows - green, yellow, grey - and you will see the words still possible. It narrows the field without naming the answer.' },
  { q: 'How are repeated letters handled?', a: 'By default a letter listed twice is treated as a single required letter. Turn on Count repeats in Display options when the word really contains that letter two times.' },
];

/** Long-form SEO section for a finder page (original copy). */
export const finderArticle = (len: number) => ({
  h2: `${len} Letter Words: Find the Word That Fits`,
  intro: `A ${len}-letter word finder turns the clues you already have into a short, readable list. Instead of guessing, you describe the board — which letters are locked in, which are loose, which are gone — and the tool shows every word that still fits. It works for daily guessing games, crosswords and board games alike.`,
  featuresH: 'What the finder can do',
  features: [
    `Match ${len}-letter words in a fraction of a second`,
    'Combine placed, misplaced and excluded letters',
    'Search by prefix, suffix or a pattern with gaps',
    'Enter the tiles on your rack to see playable words',
    'Show Scrabble point values and sort the best words first',
    'Switch to dark mode or high contrast whenever you like',
  ],
  stepsH: 'How to use it',
  steps: [
    'Enter any letters whose exact position you know in Right spot.',
    'Add letters that belong somewhere else in the word to Wrong spot.',
    'List the letters your guesses ruled out in Not in the word.',
    'Open More filters for a prefix, suffix, letter run or rack, then press Search.',
  ],
  tipsH: 'Tips for better results',
  tips: [
    'Start with few filters and tighten them one at a time.',
    'Re-check the dead letters before you commit to a guess.',
    'Use Count repeats when a word has the same letter twice.',
    'Switch the Dictionary to match the game you are playing.',
  ],
  gamesH: 'Games this tool helps with',
  games: [
    ['Wordle', '/wordle', 'Daily guessing games where every clue narrows the field.'],
    ['Quordle', '/quordle', 'Four boards at once — more reason to keep a shortlist.'],
    ['Crossword', '/crossword', 'Fixed-length entries where a known letter or two unlocks the rest.'],
    ['Scrabble', '/scrabble', 'Turn the tiles on your rack into playable words and compare scores.'],
  ] as [string, string, string][],
});

export const listHeading = (len: number, kind: 'start' | 'end' | 'contain', value: string) => {
  const v = value.toUpperCase();
  const kindText = kind === 'start' ? `That Start With ${v}` : kind === 'end' ? `That End With ${v}` : `Containing ${v}`;
  return `${len} Letter Words ${kindText}`;
};
export const listSub = (len: number, kind: 'start' | 'end' | 'contain', value: string, count: number) => {
  const v = value.toUpperCase();
  const how = kind === 'start' ? `beginning with ${v}` : kind === 'end' ? `ending in ${v}` : `containing ${v}`;
  return `All ${fmt(count)} ${NUM[len]}-letter words ${how}, scored for Scrabble and Words With Friends.`;
};
export const listMetaDesc = (len: number, kind: 'start' | 'end' | 'contain', value: string, count: number) => {
  const v = value.toUpperCase();
  const how = kind === 'start' ? `starting with ${v}` : kind === 'end' ? `ending with ${v}` : `containing ${v}`;
  return `All ${fmt(count)} ${len}-letter words ${how}, with Scrabble scores. Narrow them down by letter position or rule out letters to find your Wordle answer.`;
};

export const TOOL_PAGES = {
  'wordle-solver': {
    title: 'Wordle Solver',
    h1: 'Wordle Solver',
    faq: [
      { q: 'How do I use this Wordle solver?', a: 'Enter each green tile in its own slot under Right spot, yellow tiles under Wrong spot and grey tiles under Not in the word. Search to see every 5 letter word that matches the whole board.' },
      { q: 'Does it tell me the answer?', a: 'No, and that is deliberate. It narrows the field to the words that are still possible and leaves the choice to you, so you get a hint without having the puzzle spoiled.' },
      { q: 'What is the difference between Wordle answers and Wordle guesses?', a: 'Wordle accepts a much larger list of words as guesses than it ever picks as an answer. Set the dictionary to Wordle answers only to see the shortlist that can actually be the word of the day; leave it on Wordle guesses to check whether a word will be accepted at all.' },
      { q: 'What if a letter shows up twice in the answer?', a: 'Switch on Count repeats under Display options and enter the letter in both Right spot and Wrong spot. Leave it off and the solver treats the two entries as one letter.' },
      { q: 'What is a good Wordle starting word?', a: 'Words that spend all five slots on common letters do the most work: CRANE, SLATE, ADIEU and ROATE are popular openers. Any of them tends to light up a few tiles, which is enough to cut thousands of candidates down to a handful.' },
    ],
  },
  'word-unscrambler': {
    title: 'Word Unscrambler',
    seoTitle: 'Word Unscrambler: Unscramble Letters into Words',
    h1: 'Word Unscrambler',
    description: 'Type your letters and find every word you can make from them. Filter by start, end or pattern and score each result for Scrabble or Words With Friends.',
    faq: [
      { q: 'What is a word unscrambler?', a: 'A word unscrambler rearranges a jumble of letters into valid words. Enter the letters you have and it finds every word you can make, grouped by length and sorted by points.' },
      { q: 'How do I use blank or wildcard tiles?', a: 'Type a question mark (?), an asterisk (*) or a space anywhere in your letters to stand for a blank tile. Each wildcard can be any single letter, just like a blank in Scrabble or Words With Friends.' },
      { q: 'What does the underscore in the Contains box do?', a: 'It stands for exactly one unknown letter, so you can describe the shape of a word as well as its letters. E_O finds LEMON, and C_T finds CAT, COT and CUT.' },
      { q: 'Can I use this for Scrabble and Words With Friends?', a: 'Yes. Switch between the Scrabble and Words With Friends tabs to score every result with that game’s tile values, so you can spot the highest-scoring play.' },
      { q: 'How do I narrow down the results?', a: 'Use the Starts with, Ends with, Contains and Length filters to focus on specific words — handy for crossword clues, Wordle hints and high-value board plays.' },
    ],
  },
  'anagram-solver': {
    title: 'Anagram Solver',
    seoTitle: 'Anagram Solver: Words Using Every Letter',
    h1: 'Anagram Solver',
    description: 'Find every anagram of your letters. This solver only returns words that use all of the letters you enter.',
    faq: [
      { q: 'What is an anagram solver?', a: 'It lists every word that can be spelled using all of the letters you enter, each exactly once — for example LISTEN, SILENT, TINSEL and ENLIST.' },
      { q: 'How is it different from the word unscrambler?', a: 'The unscrambler shows words of every length that can be made from some of your letters. The anagram solver only returns words that use every letter.' },
      { q: 'Can I include a blank tile?', a: 'Yes. Type ? or * for a blank and it will stand in for any single letter.' },
      { q: 'How many letters can I enter?', a: 'Up to fifteen. Words from this dictionary run from three to seven letters, so results appear when your letters are in that range.' },
    ],
  },
  'word-scramble': {
    title: 'Word Scramble Solver',
    seoTitle: 'Word Scramble Solver: Unjumble a Puzzle Fast',
    h1: 'Word Scramble Solver',
    description: 'Unjumble a word scramble puzzle. Enter the scrambled letters and get every possible answer, longest word first.',
    faq: [
      { q: 'How do I solve a word scramble?', a: 'Type the scrambled letters and press Solve. Every word that fits is listed with the longest first, which is usually the answer a puzzle is looking for.' },
      { q: 'Does it work with blanks?', a: 'Yes. Use ? or * for any unknown letter.' },
      { q: 'Can I narrow the answers down?', a: 'Use Starts with, Ends with, Contains and Length to focus on the shape of the answer you need.' },
    ],
  },
} as const;
