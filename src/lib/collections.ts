// Pattern-based word collections ("5 letter words with double letters"). Pure functions only, so the same
// predicate runs on the server (to build the page) and in the browser (to filter the list).
const V = 'aeiou';
const vowels = (w: string) => [...w].filter((c) => V.includes(c)).length;

export type Collection = {
  slug: string;
  /** Title-case phrase after "N Letter Words": "With Double Letters" */
  title: string;
  /** Lower-case phrase for sentences: "with double letters" */
  phrase: string;
  /** One-line explanation shown under the heading */
  about: string;
  test: (w: string) => boolean;
  /** Only build the page for these lengths (others would be empty or meaningless). */
  lengths?: number[];
};

export const COLLECTIONS: Collection[] = [
  { slug: 'with-double-letters', title: 'With Double Letters', phrase: 'with double letters', about: 'Words with the same letter twice in a row, like the LL in BALL.', test: (w) => /(.)\1/.test(w) },
  { slug: 'with-no-repeated-letters', title: 'With No Repeated Letters', phrase: 'with no repeated letters', about: 'Words where every letter is different, ideal for opening guesses.', test: (w) => new Set(w).size === w.length },
  { slug: 'without-vowels', title: 'Without Vowels', phrase: 'without the vowels A, E, I, O or U', about: 'Words with no A, E, I, O or U, which rely on Y for their vowel sound.', test: (w) => vowels(w) === 0 },
  { slug: 'with-one-vowel', title: 'With One Vowel', phrase: 'with exactly one vowel', about: 'Words with a single A, E, I, O or U.', test: (w) => vowels(w) === 1, lengths: [4, 5, 6, 7] },
  { slug: 'with-two-vowels', title: 'With Two Vowels', phrase: 'with exactly two vowels', about: 'Words with exactly two of A, E, I, O or U.', test: (w) => vowels(w) === 2, lengths: [4, 5, 6, 7] },
  { slug: 'with-three-vowels', title: 'With Three Vowels', phrase: 'with exactly three vowels', about: 'Words with exactly three of A, E, I, O or U.', test: (w) => vowels(w) === 3, lengths: [5, 6, 7] },
  { slug: 'that-start-and-end-with-the-same-letter', title: 'With the Same First and Last Letter', phrase: 'that start and end with the same letter', about: 'Words whose first and last letters match, like LEVEL or TOOT.', test: (w) => w[0] === w[w.length - 1] },
  { slug: 'that-are-palindromes', title: 'That Are Palindromes', phrase: 'that are palindromes', about: 'Words that read the same forwards and backwards.', test: (w) => w === [...w].reverse().join('') },
  { slug: 'with-q-and-no-u', title: 'With Q and No U', phrase: 'with Q and no U', about: 'Words that use a Q without needing a U.', test: (w) => w.includes('q') && !w.includes('u') },
];
export const collectionBySlug = (slug: string) => COLLECTIONS.find((c) => c.slug === slug);
