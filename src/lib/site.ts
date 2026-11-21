// PUBLIC_SITE_URL overrides the domain (set it in .env / the host's env vars). It falls back to the production domain so a missing
// env var can never again publish canonicals pointing at example.com. Used for canonicals, OG tags, sitemap and robots.txt.
const rawUrl = (import.meta.env.PUBLIC_SITE_URL as string | undefined) || 'https://5letterwords.se';
const siteUrl = rawUrl.replace(/\/+$/, '');
export const SITE = {
  name: '5 Letter Words',
  url: siteUrl,
  host: new URL(siteUrl).hostname,
  email: `contact@${new URL(siteUrl).hostname}`,
  year: new Date().getFullYear(),
};
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
  { label: 'Guides', href: '/guides' },
  { label: '▶ Play', href: '/wordle', cta: true },
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
  { label: 'Dordle', href: '/dordle' },
  { label: 'Crossword Solver', href: '/crossword' },
  { label: 'Scrabble Word Finder', href: '/scrabble' },
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
      { label: 'Crossword Solver', href: '/crossword' },
      { label: 'Scrabble Word Finder', href: '/scrabble' },
    ],
  },
  {
    title: 'Play',
    links: [
      { label: 'Wordle', href: '/wordle' },
      { label: 'Dordle', href: '/dordle' },
      { label: 'Quordle', href: '/quordle' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Guides', href: '/guides' },
      { label: 'Best Starting Words', href: '/guides/best-wordle-starting-words' },
      { label: 'Sources & Methodology', href: '/sources-methodology' },
      { label: 'Site Map', href: '/sitemap' },
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
export const DEFAULT_OG = `${siteUrl}/og-default.png`;
export const TWITTER_IMG = DEFAULT_OG;
