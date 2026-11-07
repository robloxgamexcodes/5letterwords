// Liked words are stored in this browser only (localStorage).
export const LIKES_KEY = '5lw:likes';
export const LIKES_EVENT = 'lw:likes';

export function loadLikes(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(LIKES_KEY) || '[]')); } catch { return new Set(); }
}
export function toggleLike(word: string): Set<string> {
  const next = loadLikes();
  next.has(word) ? next.delete(word) : next.add(word);
  try { localStorage.setItem(LIKES_KEY, JSON.stringify([...next])); } catch { /* storage unavailable */ }
  window.dispatchEvent(new CustomEvent(LIKES_EVENT, { detail: next }));
  return next;
}
