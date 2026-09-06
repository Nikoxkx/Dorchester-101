'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'ht' | 'pt' | 'vi' | 'kea' | 'so' | 'zh' | 'ar';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type FavoriteKind = 'project' | 'listing' | 'food' | 'resource';

export interface FavoriteItem {
  id: string;
  kind: FavoriteKind;
  title: string;
  href: string;
  savedAt: string;
}

interface AppState {
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  reduceMotion: boolean;
  reduceTransparency: boolean;
  favorites: FavoriteItem[];
  lastUpdated: string | null;

  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (fontSize: FontSize) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
  setReduceTransparency: (reduce: boolean) => void;
  setLastUpdated: (time: string) => void;

  toggleFavorite: (item: Omit<FavoriteItem, 'savedAt'>) => boolean;
  isFavorite: (id: string) => boolean;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
}

export const LANGUAGE_INFO: Record<Language, { name: string; nativeName: string; flag: string; rtl?: boolean }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  ht: { name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', flag: '🇭🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  kea: { name: 'Cape Verdean Creole', nativeName: 'Kriolu', flag: '🇨🇻' },
  so: { name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴' },
  zh: { name: 'Mandarin Chinese', nativeName: '普通话', flag: '🇨🇳' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
};

/** Base root font-size per user setting. The whole rem type scale follows it. */
export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'extra-large': '20px',
};

// Local-only storage — privacy-first: nothing a user chooses ever leaves the device.
const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch {
      // Ignore storage errors (private mode, quota)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore storage errors
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'en',
      fontSize: 'medium',
      sidebarCollapsed: false,
      reduceMotion: false,
      reduceTransparency: false,
      favorites: [],
      lastUpdated: null,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setReduceTransparency: (reduceTransparency) => set({ reduceTransparency }),
      setLastUpdated: (time) => set({ lastUpdated: time }),

      toggleFavorite: (item) => {
        const exists = get().favorites.some((f) => f.id === item.id);
        if (exists) {
          set((s) => ({ favorites: s.favorites.filter((f) => f.id !== item.id) }));
          return false;
        }
        set((s) => ({
          favorites: [...s.favorites, { ...item, savedAt: new Date().toISOString() }],
        }));
        return true;
      },
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'dor101-settings',
      storage: createJSONStorage(() => customStorage),
    },
  ),
);
