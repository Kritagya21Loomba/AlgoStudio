import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'beige';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
}

const ORDER: Theme[] = ['light', 'dark', 'beige'];

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('algostudio-theme') as Theme | null;
  return saved && ORDER.includes(saved) ? saved : 'dark';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('algostudio-theme', theme);
    set({ theme });
  },

  cycleTheme: () => {
    const current = get().theme;
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    get().setTheme(next);
  },
}));
