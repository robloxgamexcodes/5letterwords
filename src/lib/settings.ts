export type Settings = {
  scores: boolean; bestFirst: boolean; uppercase: boolean; colours: boolean;
  repeats: boolean; contrast: boolean; dark: boolean;
};
export const DEFAULT_SETTINGS: Settings = { scores: true, bestFirst: false, uppercase: false, colours: false, repeats: false, contrast: false, dark: false };
export const SETTINGS_KEY = '5lw:settings';
export const SETTINGS_EVENT = 'lw:settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}
export function applySettings(s: Settings) {
  const root = document.documentElement;
  root.dataset.theme = s.dark ? 'dark' : 'light';
  root.dataset.contrast = s.contrast ? 'high' : 'normal';
}
export function saveSettings(s: Settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
  applySettings(s);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: s }));
}
