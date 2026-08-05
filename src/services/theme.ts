import { ThemeVariant } from '../types';

export interface ThemeOption {
  id: ThemeVariant;
  name: string;
  primary: string;
  secondary: string;
  bgDark: string;
  description: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'cyan', name: 'Cyan Aurora', primary: '#00d2ff', secondary: '#3a7bd5', bgDark: '#020202', description: 'Futuristic glassmorphism with electric cyan and purple glow' },
  { id: 'midnight', name: 'Midnight Sapphire', primary: '#38bdf8', secondary: '#6366f1', bgDark: '#030712', description: 'Deep dark blue canvas with sapphire accents' },
  { id: 'ocean', name: 'Deep Ocean', primary: '#14b8a6', secondary: '#0284c7', bgDark: '#04151f', description: 'Subtle teal and emerald marine atmosphere' },
  { id: 'purple', name: 'Cyberpunk Purple', primary: '#a855f7', secondary: '#ec4899', bgDark: '#090514', description: 'Neon violet and magenta high contrast dark mode' },
  { id: 'emerald', name: 'Matrix Emerald', primary: '#10b981', secondary: '#059669', bgDark: '#02120b', description: 'Sleek emerald green futuristic dark aesthetic' },
  { id: 'crimson', name: 'Netflix Crimson', primary: '#ef4444', secondary: '#b91c1c', bgDark: '#0a0202', description: 'Classic cinematic crimson red and obsidian' },
];

const THEME_STORAGE_KEY = 'moviebox_theme';

export const themeManager = {
  getTheme(): ThemeOption {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      const found = THEMES.find((t) => t.id === saved);
      if (found) return found;
    } catch {}
    return THEMES[0];
  },

  setTheme(variant: ThemeOption | ThemeVariant) {
    const id = typeof variant === 'string' ? variant : variant.id;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
    document.documentElement.setAttribute('data-theme', id);
  },

  init() {
    const theme = this.getTheme();
    document.documentElement.setAttribute('data-theme', theme.id);
  },

  getVariants(): ThemeOption[] {
    return THEMES;
  }
};
