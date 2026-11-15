import w5 from '../data/generated/words-5.json';
import a5 from '../data/generated/answers-5.json';

// Playable-game engine: ENABLE 5-letter words are valid guesses, a frequency-filtered subset are the answers.
export const VALID = new Set((w5 as { w: string }).w.split(' '));
export const ANSWERS = (a5 as { a: string }).a.split(' ');

export type Cell = 0 | 1 | 2; // 0 absent, 1 present (yellow), 2 correct (green)

export function scoreGuess(guess: string, answer: string): Cell[] {
  const res: Cell[] = Array(guess.length).fill(0);
  const left: Record<string, number> = {};
  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) res[i] = 2;
    else left[answer[i]] = (left[answer[i]] || 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (res[i] === 2) continue;
    if (left[guess[i]] > 0) { res[i] = 1; left[guess[i]]--; }
  }
  return res;
}

// Local calendar day number (so the daily puzzle rolls over at the player's midnight).
export const dayNumber = (d = new Date()) => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86400000);
export const dayLabel = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const dailyAnswers = (boards: number, day = dayNumber()) =>
  Array.from({ length: boards }, (_, i) => ANSWERS[(((day * boards + i) * 7919) % ANSWERS.length + ANSWERS.length) % ANSWERS.length]);
export const wordOfTheDay = (day = dayNumber()) => ANSWERS[((day * 104729) % ANSWERS.length + ANSWERS.length) % ANSWERS.length];

export const randomAnswers = (boards: number) => {
  const out: string[] = [];
  while (out.length < boards) { const w = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]; if (!out.includes(w)) out.push(w); }
  return out;
};

export type Stats = { played: number; won: number; streak: number; best: number; lastDay: number; dist: number[] };
export const emptyStats = (max: number): Stats => ({ played: 0, won: 0, streak: 0, best: 0, lastDay: -1, dist: Array(max).fill(0) });
export const statsKey = (slug: string) => `5lw:stats:${slug}`;
export function loadStats(slug: string, max: number): Stats {
  try { const s = JSON.parse(localStorage.getItem(statsKey(slug)) || 'null'); if (s) return { ...emptyStats(max), ...s }; } catch { /* ignore */ }
  return emptyStats(max);
}
export function saveStats(slug: string, s: Stats) { try { localStorage.setItem(statsKey(slug), JSON.stringify(s)); } catch { /* ignore */ } }

export const KEYBOARD = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
