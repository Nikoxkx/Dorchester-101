'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LanguageCode } from '@/i18n/config';

export type Theme = 'light' | 'dark' | 'system';
export type Language = LanguageCode;
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type MapStyle = 'satellite' | 'street' | 'hybrid';

export const FONT_SIZE_VALUES: Record<FontSize, string> = {
  small: '15px',
  medium: '16px',
  large: '18px',
  'extra-large': '21px',
};

/**
 * Accessibility preferences. None of these are invented defaults: `system`
 * seeding is resolved in `useAccessibilityEffects`, which reads the real
 * media queries on first paint and only then fills in values the visitor has
 * not chosen themselves. A hard-coded `false` here would silently override a
 * visitor's own OS setting, which is the classic way accessibility toggles end
 * up decorative.
 */
export interface AccessibilityPrefs {
  reduceMotion: 'auto' | 'on' | 'off';
  highContrast: 'auto' | 'on' | 'off';
  underlineLinks: boolean;
  largeFocus: boolean;
  legibleFont: boolean;
  textSpacing: boolean;
  announceUpdates: boolean;
}

export const DEFAULT_ACCESSIBILITY: AccessibilityPrefs = {
  reduceMotion: 'auto',
  highContrast: 'auto',
  underlineLinks: false,
  largeFocus: false,
  legibleFont: false,
  textSpacing: false,
  announceUpdates: true,
};

/**
 * A message destined for an `aria-live` region. Kept in the store rather than a
 * component so any feature (refresh counts, language changes, errors, saved
 * places) can push one without prop drilling, and so the visitor's
 * "announce updates" preference is honoured in exactly one place.
 */
export interface Announcement {
  id: number;
  message: string;
  politeness: 'polite' | 'assertive';
}

/** Transient announcement counter, never persisted. */
let announcementId = 0;

export interface CustomFeed {
  id: string;
  url: string;
  label: string;
}

interface AppState {
  theme: Theme;
  language: Language;
  fontSize: FontSize;
  sidebarCollapsed: boolean;
  /**
   * Drawer state on small screens. Separate from `sidebarCollapsed` because the
   * two mean different things: collapse is a permanent desktop preference, the
   * drawer is transient and must close on navigation, Escape and route change.
   */
  mobileNavOpen: boolean;
  lastUpdated: string | null;
  mapStyle: MapStyle;
  accessibility: AccessibilityPrefs;
  speechRate: number;
  /**
   * Voice URI chosen from `speechSynthesis.getVoices()`. Stored because a
   * screen-reader user who has picked a voice on this device should not have to
   * re-pick it at the top of every page. `null` means "device default".
   */
  speechVoiceURI: string | null;
  favorites: string[];
  checklist: Record<string, boolean>;
  enabledNewsSources: string[];
  customFeeds: CustomFeed[];
  enabledTransitFeeds: string[];
  autoRefresh: boolean;
  refreshIntervalMinutes: number;
  /**
   * Bumped by "Refresh now" in Settings. Every live panel treats it as a
   * dependency, so one press reloads arrivals, alerts and feeds without a full
   * page reload wiping the visitor's scroll position and filters.
   */
  dataEpoch: number;
  /** Set once persisted state has been read, so nothing flashes defaults. */
  hydrated: boolean;
  lastAnnouncement: Announcement | null;

  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  setLanguage: (language: Language) => void;
  setFontSize: (fontSize: FontSize) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setLastUpdated: (time: string) => void;
  setMapStyle: (style: MapStyle) => void;
  setAccessibility: <K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => void;
  toggleAccessibility: (key: keyof Pick<AccessibilityPrefs, 'underlineLinks' | 'largeFocus' | 'legibleFont' | 'textSpacing' | 'announceUpdates'>) => void;
  setAccessibilityAuto: (key: 'reduceMotion' | 'highContrast') => void;
  setSpeechRate: (rate: number) => void;
  setSpeechVoiceURI: (uri: string | null) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  setChecklistItem: (id: string, done: boolean) => void;
  setEnabledNewsSources: (ids: string[]) => void;
  addCustomFeed: (feed: CustomFeed) => void;
  removeCustomFeed: (id: string) => void;
  setEnabledTransitFeeds: (ids: string[]) => void;
  setAutoRefresh: (on: boolean) => void;
  setRefreshIntervalMinutes: (minutes: number) => void;
  markHydrated: () => void;
  refreshAllData: () => void;
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  resetAll: () => void;
}

const customStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* private mode or quota; preferences stay in memory */
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
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
      mobileNavOpen: false,
      lastUpdated: null,
      mapStyle: 'satellite',
      accessibility: DEFAULT_ACCESSIBILITY,
      speechRate: 1,
      speechVoiceURI: null,
      favorites: [],
      checklist: {},
      enabledNewsSources: [],
      customFeeds: [],
      enabledTransitFeeds: ['mbta-alerts', 'mbta-cr'],
      autoRefresh: true,
      refreshIntervalMinutes: 5,
      hydrated: false,
      dataEpoch: 0,
      lastAnnouncement: null,

      setTheme: (theme) => set({ theme }),
      cycleTheme: () =>
        set((s) => ({
          theme: s.theme === 'light' ? 'dark' : s.theme === 'dark' ? 'system' : 'light',
        })),
      setLanguage: (language) => set({ language }),
      setFontSize: (fontSize) => set({ fontSize }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      setLastUpdated: (lastUpdated) => set({ lastUpdated }),
      setMapStyle: (mapStyle) => set({ mapStyle }),

      setAccessibility: (key, value) =>
        set((s) => ({ accessibility: { ...s.accessibility, [key]: value } })),
      toggleAccessibility: (key) =>
        set((s) => ({ accessibility: { ...s.accessibility, [key]: !s.accessibility[key] } })),
      setAccessibilityAuto: (key) =>
        set((s) => ({ accessibility: { ...s.accessibility, [key]: 'auto' } })),
      setSpeechRate: (speechRate) => set({ speechRate: Math.min(1.75, Math.max(0.6, speechRate)) }),
      setSpeechVoiceURI: (speechVoiceURI) => set({ speechVoiceURI }),

      toggleFavorite: (rawId) => {
        // An empty key would be stored, matched by no control and stuck in
        // localStorage forever, so refuse it at the boundary.
        const id = rawId.trim();
        if (!id) return;
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id].slice(-40),
        }));
      },
      isFavorite: (id) => get().favorites.includes(id),
      setChecklistItem: (id, done) =>
        set((s) => ({ checklist: { ...s.checklist, [id]: done } })),

      setEnabledNewsSources: (enabledNewsSources) => set({ enabledNewsSources }),
      addCustomFeed: (feed) =>
        set((s) => (s.customFeeds.some((f) => f.url === feed.url) ? s : { customFeeds: [...s.customFeeds, feed] })),
      removeCustomFeed: (id) => set((s) => ({ customFeeds: s.customFeeds.filter((f) => f.id !== id) })),
      setEnabledTransitFeeds: (enabledTransitFeeds) => set({ enabledTransitFeeds }),
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshIntervalMinutes: (refreshIntervalMinutes) => set({ refreshIntervalMinutes }),

      markHydrated: () => set({ hydrated: true }),
      refreshAllData: () => set((state) => ({ dataEpoch: state.dataEpoch + 1, lastUpdated: new Date().toISOString() })),

      announce: (message, politeness = 'polite') =>
        set({ lastAnnouncement: { id: ++announcementId, message, politeness } }),
      resetAll: () => {
        // Clear the persisted blob as well as memory, otherwise the next load
        // restores everything the visitor just asked us to delete.
        customStorage.removeItem('dor101-settings');
        set({
          theme: 'system',
          language: 'en',
          fontSize: 'medium',
          sidebarCollapsed: false,
          mapStyle: 'satellite',
          accessibility: DEFAULT_ACCESSIBILITY,
          speechRate: 1,
          speechVoiceURI: null,
          favorites: [],
          checklist: {},
          enabledNewsSources: [],
          customFeeds: [],
          enabledTransitFeeds: ['mbta-alerts', 'mbta-cr'],
          autoRefresh: true,
          refreshIntervalMinutes: 5,
        });
      },
    }),
    {
      name: 'dor101-settings',
      storage: createJSONStorage(() => customStorage),
      version: 2,
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        fontSize: s.fontSize,
        sidebarCollapsed: s.sidebarCollapsed,
        mapStyle: s.mapStyle,
        accessibility: s.accessibility,
        speechRate: s.speechRate,
        speechVoiceURI: s.speechVoiceURI,
        favorites: s.favorites,
        checklist: s.checklist,
        enabledNewsSources: s.enabledNewsSources,
        customFeeds: s.customFeeds,
        enabledTransitFeeds: s.enabledTransitFeeds,
        autoRefresh: s.autoRefresh,
        refreshIntervalMinutes: s.refreshIntervalMinutes,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);

/**
 * Compatibility accessor used by older call sites that destructured the
 * single `reduceMotion` boolean. Kept so behaviour does not change while the
 * rest of the app moves to `accessibility.reduceMotion`.
 */
export function useReduceMotion(): boolean {
  return useAppStore((s) => s.accessibility.reduceMotion === 'on');
}
