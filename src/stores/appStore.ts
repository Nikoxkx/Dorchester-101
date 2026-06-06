'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'ht' | 'pt' | 'vi' | 'kea' | 'so' | 'zh' | 'ar';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface AppState {
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  lastUpdated: string | null;
  reduceMotion: boolean;
  
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (fontSize: FontSize) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLastUpdated: (time: string) => void;
  setReduceMotion: (reduce: boolean) => void;
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

export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  'small': '14px',
  'medium': '16px',
  'large': '18px',
  'extra-large': '20px',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      language: 'en',
      fontSize: 'medium',
      sidebarCollapsed: false,
      lastUpdated: null,
      reduceMotion: false,
      
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setLastUpdated: (time) => set({ lastUpdated: time }),
      setReduceMotion: (reduce) => set({ reduceMotion: reduce }),
    }),
    {
      name: 'dor101-settings',
    }
  )
);
