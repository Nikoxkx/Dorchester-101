'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LanguageCode } from '@/i18n/config';

export type Theme = 'light' | 'dark' | 'system';
export type Language = LanguageCode;
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type MapStyle = 'satellite' | 'street' | 'hybrid';
/**
 * Surface treatment — how panels sit over the Dorchester photograph.
 * `solid` is the default opaque UI. The translucent styles differ in both
 * transparency and hue, and all of them derive from the active palette in CSS
 * (`color-mix` over the `--bg-*-solid` tokens), so a style never washes the
 * chosen colours back to harbor: `glass` is the classic soft blur, `frost` is
 * more see-through with a heavy frost blur and a bright sheen, `tinted`
 * washes every panel in the palette's own accent hue, and `aurora` lays a
 * slow two-colour glow (accent + secondary) over glass. Contrast is protected
 * in CSS: text colours never change, high-contrast mode and
 * `prefers-reduced-transparency` both win back the solid palette.
 */
export type Surface = 'solid' | 'glass' | 'frost' | 'tinted' | 'aurora';
export const SURFACES: Surface[] = ['solid', 'glass', 'frost', 'tinted', 'aurora'];
/** Colour palette for the whole interface. Each has a light and a dark variant. */
export type Palette =
  | 'harbor'
  | 'midnight'
  | 'forest'
  | 'brick'
  | 'slate'
  | 'sand'
  | 'violet'
  | 'lagoon'
  | 'rose'
  | 'sunset'
  | 'cobalt'
  | 'orchid';
export const PALETTES: Palette[] = [
  'harbor',
  'midnight',
  'forest',
  'brick',
  'slate',
  'sand',
  'violet',
  'lagoon',
  'rose',
  'sunset',
  'cobalt',
  'orchid',
];

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

/**
 * Homepage customization (Settings → Homepage). The sections a resident
 * can hide or rearrange; the storm/emergency banner is deliberately not
 * in this list — it is a safety surface, not furniture.
 */
export type HomeSectionId =
  | 'hero'
  | 'greeting'
  | 'weather'
  | 'permissions'
  | 'glance'
  | 'quick'
  | 'clothing'
  | 'news'
  | 'map'
  | 'extras';
export const HOME_SECTION_ORDER: HomeSectionId[] = [
  'hero', 'greeting', 'weather', 'permissions', 'glance', 'quick', 'clothing', 'news', 'map', 'extras',
];
/** The 4.3–4.4 shipped order (the since-removed NowBar strip first).
 *  Kept — as plain strings, since 'nowbar' is no longer a section — only
 *  so the persist migration can recognize an un-customized layout from
 *  that era; anyone who rearranged keeps theirs. */
const HOME_SECTION_ORDER_V2: string[] = [
  'nowbar', 'hero', 'greeting', 'weather', 'permissions', 'glance', 'quick', 'clothing', 'news', 'map', 'extras',
];
export type HomeCardStyle = 'match' | 'solid' | 'glass' | 'tinted' | 'aurora';
export const HOME_CARD_STYLES: HomeCardStyle[] = ['match', 'solid', 'glass', 'tinted', 'aurora'];
export interface HomeLayout {
  order: HomeSectionId[];
  hidden: HomeSectionId[];
  cardStyle: HomeCardStyle;
}
export const DEFAULT_HOME_LAYOUT: HomeLayout = {
  order: HOME_SECTION_ORDER,
  hidden: [],
  cardStyle: 'match',
};

/**
 * Weather is opt-in (4.8). `weatherEnabled` gates the weather *features*:
 * the homepage panel, the /weather page and its menu links, the
 * what-to-wear pop-up and the status-bar weather chip. Storm warnings are
 * deliberately NOT behind this switch — they are a safety surface and
 * always show. `weatherLayout` arranges the /weather page's blocks the
 * way `homeLayout` arranges the homepage; the alerts block is pinned
 * first on that page and is never furniture either.
 */
export type WeatherBlockId = 'current' | 'spotlight' | 'tips' | 'hourly' | 'daily' | 'method';
export const WEATHER_BLOCK_ORDER: WeatherBlockId[] = ['current', 'spotlight', 'tips', 'hourly', 'daily', 'method'];
export interface WeatherLayout {
  order: WeatherBlockId[];
  hidden: WeatherBlockId[];
}
export const DEFAULT_WEATHER_LAYOUT: WeatherLayout = {
  order: WEATHER_BLOCK_ORDER,
  hidden: [],
};

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
  surface: Surface;
  palette: Palette;
  homeLayout: HomeLayout;
  /** Master switch for weather features (Settings → Weather). Off by
   *  default; storm warnings ignore it and always show. */
  weatherEnabled: boolean;
  weatherLayout: WeatherLayout;
  /** The plain-language privacy notice has been shown and acknowledged. */
  consentSeen: boolean;
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
  setSurface: (surface: Surface) => void;
  setPalette: (palette: Palette) => void;
  setHomeLayout: (layout: HomeLayout) => void;
  resetHomeLayout: () => void;
  setWeatherEnabled: (enabled: boolean) => void;
  setWeatherLayout: (layout: WeatherLayout) => void;
  resetWeatherLayout: () => void;
  setConsentSeen: (seen: boolean) => void;
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

