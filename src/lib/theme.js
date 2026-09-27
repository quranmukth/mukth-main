// ── Theme — Dark / Light mode system ─────────────────────────────────────────
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: 'light', // 'light' | 'dark'
      toggle: () => {
        const next = get().mode === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        set({ mode: next });
      },
      setMode: (mode) => {
        document.documentElement.setAttribute('data-theme', mode);
        set({ mode });
      },
      // Initialize theme on app load
      init: () => {
        const mode = get().mode;
        document.documentElement.setAttribute('data-theme', mode);
      },
    }),
    { name: 'mukth-theme' }
  )
);

// CSS custom properties for themes
export const themeTokens = {
  light: {
    '--bg-primary': '#fafaf8',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#f0f7f4',
    '--bg-sidebar': '#011a12',
    '--bg-card': '#ffffff',
    '--bg-input': '#ffffff',
    '--bg-hover': 'rgba(6, 78, 59, 0.04)',
    '--text-primary': '#0c1810',
    '--text-secondary': '#4a6358',
    '--text-tertiary': '#6b8578',
    '--text-on-dark': '#ffffff',
    '--border-primary': '#cde5d7',
    '--border-secondary': '#e8f4ef',
    '--shadow-sm': '0 1px 3px rgba(0,0,0,0.06)',
    '--shadow-md': '0 4px 16px rgba(0,0,0,0.08)',
    '--shadow-lg': '0 12px 40px rgba(0,0,0,0.12)',
    '--overlay': 'rgba(1, 26, 18, 0.6)',
  },
  dark: {
    '--bg-primary': '#0a1410',
    '--bg-secondary': '#111e18',
    '--bg-tertiary': '#162820',
    '--bg-sidebar': '#080f0c',
    '--bg-card': '#14231c',
    '--bg-input': '#1a2e25',
    '--bg-hover': 'rgba(212, 175, 55, 0.06)',
    '--text-primary': '#e8f4ef',
    '--text-secondary': '#9ab5aa',
    '--text-tertiary': '#6b8578',
    '--text-on-dark': '#ffffff',
    '--border-primary': '#1e3a2f',
    '--border-secondary': '#192e25',
    '--shadow-sm': '0 1px 3px rgba(0,0,0,0.3)',
    '--shadow-md': '0 4px 16px rgba(0,0,0,0.4)',
    '--shadow-lg': '0 12px 40px rgba(0,0,0,0.5)',
    '--overlay': 'rgba(0, 0, 0, 0.7)',
  },
};
