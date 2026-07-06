export type ThemePreference = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';
const THEME_CHANGE_EVENT = 'app-theme-change';

export function getStoredThemePreference(): ThemePreference {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function resolveIsDark(preference: ThemePreference): boolean {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkModeActive(): boolean {
  return document.documentElement.classList.contains('dark');
}

export function applyTheme(preference: ThemePreference): void {
  document.documentElement.classList.toggle('dark', resolveIsDark(preference));
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function setThemePreference(preference: ThemePreference): void {
  window.localStorage.setItem(STORAGE_KEY, preference);
  applyTheme(preference);
}

// Used by components (e.g. chart components rendering inline SVG) that can't
// rely on Tailwind's dark: variant and need to know the resolved theme in JS.
export function subscribeToThemeChange(callback: () => void): () => void {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    media.removeEventListener('change', callback);
  };
}
