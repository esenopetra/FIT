import { useEffect, useState } from 'react';
import { isDarkModeActive, subscribeToThemeChange } from '../lib/theme';

// For components that render inline styles (e.g. Recharts SVG) and can't rely
// on Tailwind's dark: variant — they need the resolved boolean in JS.
export function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(isDarkModeActive);

  useEffect(() => subscribeToThemeChange(() => setIsDark(isDarkModeActive())), []);

  return isDark;
}
