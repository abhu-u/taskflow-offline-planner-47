import { useEffect, useState } from 'react';
import { getSetting, setSetting } from '@/lib/db';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load theme from database
    getSetting('theme').then((savedTheme) => {
      const initialTheme = (savedTheme as Theme) || 'light';
      setThemeState(initialTheme);
      document.documentElement.classList.toggle('dark', initialTheme === 'dark');
      setIsLoading(false);
    });
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    setSetting('theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme, isLoading };
}
