import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getStoredThemePreference, setThemePreference, type ThemePreference } from '../lib/theme';

export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(getStoredThemePreference);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    setThemePreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, setPreference };
}