/**
 * Persisted-settings migrations, applied in version order. Exported (not
 * inlined in the persist config) so the upgrade contract is unit-tested:
 * a resident's saved choices must survive every release.
 */
export function migrateSettings(persisted: unknown, version: number): AppState {
  const state = (persisted ?? {}) as Partial<AppState>;

  // v3 (4.5): the shipped homepage order moved the NowBar from first to
  // last. Layouts still equal to the old shipped order follow it;
  // rearranged layouts are untouched.
  if (version < 3 && state.homeLayout) {
    const order = state.homeLayout.order;
    const isOldDefault =
      Array.isArray(order) &&
      order.length === HOME_SECTION_ORDER_V2.length &&
      order.every((id, i) => id === HOME_SECTION_ORDER_V2[i]);
    if (isOldDefault) {
      state.homeLayout = { ...state.homeLayout, order: [...HOME_SECTION_ORDER] };
    }
  }

  // v4 (4.8): weather becomes opt-in. A resident who had arranged their
  // homepage had chosen a page *with* weather on it, so their weather
  // stays on; everyone still on the shipped layout gets the new default
  // (off). A layout counts as arranged if its order, hidden list or card
  // style differs from the shipped default in any way. The comparison
  // ignores the since-retired 'nowbar' slot (removed in v5 below), so a
  // shipped-default layout from the NowBar era still reads as default.
  if (version < 4) {
    const layout = state.homeLayout;
    const order = Array.isArray(layout?.order) ? (layout.order as string[]).filter((id) => id !== 'nowbar') : layout?.order;
    const customized =
      !!layout &&
      (!Array.isArray(order) ||
        order.length !== HOME_SECTION_ORDER.length ||
        order.some((id, i) => id !== HOME_SECTION_ORDER[i]) ||
        (Array.isArray(layout.hidden) && layout.hidden.length > 0) ||
        (layout.cardStyle !== undefined && layout.cardStyle !== 'match'));
    state.weatherEnabled = customized;
  }

  // v5 (4.9): the NowBar strip was removed from the homepage entirely.
  // Stored layouts simply lose the slot; everything else keeps its place.
  if (version < 5 && state.homeLayout) {
    const order = Array.isArray(state.homeLayout.order)
      ? (state.homeLayout.order as string[]).filter((id) => id !== 'nowbar')
      : state.homeLayout.order;
    const hidden = Array.isArray(state.homeLayout.hidden)
      ? (state.homeLayout.hidden as string[]).filter((id) => id !== 'nowbar')
      : state.homeLayout.hidden;
    state.homeLayout = {
      ...state.homeLayout,
      order: order as HomeSectionId[],
      hidden: hidden as HomeSectionId[],
    };
  }

  return state as AppState;
}

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
      surface: 'solid',
      palette: 'harbor',
      homeLayout: DEFAULT_HOME_LAYOUT,
      weatherEnabled: false,
      weatherLayout: DEFAULT_WEATHER_LAYOUT,
      consentSeen: false,
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
      setSurface: (surface) => set({ surface }),
      setPalette: (palette) => set({ palette }),
      setHomeLayout: (homeLayout) => set({ homeLayout }),
      resetHomeLayout: () => set({ homeLayout: DEFAULT_HOME_LAYOUT }),
      setWeatherEnabled: (weatherEnabled) => set({ weatherEnabled }),
      setWeatherLayout: (weatherLayout) => set({ weatherLayout }),
      resetWeatherLayout: () => set({ weatherLayout: DEFAULT_WEATHER_LAYOUT }),
      setConsentSeen: (consentSeen) => set({ consentSeen }),

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
          surface: 'solid',
          palette: 'harbor',
          homeLayout: DEFAULT_HOME_LAYOUT,
          weatherEnabled: false,
          weatherLayout: DEFAULT_WEATHER_LAYOUT,
          consentSeen: false,
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
      version: 5,
      migrate: migrateSettings,
      partialize: (s) => ({
        theme: s.theme,
        language: s.language,
        fontSize: s.fontSize,
        sidebarCollapsed: s.sidebarCollapsed,
        mapStyle: s.mapStyle,
        surface: s.surface,
        palette: s.palette,
        homeLayout: s.homeLayout,
        weatherEnabled: s.weatherEnabled,
        weatherLayout: s.weatherLayout,
        consentSeen: s.consentSeen,
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
