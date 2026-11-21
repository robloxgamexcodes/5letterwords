// Game pages. `embedUrl` is the third-party game URL shown in the player frame when someone presses Play.
// The live site embeds hosted games; paste the iframe URL you license/use for each one here.
export type Game = {
  slug: string; title: string; seoTitle: string; description: string; tagline: string; embedUrl: string;
  intro: string; how: { h: string; items: string[] }; tips: string[]; closing: string;
};

export const GAMES: Game[] = [
  {
    slug: 'wordle', title: 'Wordle', seoTitle: 'Play Wordle Free: Unlimited Daily Word Puzzle', embedUrl: '',
    description: 'Play Wordle free in your browser: guess the hidden five-letter word in six tries, keep a daily streak or practise with unlimited puzzles and share your result.',
    tagline: 'Wordle: Step Into the Word Challenge!',
    intro: 'Wordle turns five little tiles into a daily brain-teaser. You get a limited number of tries to find a hidden five-letter word, and every guess comes back colour-coded so you can reason your way to the answer. It is quick to learn, easy to share and just hard enough to stay interesting.',
    how: { h: 'How to play Wordle', items: ['Enter any five-letter word as your first guess.', 'Green means the letter is correct and in the right place.', 'Yellow means the letter is in the word but in a different place.', 'Grey means the letter is not in the word.', 'Use the clues to refine each guess until you solve it or run out of tries.'] },
    tips: ['Open with a word that packs common letters, such as ADIEU, CRANE or SLATE.', 'Avoid repeating letters in your first two guesses.', 'Move yellow letters to new positions in your next guess.', 'Try a “burn” word with five fresh letters if you are stuck.', 'Remember common pairs like CH, ST, SH and TH.', 'Stuck? Use the Wordle Solver to see which words are still possible.'],
    closing: 'Looking for other lengths? Try the 4, 6 or 7 letter finders to keep your word skills sharp.',
  },
  {
    slug: 'dordle', title: 'Dordle', seoTitle: 'Play Dordle Free: Double Wordle, Two Boards', embedUrl: '',
    description: 'Play Dordle free, the double Wordle: solve two hidden five-letter words at the same time with a shared set of seven guesses. Daily and unlimited modes.',
    tagline: 'Dordle: Two Words, One Set of Guesses',
    intro: 'Dordle doubles the fun of Wordle. Two hidden words share a single run of guesses, so every word you try gives you feedback on both boards at once. It rewards careful planning and a good feel for letter patterns.',
    how: { h: 'How to play Dordle', items: ['Type a five-letter word — it is scored against both boards.', 'Green, yellow and grey tiles work exactly like Wordle.', 'Solve both words before you run out of guesses.', 'Once one board is solved, put every remaining guess into the other.'] },
    tips: ['Use your first guesses to test as many new letters as possible.', 'Track each board separately before you choose the next word.', 'Look for a guess that helps both boards, not just one.', 'Use the 5 Letter Word Finder on each board to shortlist candidates.'],
    closing: 'Ready for four boards? Try Quordle next.',
  },
  {
    slug: 'quordle', title: 'Quordle', seoTitle: 'Play Quordle Free: Solve Four Wordle Boards', embedUrl: '',
    description: 'Play Quordle free, the four-board Wordle: solve four hidden five-letter words at the same time with nine guesses. Daily puzzle, unlimited mode and stats.',
    tagline: 'Quordle: Four Boards, Nine Guesses',
    intro: 'Quordle asks you to crack four hidden five-letter words at the same time. Each guess is checked against all four boards, so there is a lot to track — and a lot of satisfaction when the last board turns green.',
    how: { h: 'How to play Quordle', items: ['Enter a five-letter word; it appears on all four boards.', 'Tile colours mean the same as in Wordle.', 'You have nine guesses to solve all four words.', 'Focus on the board with the most information first.'] },
    tips: ['Spend the opening guesses on different, common letters.', 'Write down what each board has ruled out.', 'Do not rush to solve one board if another is close.', 'Use the Wordle Solver for any board that has enough clues.'],
    closing: 'Warm up with Wordle or Dordle if four boards feels like too much.',
  },
  {
    slug: 'crossword', title: 'Crossword Solver', seoTitle: 'Crossword Solver: Find Answers by Letter Pattern', embedUrl: '',
    description: 'Free crossword solver: enter the letters you know, use ? for the gaps and get every 3 to 7 letter answer that fits the pattern, with Scrabble scores.',
    tagline: 'Crossword Solver: Fill the Gaps, Finish the Grid',
    intro: 'Crosswords combine vocabulary, general knowledge and pattern-spotting. Each entry has a fixed length, and the letters you already have from crossing words often make the missing ones easy to find.',
    how: { h: 'How to solve a crossword', items: ['Start with the clues you are sure about.', 'Use crossing letters to unlock harder entries.', 'Check each answer against its length.', 'Work in small sections rather than the whole grid at once.'] },
    tips: ['Fill in plurals and common endings like -ED, -ING and -S early.', 'Use a Letter run pattern such as C_T when you know some letters.', 'Come back later to clues that stump you.', 'Try the finder for the right length to see every candidate.'],
    closing: 'Need a word of a specific length? The 3 to 7 letter finders have you covered.',
  },
  {
    slug: 'scrabble', title: 'Scrabble Word Finder', seoTitle: 'Scrabble Word Finder: Best Plays from Your Rack', embedUrl: '',
    description: 'Free Scrabble word finder: type your rack (use ? for blanks) and see every playable 3 to 7 letter word with its Scrabble score, best plays first.',
    tagline: 'Scrabble Word Finder: Turn Tiles into Points',
    intro: 'Scrabble rewards vocabulary and tactics in equal measure. A good play is about more than the longest word — it is about tile values, premium squares and keeping a balanced rack.',
    how: { h: 'How to play Scrabble', items: ['Draw seven tiles and form a word on the board.', 'Every new word must connect to the words already played.', 'Scores add up from tile values and premium squares.', 'Use all seven tiles in one turn for a bonus.'] },
    tips: ['Learn the short words with J, Q, X and Z.', 'Keep a healthy mix of vowels and consonants.', 'Look for premium squares before you choose a word.', 'Use the Word Unscrambler to see every word your rack can make.'],
    closing: 'Switch the unscrambler to Words With Friends scoring if that is your game.',
  },
];
export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);
