'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark' | undefined;
  systemTheme: 'light' | 'dark' | undefined;
}

const STORAGE_KEY = 'eg-theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | undefined>(undefined);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark' | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial =
      stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const system = getSystemTheme();
    const resolved = initial === 'system' ? system : initial;
    applyThemeClass(initial);

    const id = window.setTimeout(() => {
      setThemeState(initial);
      setSystemTheme(system);
      setResolvedTheme(resolved);
      setMounted(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const system = getSystemTheme();
      setSystemTheme(system);
      if (theme === 'system') {
        setResolvedTheme(system);
        applyThemeClass('system');
      }
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mounted, theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    const resolved = next === 'system' ? getSystemTheme() : next;
    setResolvedTheme(resolved);
    setSystemTheme(getSystemTheme());
    applyThemeClass(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme: mounted ? resolvedTheme : undefined,
      systemTheme: mounted ? systemTheme : undefined,
    }),
    [theme, setTheme, resolvedTheme, systemTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'system',
      setTheme: () => undefined,
      resolvedTheme: undefined,
      systemTheme: undefined,
    };
  }
  return ctx;
}
