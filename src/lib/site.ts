export const SITE = { name: '5 Letter Words', url: 'https://5letter-words.io', year: new Date().getFullYear() };
export const LENGTHS = [3, 4, 5, 6, 7] as const;
export type Len = (typeof LENGTHS)[number];
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

export type ListKind = 'start' | 'end' | 'contain';
export const lengthPath = (len: number) => (len === 5 ? '/' : `/${len}-letter-word-finder`);
export const listPath = (len: number, kind: ListKind, value: string) =>
  `/${len}-letter-words-${kind === 'start' ? 'that-start-with' : kind === 'end' ? 'that-end-with' : 'containing'}-${value}`;

// Header menu — same order as the live site (3, 4, 5, 7, 6).
export const NAV = [
  { label: 'Word Unscrambler', href: '/word-unscrambler' },
  { label: '3 Letter Words', href: lengthPath(3) },
  { label: '4 Letter Words', href: lengthPath(4) },
  { label: '5 Letter Words', href: lengthPath(5) },
  { label: '7 Letter Words', href: lengthPath(7) },
  { label: '6 Letter Words', href: lengthPath(6) },
];

export const TOOL_CARDS = [
  { label: 'Wordle solver', hint: 'Tiles in, shortlist out', href: '/wordle-solver' },
  { label: 'Word unscrambler', hint: 'Turn your tiles into words', href: '/word-unscrambler' },
  { label: 'Anagram solver', hint: 'Words using every letter', href: '/anagram-solver' },
  { label: 'Word scramble', hint: 'Unjumble a puzzle', href: '/word-scramble' },
  { label: 'Word lists', hint: 'Every length, every letter', href: '/word-lists' },
];

export const GAME_LINKS = [
  { label: 'Word Unscrambler', href: '/word-unscrambler' },
  { label: 'Word Scramble Solver', href: '/word-scramble' },
  { label: 'Anagram Solver', href: '/anagram-solver' },
  { label: 'Wordle Solver', href: '/wordle-solver' },
  { label: 'Quordle', href: '/quordle' },
  { label: 'Crossword', href: '/crossword' },
  { label: 'Scrabble', href: '/scrabble' },
  { label: 'Wordle', href: '/wordle' },
];

export const MORE_TOOLS = [
  { label: 'Word Unscrambler', hint: 'Unscramble letters into words', href: '/word-unscrambler' },
  { label: 'Anagram Solver', hint: 'Words that use every letter you have', href: '/anagram-solver' },
  { label: 'Word Scramble Solver', hint: 'Unjumble a puzzle, longest word first', href: '/word-scramble' },
  { label: 'All Word Lists', hint: 'Every length, every starting and ending letter', href: '/word-lists' },
  ...[5, 3, 4, 6, 7].map((n) => ({ label: `${n} Letter Word Finder`, hint: n === 5 ? 'Solver & unscrambler for 5 letter words' : `Find & solve ${n} letter words`, href: lengthPath(n) })),
];

export const FOOTER_COLUMNS = [
  { title: 'Word finders', links: [3, 4, 5, 6, 7].map((n) => ({ label: `${n} Letter Words`, href: lengthPath(n) })) },
  {
    title: 'Tools',
    links: [
      { label: 'Word Unscrambler', href: '/word-unscrambler' },
      { label: 'Wordle Solver', href: '/wordle-solver' },
      { label: 'Anagram Solver', href: '/anagram-solver' },
      { label: 'Word Lists', href: '/word-lists' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'About Us', href: '/about-us' },
      { label: 'Contact Us', href: '/contact-us' },
      { label: 'DMCA', href: '/dmca' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms-of-service' },
    ],
  },
];
export const DEFAULT_OG = 'https://5letter-words.io/data/image/options/5letter-words.io1.png';
export const TWITTER_IMG = 'https://5letter-words.io/images/5-letter-words-twitter-share-v6.png';
