import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { darkColors, lightColors, type ThemeColors } from './colors';

type ThemeMode = 'dark' | 'light';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  navigationTheme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const colors = mode === 'dark' ? darkColors : lightColors;

  const navigationTheme = useMemo<Theme>(() => {
    const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        card: colors.surface,
        border: colors.border,
        primary: colors.primary,
        text: colors.text,
      },
    };
  }, [colors, mode]);

  const value = useMemo(
    () => ({
      mode,
      colors,
      navigationTheme,
      toggleTheme: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [colors, mode, navigationTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
