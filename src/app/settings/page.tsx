'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Eye,
  EyeOff,
  LayoutGrid,
  Palette as PaletteIcon,
  RefreshCw,
  CloudSun,
  RotateCcw,
  BellRing,
  Check,
  Database,
  Gauge,
  Languages,
  Map as MapIcon,
  Minus,
  Plus,
  Rss,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle, StatusPicker } from '@/components/a11y/Toggle';
import { ReportProblem } from '@/components/a11y';
import { PermissionSetup } from '@/components/pwa/PermissionSetup';
import { usePrivacyStore } from '@/stores/privacyStore';
import { useAppStore, type FontSize, type MapStyle, PALETTES, SURFACES, type Palette, type Surface, HOME_SECTION_ORDER, HOME_CARD_STYLES, type HomeSectionId, type WeatherBlockId } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';
import { speechVoiceMatches, useSpeechSupported } from '@/hooks/useSpeechSupported';
import { spokenLanguage } from '@/i18n/spokenLanguages';
import { useResolvedPrefs } from '@/hooks/useResolvedPrefs';
import { detectLanguage, LANGUAGES, languageMeta, type LanguageCode } from '@/i18n/config';
import { TOTAL_KEYS, localeCoverage } from '@/i18n';
import { useAnnounce } from '@/components/providers/LiveRegion';
import { NEWS_FEEDS, TRANSIT_FEEDS } from '@/data/feeds';
import { APP_VERSION } from '@/lib/site';
import { RESOURCES, findResource } from '@/data/resources';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/i18n/en';

/**
 * Settings.
 *
 * Every control on this page writes to the same store the rest of the app reads,
 * and nothing here is decorative: the switches change the document, the feed
 * choices change what the API fetches, the saved list changes the dashboard. The
 * page also *reports* state it did not create — detected device preferences,
 * real translation coverage from the dictionary itself, and the last time live
 * data was read — because a settings screen that only ever shows defaults is
 * guessing.
 */

const SECTION_IDS = ['language', 'appearance', 'homepage', 'weather', 'accessibility', 'data', 'permissions', 'feeds', 'saved', 'privacy'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SIZES: FontSize[] = ['small', 'medium', 'large', 'extra-large'];

/** Labels for the homepage section list, reusing existing keys where they exist. */
const HOME_SECTION_LABEL: Record<HomeSectionId, TranslationKey> = {
  hero: 'settings.home.section.hero',
  greeting: 'settings.home.section.greeting',
  weather: 'settings.home.section.weather',
  permissions: 'settings.section.permissions',
  glance: 'dashboard.glance',
  quick: 'dashboard.quickAccess',
  clothing: 'nav.clothing',
  news: 'settings.home.section.news',
  map: 'dashboard.mapTitle',
  extras: 'settings.home.section.extras',
};

const WEATHER_BLOCK_LABEL: Record<WeatherBlockId, TranslationKey> = {
  current: 'settings.weather.block.current',
  spotlight: 'settings.weather.block.spotlight',
  tips: 'settings.weather.block.tips',
  hourly: 'settings.weather.block.hourly',
  daily: 'settings.weather.block.daily',
  method: 'settings.weather.block.method',
};

/** Preview swatches — the same hexes as the palette blocks in globals.css. */
const PALETTE_SWATCH: Record<Palette, { light: { bg: string; card: string; accent: string; accent2: string }; dark: { bg: string; card: string; accent: string; accent2: string } }> = {
  harbor: { light: { bg: '#FAF7F1', card: '#F2EDE4', accent: '#14304F', accent2: '#A6362A' }, dark: { bg: '#0F1720', card: '#16202C', accent: '#7FB4E8', accent2: '#E8746A' } },
  midnight: { light: { bg: '#FFFFFF', card: '#F4F4F5', accent: '#111111', accent2: '#C0392B' }, dark: { bg: '#000000', card: '#0B0B0D', accent: '#E8E8ED', accent2: '#FF7A6B' } },
  forest: { light: { bg: '#F7F8F3', card: '#ECEFE4', accent: '#1F5A3A', accent2: '#A85A22' }, dark: { bg: '#0C1511', card: '#121E18', accent: '#7FD3A3', accent2: '#F0A070' } },
  brick: { light: { bg: '#FBF6F2', card: '#F3EAE3', accent: '#8E2E22', accent2: '#14304F' }, dark: { bg: '#170F0D', card: '#201513', accent: '#F09A8C', accent2: '#8DBCEA' } },
  slate: { light: { bg: '#F5F7F9', card: '#ECEFF3', accent: '#2F4A66', accent2: '#B5432F' }, dark: { bg: '#0E1216', card: '#151A20', accent: '#9CC0E4', accent2: '#F08A78' } },
  sand: { light: { bg: '#FBF5E9', card: '#F3EAD6', accent: '#7A4E0F', accent2: '#1F4E6B' }, dark: { bg: '#17130C', card: '#201A11', accent: '#E9BE6A', accent2: '#8BC4E6' } },
  violet: { light: { bg: '#F8F6FC', card: '#EFEBF7', accent: '#4A2E8A', accent2: '#B0402F' }, dark: { bg: '#100C1A', card: '#171226', accent: '#B9A3F2', accent2: '#F3907F' } },
  lagoon: { light: { bg: '#F4FAF8', card: '#E4F1ED', accent: '#0F6B5C', accent2: '#B3541E' }, dark: { bg: '#081713', card: '#0E211C', accent: '#6EDDBE', accent2: '#F2A679' } },
  rose: { light: { bg: '#FBF4F5', card: '#F5E6E9', accent: '#9E2B4F', accent2: '#1F4E6B' }, dark: { bg: '#180B10', card: '#211117', accent: '#F29FBC', accent2: '#8BC4E6' } },
  sunset: { light: { bg: '#FBF5EE', card: '#F6E7D8', accent: '#A64A12', accent2: '#146B66' }, dark: { bg: '#1A110A', card: '#231610', accent: '#F7B267', accent2: '#7FD1C8' } },
  cobalt: { light: { bg: '#F4F7FD', card: '#E5ECFA', accent: '#1D4FB8', accent2: '#B03060' }, dark: { bg: '#081226', card: '#0E1A36', accent: '#8FB4FF', accent2: '#F29FBC' } },
  orchid: { light: { bg: '#FAF4FB', card: '#F2E4F4', accent: '#8A2B8F', accent2: '#0F6B5C' }, dark: { bg: '#160A1C', card: '#1F1029', accent: '#E2A3F5', accent2: '#6EDDBE' } },
};

/**
 * Miniature of each surface style, painted with the *currently selected*
 * palette over the same Dorchester Bay photo the real backdrop uses, so what
 * the tile shows is what the whole site will do: same transparency shares and
 * the same hue mixing as the `data-surface` rules in globals.css.
 */
function surfacePreview(surface: Surface, sw: { bg: string; card: string; accent: string; accent2: string }): React.CSSProperties {
  switch (surface) {
    case 'solid':
      return { background: sw.card };
    case 'glass':
      return { background: `color-mix(in srgb, ${sw.card} 62%, transparent)`, backdropFilter: 'blur(3px)' };
    case 'frost':
      return {
        background: `linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%), color-mix(in srgb, ${sw.card} 48%, transparent)`,
        backdropFilter: 'blur(6px)',
      };
    case 'tinted':
      return { background: `color-mix(in srgb, color-mix(in oklab, ${sw.card} 82%, ${sw.accent} 18%) 92%, transparent)`, backdropFilter: 'blur(2px)' };
    case 'aurora':
      return {
        background: `linear-gradient(135deg, color-mix(in srgb, ${sw.accent} 38%, transparent), transparent 52%, color-mix(in srgb, ${sw.accent2} 38%, transparent)), color-mix(in srgb, ${sw.card} 72%, transparent)`,
        backdropFilter: 'blur(4px)',
      };
  }
}

const SIZE_KEY: Record<FontSize, TranslationKey> = {
  small: 'size.small',
  medium: 'size.medium',
  large: 'size.large',
  'extra-large': 'size.extraLarge',
};
const MAP_STYLES: MapStyle[] = ['satellite', 'street', 'hybrid'];
const REFRESH_CHOICES = [1, 2, 5, 10, 15, 30, 60];


/**
 * "Check for updates" — asks the service worker to look for a newer build
 * right now instead of waiting for the hourly background check. If a
 * worker is already waiting, the existing polite reload banner (in
 * ServiceWorkerRegistration) is what applies it; this control just
 * reports the verdict honestly, including when there is no worker
 * (desktop shell, private mode) and so nothing to check against.
 */
function UpdateChecker() {
  const { t } = useI18n();
  const [state, setState] = useState<'idle' | 'checking' | 'current' | 'found' | 'unavailable'>('idle');

  const check = async () => {
    if (!('serviceWorker' in navigator)) {
      setState('unavailable');
      return;
    }
    setState('checking');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        setState('unavailable');
        return;
      }
      await reg.update();
      // A freshly found worker takes a beat to reach `waiting`.
      window.setTimeout(() => setState(reg.waiting ? 'found' : 'current'), 900);
    } catch {
      setState('unavailable');
    }
  };

  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void check()}
        disabled={state === 'checking'}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-xs font-bold text-white transition-transform active:scale-[0.97] disabled:opacity-60"
      >
        <RefreshCw className={cn('h-3.5 w-3.5', state === 'checking' && 'animate-spin')} aria-hidden="true" />
        {state === 'checking' ? t('settings.updates.checking') : t('settings.updates.check')}
      </button>
      <span role="status" className="text-xs text-[var(--color-text-secondary)]">
        {state === 'current' && t('settings.updates.current', { version: APP_VERSION })}
        {state === 'found' && t('settings.updates.found')}
        {state === 'unavailable' && t('settings.updates.current', { version: APP_VERSION })}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const analyticsChoice = usePrivacyStore((s) => s.choice);
  const { t, lang, format } = useI18n();
  const prefs = useResolvedPrefs();
  const announce = useAnnounce();
  const store = useAppStore();
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('language');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const flash = useCallback(
    (message: string) => {
      setToast(message);
      announce(message, 'polite');
      window.setTimeout(() => setToast(null), 2600);
    },
    [announce]
  );

  // Deep links such as /settings#accessibility should land on the section, and
  // the in-page rail should follow scrolling.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as SectionId;
    if (!SECTION_IDS.includes(hash)) return;
    const id = window.setTimeout(() => {
      setActiveSection(hash);
      sectionRefs.current[hash]?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id as SectionId);
      },
      { rootMargin: '-96px 0px -60% 0px', threshold: [0.1, 0.4, 0.8] }
    );
    SECTION_IDS.forEach((id) => {
      const node = sectionRefs.current[id];
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  const detected = useMemo(() => detectLanguage(), []);
  const coverage = localeCoverage(lang);
  const saved = store.favorites.map((id) => findResource(id)).filter((r): r is (typeof RESOURCES)[number] => Boolean(r));

  const sectionTitle: Record<SectionId, TranslationKey> = {
    language: 'settings.section.locale',
    appearance: 'settings.section.appearance',
    homepage: 'settings.section.homepage',
    weather: 'settings.section.weather',
    accessibility: 'settings.section.accessibility',
    data: 'settings.section.data',
    permissions: 'settings.section.permissions',
    feeds: 'settings.section.feed',
    saved: 'settings.savedPlaces',
    privacy: 'settings.section.privacy',
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 0.84, 0.44, 1] }}
        className="space-y-6"
      >
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{t('settings.title')}</h1>
          <p className="max-w-2xl text-sm text-[var(--color-text-muted)]">{t('settings.description')}</p>
          <p className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent-green)]" aria-hidden="true" />
            {t('a11y.savedOnDevice')}
          </p>
        </header>

        <nav aria-label={t('settings.title')} className="sticky top-[var(--header-height)] z-20 -mx-4 overflow-x-auto bg-[color-mix(in_oklab,var(--color-bg-primary)_92%,transparent)] px-4 py-2 backdrop-blur-sm sm:mx-0 sm:px-0">
          <ul className="flex gap-1.5">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={activeSection === id ? 'true' : undefined}
                  onClick={() => sectionRefs.current[id]?.scrollIntoView({ block: 'start' })}
                  className={cn(
                    'whitespace-nowrap rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-heading font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                    activeSection === id
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  {t(sectionTitle[id])}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Language ─────────────────────────────────────────────── */}
        <Section id="language" title={t('settings.section.locale')} icon={<Languages className="w-4 h-4" aria-hidden="true" />} ref={(node) => (sectionRefs.current.language = node)}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUAGES.map((option) => {
              const active = option.code === lang;
              const optionCoverage = localeCoverage(option.code);
              return (
                <button
                  key={option.code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    store.setLanguage(option.code as LanguageCode);
                    flash(t('lang.changedTo', { name: option.nativeName }));
                  }}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-[var(--radius-md)] border p-3 text-start transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
                    active
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/8'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-raised)] hover:border-[var(--color-border-strong)]'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                      active ? 'border-[var(--color-accent-primary)]' : 'border-[var(--color-border-strong)]'
                    )}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span lang={option.contentLocale} dir={option.dir} className="block font-heading text-base font-semibold leading-tight">{option.nativeName}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">{spokenLanguage(option.name, t)}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--color-text-muted)]">
                      <span className="rounded-[var(--radius-pill)] border border-[var(--color-border)] px-1.5 font-mono">{option.code2}</span>
                      <span className="font-mono">{t('lang.coverageValue', { percent: optionCoverage.percent, total: TOTAL_KEYS })}</span>
                      {option.dir === 'rtl' && <span className="font-mono">RTL</span>}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('settings.languageDetected', { name: languageMeta(detected).nativeName })}
            </p>
            {detected !== lang && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  store.setLanguage(detected);
                  flash(t('lang.changedTo', { name: languageMeta(detected).nativeName }));
                }}
              >
                {t('settings.useDetected')}
              </Button>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('lang.note')}</p>
        </Section>

        {/* ── Appearance ───────────────────────────────────────────── */}
        <Section id="appearance" title={t('settings.section.appearance')} icon={<Sparkles className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.appearance = node; }}>
          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset>
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('settings.theme')}
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {(['light', 'dark', 'system'] as const).map((value) => {
                  const active = store.theme === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border px-2 py-2 text-center text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input
                        type="radio"
                        name="theme"
                        className="sr-only"
                        checked={active}
                        onChange={() => store.setTheme(value)}
                      />
                      {t(`theme.${value}` as TranslationKey)}
                      {value === 'system' && (
                        <span className="mt-0.5 block text-[10px] text-[var(--color-text-muted)]">
                          {prefs.dark ? t('theme.dark') : t('theme.light')}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="lg:col-span-2">
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('settings.palette')}
              </legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {PALETTES.map((value) => {
                  const active = store.palette === value;
                  const swLight = PALETTE_SWATCH[value].light;
                  const swDark = PALETTE_SWATCH[value].dark;
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border p-2 text-center text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input type="radio" name="palette" className="sr-only" checked={active} onChange={() => store.setPalette(value)} />
                      {/* Both halves at once: light left, dark right, accent pair as a gradient bar. */}
                      <span aria-hidden="true" className="mx-auto mb-1.5 flex h-9 w-full overflow-hidden rounded-md border border-black/10">
                        <span className="flex flex-1" style={{ background: swLight.bg }}>
                          <span className="m-1 flex-1 rounded-sm" style={{ background: swLight.card }} />
                          <span className="my-1 me-1 w-2.5 rounded-sm" style={{ background: `linear-gradient(180deg, ${swLight.accent}, ${swLight.accent2})` }} />
                        </span>
                        <span className="flex flex-1" style={{ background: swDark.bg }}>
                          <span className="m-1 flex-1 rounded-sm" style={{ background: swDark.card }} />
                          <span className="my-1 me-1 w-2.5 rounded-sm" style={{ background: `linear-gradient(180deg, ${swDark.accent}, ${swDark.accent2})` }} />
                        </span>
                      </span>
                      <span className="block truncate">{t(`settings.palette.${value}` as TranslationKey)}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-muted)]">{t('settings.paletteNote')}</p>
            </fieldset>

            <fieldset className="lg:col-span-2">
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('settings.surface')}
              </legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
                {SURFACES.map((value) => {
                  const active = store.surface === value;
                  const sw = PALETTE_SWATCH[store.palette][prefs.dark ? 'dark' : 'light'];
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border p-2 text-start text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input type="radio" name="surface" className="sr-only" checked={active} onChange={() => store.setSurface(value)} />
                      {/* The preview is the real backdrop photo with a panel
                          painted the way globals.css paints this style, in
                          the palette selected above. */}
                      <span
                        aria-hidden="true"
                        className="mb-1.5 block h-10 w-full overflow-hidden rounded-md border border-black/10 bg-cover bg-center"
                        style={{ backgroundImage: 'url(/img/dorchester-bay-sunset.jpg)' }}
                      >
                        <span className="m-1.5 block h-7 rounded-[5px] border border-white/30" style={surfacePreview(value, sw)} />
                      </span>
                      <span className="block font-semibold">{t(`settings.surface.${value}` as TranslationKey)}</span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-[var(--color-text-muted)]">{t(`settings.surfaceDesc.${value}` as TranslationKey)}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                {t('settings.surfaceStylesNote')}
                {prefs.highContrast && <> {t('settings.surfaceContrastNote')}</>}
              </p>
            </fieldset>

            <fieldset>
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('map.styleLabel')}
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {MAP_STYLES.map((value) => {
                  const active = store.mapStyle === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border px-2 py-2 text-center text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input type="radio" name="map-style" className="sr-only" checked={active} onChange={() => store.setMapStyle(value)} />
                      {t(`map.style.${value}` as TranslationKey)}
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                <MapIcon className="mt-0.5 w-3 h-3 shrink-0" aria-hidden="true" />
                {t('settings.mapSatelliteNote')}
              </p>
            </fieldset>
          </div>
        </Section>

        {/* ── Homepage layout ─────────────────────────────────────── */}
        <Section id="homepage" title={t('settings.section.homepage')} icon={<LayoutGrid className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.homepage = node; }}>
          <p className="mb-3 max-w-prose text-xs leading-relaxed text-[var(--color-text-muted)]">{t('settings.home.intro')}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            <fieldset>
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('settings.home.cardStyle')}
              </legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {HOME_CARD_STYLES.map((value) => {
                  const active = store.homeLayout.cardStyle === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border px-2 py-2 text-center text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input
                        type="radio"
                        name="home-card-style"
                        className="sr-only"
                        checked={active}
                        onChange={() => store.setHomeLayout({ ...store.homeLayout, cardStyle: value })}
                      />
                      {value === 'match' ? t('settings.home.cardStyle.match') : t(`settings.surface.${value}` as TranslationKey)}
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => store.resetHomeLayout()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t('settings.home.reset')}
              </button>
            </fieldset>

            <div>
              <p className="mb-2 text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{t('settings.section.homepage')}</p>
              <ol className="space-y-1">
                {store.homeLayout.order.map((id, index) => {
                  const hidden = store.homeLayout.hidden.includes(id);
                  const move = (dir: -1 | 1) => {
                    const order = [...store.homeLayout.order];
                    const j = index + dir;
                    if (j < 0 || j >= order.length) return;
                    [order[index], order[j]] = [order[j], order[index]];
                    store.setHomeLayout({ ...store.homeLayout, order });
                  };
                  return (
                    <li key={id} className={cn('flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1.5', hidden && 'opacity-55')}>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium">{t(HOME_SECTION_LABEL[id])}</span>
                        {id === 'weather' && !store.weatherEnabled && (
                          <span className="block text-[11px] leading-snug text-[var(--color-text-muted)]">{t('settings.home.weatherOffNote')}</span>
                        )}
                      </span>
                      <button type="button" onClick={() => move(-1)} disabled={index === 0} aria-label={`${t('settings.home.moveUp')}: ${t(HOME_SECTION_LABEL[id])}`} className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(1)} disabled={index === store.homeLayout.order.length - 1} aria-label={`${t('settings.home.moveDown')}: ${t(HOME_SECTION_LABEL[id])}`} className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!hidden}
                        aria-label={`${hidden ? t('settings.home.show') : t('settings.home.hide')}: ${t(HOME_SECTION_LABEL[id])}`}
                        onClick={() =>
                          store.setHomeLayout({
                            ...store.homeLayout,
                            hidden: hidden ? store.homeLayout.hidden.filter((h) => h !== id) : [...store.homeLayout.hidden, id],
                          })
                        }
                        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)]"
                      >
                        {hidden ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </Section>

        {/* ── Weather ──────────────────────────────────────────────── */}
        <Section id="weather" title={t('settings.section.weather')} icon={<CloudSun className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.weather = node; }}>
          <Toggle
            label={t('settings.weather.enable')}
            description={t('settings.weather.enableBody')}
            checked={store.weatherEnabled}
            onChange={(next) => store.setWeatherEnabled(next)}
          />
          {store.weatherEnabled && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{t('settings.weather.blocksTitle')}</p>
              <p className="mb-3 max-w-prose text-xs leading-relaxed text-[var(--color-text-muted)]">{t('settings.weather.blocksIntro')}</p>
              <ol className="space-y-1">
                {store.weatherLayout.order.map((id, index) => {
                  const hidden = store.weatherLayout.hidden.includes(id);
                  const move = (dir: -1 | 1) => {
                    const order = [...store.weatherLayout.order];
                    const j = index + dir;
                    if (j < 0 || j >= order.length) return;
                    [order[index], order[j]] = [order[j], order[index]];
                    store.setWeatherLayout({ ...store.weatherLayout, order });
                  };
                  return (
                    <li key={id} className={cn('flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-1.5', hidden && 'opacity-55')}>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">{t(WEATHER_BLOCK_LABEL[id])}</span>
                      <button type="button" onClick={() => move(-1)} disabled={index === 0} aria-label={`${t('settings.home.moveUp')}: ${t(WEATHER_BLOCK_LABEL[id])}`} className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(1)} disabled={index === store.weatherLayout.order.length - 1} aria-label={`${t('settings.home.moveDown')}: ${t(WEATHER_BLOCK_LABEL[id])}`} className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={!hidden}
                        aria-label={`${hidden ? t('settings.home.show') : t('settings.home.hide')}: ${t(WEATHER_BLOCK_LABEL[id])}`}
                        onClick={() =>
                          store.setWeatherLayout({
                            ...store.weatherLayout,
                            hidden: hidden ? store.weatherLayout.hidden.filter((h) => h !== id) : [...store.weatherLayout.hidden, id],
                          })
                        }
                        className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-[var(--color-bg-tertiary)]"
                      >
                        {hidden ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> : <Eye className="h-3.5 w-3.5" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                onClick={() => store.resetWeatherLayout()}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t('settings.weather.reset')}
              </button>
            </div>
          )}
        </Section>

        {/* ── Accessibility ────────────────────────────────────────── */}
        <Section id="accessibility" title={t('settings.section.accessibility')} icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.accessibility = node; }}>
          <h3 className="mb-2 text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{t('a11y.section.vision')}</h3>

          <fieldset className="mb-4">
            <legend className="mb-2 block text-xs font-heading font-semibold">{t('a11y.fontSize')}</legend>
            <p className="mb-2 text-xs text-[var(--color-text-muted)]">{t('a11y.fontSizeDesc')}</p>
            <div className="flex flex-wrap items-end gap-2">
              {SIZES.map((size) => {
                const active = store.fontSize === size;
                return (
                  <label
                    key={size}
                    className={cn(
                      'relative cursor-pointer rounded-[var(--radius-md)] border px-3 py-2 transition-colors',
                      'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                      active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                  >
                    <input type="radio" name="font-size" className="sr-only" checked={active} onChange={() => store.setFontSize(size)} />
                    <span className="block font-body leading-none text-[var(--color-text-primary)]" style={{ fontSize: `calc(14px * ${size === 'small' ? 0.94 : size === 'large' ? 1.15 : size === 'extra-large' ? 1.3 : 1})` }}>
                      Aa
                    </span>
                    <span className="mt-1 block text-[10px] text-[var(--color-text-muted)]">{t(SIZE_KEY[size])}</span>
                  </label>
                );
              })}
              <div className="ms-auto flex items-center gap-1 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0.5">
                <button
                  type="button"
                  aria-label={`${t('a11y.fontSize')}: ${t('size.small')}`}
                  onClick={() => store.setFontSize(SIZES[Math.max(0, SIZES.indexOf(store.fontSize) - 1)])}
                  className="rounded-[var(--radius-pill)] p-1.5 hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`${t('a11y.fontSize')}: ${t('size.extraLarge')}`}
                  onClick={() => store.setFontSize(SIZES[Math.min(SIZES.length - 1, SIZES.indexOf(store.fontSize) + 1)])}
                  className="rounded-[var(--radius-pill)] p-1.5 hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </fieldset>

          <div className="grid gap-2 lg:grid-cols-2">
            <StatusPicker
              name="reduce-motion"
              label={t('a11y.reduceMotion')}
              hint={t('a11y.reduceMotionDesc')}
              value={store.accessibility.reduceMotion}
              onChange={(value) => store.setAccessibility('reduceMotion', value)}
              options={[
                { value: 'auto', label: t('common.auto') },
                { value: 'on', label: t('common.on') },
                { value: 'off', label: t('common.off') },
              ]}
            />
            <StatusPicker
              name="high-contrast"
              label={t('a11y.highContrast')}
              hint={t('a11y.highContrastDesc')}
              value={store.accessibility.highContrast}
              onChange={(value) => store.setAccessibility('highContrast', value)}
              options={[
                { value: 'auto', label: t('common.auto') },
                { value: 'on', label: t('common.on') },
                { value: 'off', label: t('common.off') },
              ]}
            />
            <p className="lg:col-span-2 text-[11px] text-[var(--color-text-muted)]">
              {(prefs.detected.reduceMotion || prefs.detected.highContrast) && (
                <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/10 px-2 py-0.5 text-[var(--color-accent-green)]">
                  <Check className="w-3 h-3" aria-hidden="true" />
                  {t('a11y.systemDetected')}
                </span>
              )}
              <span className="ms-2">{t('a11y.conformance')}</span>
            </p>

            <Toggle
              label={t('a11y.underlineLinks')}
              description={t('a11y.underlineLinksDesc')}
              checked={store.accessibility.underlineLinks}
              onChange={(next) => store.setAccessibility('underlineLinks', next)}
            />
            <Toggle
              label={t('a11y.largeFocus')}
              description={t('a11y.largeFocusDesc')}
              checked={store.accessibility.largeFocus}
              onChange={(next) => store.setAccessibility('largeFocus', next)}
            />
            <Toggle
              label={t('a11y.dyslexiaFont')}
              description={t('a11y.dyslexiaFontDesc')}
              checked={store.accessibility.legibleFont}
              onChange={(next) => store.setAccessibility('legibleFont', next)}
            />
            <Toggle
              label={t('a11y.textSpacing')}
              description={t('a11y.textSpacingDesc')}
              checked={store.accessibility.textSpacing}
              onChange={(next) => store.setAccessibility('textSpacing', next)}
            />
            <Toggle
              label={t('a11y.announceUpdates')}
              description={t('a11y.announceUpdatesDesc')}
              checked={store.accessibility.announceUpdates}
              onChange={(next) => store.setAccessibility('announceUpdates', next)}
            />
          </div>

          <SpeechControls />

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/privacy#accessibility"
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-heading font-medium hover:bg-[var(--color-bg-tertiary)]"
            >
              {t('a11y.statement')}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-3 py-1.5">
              <ReportProblem />
            </span>
          </div>
        </Section>

        {/* ── Data and updates ─────────────────────────────────────── */}
        <Section id="data" title={t('settings.section.data')} icon={<Database className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.data = node; }}>
          <div className="grid gap-2 lg:grid-cols-2">
            <Toggle
              label={t('settings.autoRefresh')}
              description={t('settings.refreshHint')}
              checked={store.autoRefresh}
              onChange={(next) => store.setAutoRefresh(next)}
            />
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-4 py-3">
              <label htmlFor="refresh-interval" className="font-heading text-sm font-semibold">
                {t('settings.refreshInterval')}
              </label>
              <select
                id="refresh-interval"
                value={store.refreshIntervalMinutes}
                onChange={(event) => store.setRefreshIntervalMinutes(Number(event.target.value))}
                disabled={!store.autoRefresh}
                className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-sm disabled:opacity-50"
              >
                {REFRESH_CHOICES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {t('settings.minutesValue', { count: minutes })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
            <BellRing className="w-4 h-4 shrink-0 text-[var(--color-accent-primary)]" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-xs text-[var(--color-text-secondary)]">
              <span className="font-heading font-semibold text-[var(--color-text-primary)]">{t('settings.lastUpdated')}: </span>
              {store.lastUpdated ? format.relative(store.lastUpdated) : t('settings.lastUpdatedNever')}
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                store.refreshAllData();
                flash(t('settings.refreshed'));
              }}
            >
              {t('settings.refreshNow')}
            </Button>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t('settings.followedLines')}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {TRANSIT_FEEDS.map((feed) => {
                const active = store.enabledTransitFeeds.includes(feed.id);
                return (
                  <button
                    key={feed.id}
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() =>
                      store.setEnabledTransitFeeds(
                        active ? store.enabledTransitFeeds.filter((id) => id !== feed.id) : [...store.enabledTransitFeeds, feed.id]
                      )
                    }
                    className={cn(
                      'rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-heading transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                      active
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                    )}
                    title={`${t(`feed.transit.${feed.id}` as never)} · ${feed.endpoint}`}
                  >
                    {t(`feed.transitName.${feed.id}` as never)}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
            <h3 className="flex items-center gap-2 font-heading text-sm font-semibold">
              <RefreshCw className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
              {t('settings.updates.title')} · <span className="font-mono text-xs">{t('settings.version', { version: APP_VERSION })}</span>
            </h3>
            <p className="mt-1 max-w-prose text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('settings.updates.body')}</p>
            <UpdateChecker />
          </div>
        </Section>

        {/* ── Permissions & alerts ──────────────────────────────────── */}
        <Section id="permissions" title={t('settings.section.permissions')} icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.permissions = node; }}>
          <PermissionSetup />
        </Section>

        {/* ── Feeds ────────────────────────────────────────────────── */}
        <Section id="feeds" title={t('settings.section.feed')} icon={<Rss className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.feeds = node; }}>
          <h3 className="mb-2 text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{t('settings.newsSources')}</h3>
          <ul className="space-y-1.5">
            {NEWS_FEEDS.map((feed) => {
              const enabled = store.enabledNewsSources.length === 0 ? feed.enabledByDefault : store.enabledNewsSources.includes(feed.id);
              return (
                <li key={feed.id}>
                  <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-semibold">{feed.name}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
                        {t(`feed.news.${feed.id}` as never)}
                      </p>
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block truncate font-mono text-[10px] text-[var(--color-accent-primary-soft)] hover:underline"
                        aria-label={`${t('common.source')}: ${feed.url}`}
                      >
                        {feed.url}
                      </a>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`${feed.name}: ${t('settings.newsSources')}`}
                      onClick={() => {
                        const base = store.enabledNewsSources.length === 0 ? NEWS_FEEDS.filter((f) => f.enabledByDefault).map((f) => f.id) : store.enabledNewsSources;
                        store.setEnabledNewsSources(enabled ? base.filter((id) => id !== feed.id) : [...new Set([...base, feed.id])]);
                      }}
                      className={cn(
                        'relative h-6 w-11 shrink-0 rounded-full border transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
                        enabled ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]' : 'border-[var(--color-border-strong)] bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <motion.span layout className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-[var(--shadow-sm)]', enabled ? 'right-0.5' : 'left-0.5')} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <CustomFeeds onFlash={flash} />
        </Section>

        {/* ── Saved places ─────────────────────────────────────────── */}
        <Section id="saved" title={t('settings.savedPlaces')} icon={<Share2 className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.saved = node; }}>
          {saved.length === 0 ? (
            <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-4 text-sm text-[var(--color-text-muted)]">
              {t('settings.savedPlacesEmpty')}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {saved.map((record) => (
                <li key={record.id}>
                  <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-sm font-semibold">{record.name}</p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">{record.neighborhood}</p>
                      <Link href={record.detailHref ?? '/resources'} className="mt-1 inline-flex items-center gap-1 text-xs font-heading text-[var(--color-accent-primary)] hover:underline">
                        {t('common.moreInfo')}
                        <ArrowRight className="w-3 h-3 rtl:rotate-180" aria-hidden="true" />
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        store.toggleFavorite(record.id);
                        flash(t('common.remove'));
                      }}
                      aria-label={`${t('common.remove')} ${record.name}`}
                      className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* ── Privacy ──────────────────────────────────────────────── */}
        <Section id="privacy" title={t('settings.section.privacy')} icon={<ShieldCheck className="w-4 h-4" aria-hidden="true" />} ref={(node) => { sectionRefs.current.privacy = node; }}>
          <h3 className="font-heading text-sm font-semibold">{t('settings.privacyTitle')}</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-text-secondary)]">
            {(['settings.searchRequests', 'settings.localOnly', 'settings.analyticsPossible', 'settings.noAccount'] as TranslationKey[]).map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Check className="mt-0.5 w-4 h-4 shrink-0 text-[var(--color-accent-green)]" aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <Toggle
              label={t('consent.settingsLabel')}
              description={t('consent.settingsBody')}
              checked={analyticsChoice === 'allow'}
              onChange={(allow) => usePrivacyStore.getState().choose(allow ? 'allow' : 'decline')}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/about"
              className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm font-heading font-medium hover:border-[var(--color-border-strong)]"
            >
              {t('settings.viewSources')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
            <DangerButton
              label={t('settings.clear')}
              confirmLabel={t('settings.clearConfirm')}
              onConfirm={() => {
                store.resetAll();
                usePrivacyStore.getState().choose('unset');
                flash(t('settings.cleared'));
              }}
            />
          </div>
        </Section>

        <p className="pb-2 text-center text-[11px] text-[var(--color-text-muted)]">
          {t('settings.version', { version: APP_VERSION })} · {t('dashboard.footer.line1')}
        </p>
      </motion.div>

      {/* Confirmation toast, announced through the live region above. */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{ opacity: toast ? 1 : 0, y: toast ? 0 : 12 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'pointer-events-none fixed bottom-5 left-1/2 z-[95] -translate-x-1/2 rounded-[var(--radius-pill)]',
          'bg-[var(--color-accent-primary)] px-4 py-2 text-sm font-heading font-medium text-white shadow-[var(--shadow-lg)]',
          !toast && 'hidden'
        )}
      >
        {toast}
      </motion.div>
    </MainLayout>
  );
}

/* ------------------------------------------------------------------ parts -- */

function Section({
  id,
  title,
  icon,
  children,
  ref,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  ref: (node: HTMLElement | null) => void;
}) {
  return (
    <section id={id} ref={ref} className="scroll-mt-[calc(var(--header-height)+4rem)]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="text-[var(--color-accent-primary)]">{icon}</span>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function SpeechControls() {
  const { t, format } = useI18n();
  const store = useAppStore();
  const speech = useSpeechAvailability();

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
      <h3 className="flex items-center gap-2 font-heading text-sm font-semibold">
        <Gauge className="w-4 h-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
        {t('a11y.section.reading')}
      </h3>
      {!speech.supported ? (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t('a11y.readAloudUnavailable')}</p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <div>
            <label htmlFor="speech-rate" className="mb-1 block text-xs font-heading font-semibold">
              {t('a11y.speechRate')} · {store.speechRate.toFixed(2)}×
            </label>
            <input
              id="speech-rate"
              type="range"
              min={0.6}
              max={1.75}
              step={0.05}
              value={store.speechRate}
              onChange={(event) => store.setSpeechRate(Number(event.target.value))}
              className="w-full accent-[var(--color-accent-primary)]"
            />
          </div>
          <div>
            <label htmlFor="speech-voice" className="mb-1 block text-xs font-heading font-semibold">
              {t('a11y.speechVoice')}
            </label>
            <select
              id="speech-voice"
              value={store.speechVoiceURI ?? ''}
              onChange={(event) => store.setSpeechVoiceURI(event.target.value || null)}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] px-2.5 py-2 text-sm"
            >
              <option value="">{t('a11y.speechDefault')}</option>
              {speech.voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} · {voice.lang}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
              {speech.voices.length === 0 ? t('a11y.noMatchingVoice') : format.number(speech.voices.length) + ' ' + t('a11y.speechVoice')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function useSpeechAvailability() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const lang = useAppStore((s) => s.language);
  const supported = useSpeechSupported();

  useEffect(() => {
    if (!supported) return;
    const read = () => {
      const prefix = lang.toLowerCase();
      const all = window.speechSynthesis.getVoices();
      const matching = all.filter((voice) => speechVoiceMatches(prefix, voice.lang));
      setVoices(matching);
    };
    read();
    window.speechSynthesis.addEventListener('voiceschanged', read);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', read);
  }, [supported, lang]);

  return { supported, voices };
}

function CustomFeeds({ onFlash }: { onFlash: (message: string) => void }) {
  const { t } = useI18n();
  const store = useAppStore();
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      setError(t('settings.customFeedInvalid'));
      return;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      setError(t('settings.customFeedInvalid'));
      return;
    }
    if (store.customFeeds.some((feed) => feed.url === parsed.toString())) {
      setError(t('settings.customFeedExists'));
      return;
    }
    store.addCustomFeed({
      id: `custom-${Date.now().toString(36)}`,
      url: parsed.toString(),
      label: (label.trim() || parsed.hostname).slice(0, 60),
    });
    setUrl('');
    setLabel('');
    onFlash(t('common.saved'));
  }

  return (
    <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
      <h3 className="font-heading text-sm font-semibold">{t('settings.addCustom')}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label htmlFor="feed-url" className="sr-only">
              {t('settings.customFeedUrl')}
            </label>
            <input
              id="feed-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              inputMode="url"
              placeholder="https://example.org/news/rss.xml"
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="feed-label" className="sr-only">
              {t('settings.customFeedLabel')}
            </label>
            <input
              id="feed-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t('site.name')}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-2 text-sm"
            />
          </div>
        </div>
        <Button variant="primary" onClick={add}>
          {t('settings.customFeedAdd')}
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[var(--color-accent-secondary)]">
          {error}
        </p>
      )}

      {store.customFeeds.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {store.customFeeds.map((feed) => (
            <li key={feed.id} className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-secondary)] px-2.5 py-1.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-heading text-xs font-semibold">{feed.label}</span>
                <span className="block truncate font-mono text-[10px] text-[var(--color-text-muted)]">{feed.url}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  store.removeCustomFeed(feed.id);
                  onFlash(t('common.remove'));
                }}
                aria-label={`${t('settings.removeFeed')}: ${feed.label}`}
                className="rounded-[var(--radius-sm)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-accent-secondary)]"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DangerButton({ label, confirmLabel, onConfirm }: { label: string; confirmLabel: string; onConfirm: () => void }) {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 6000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-accent-secondary)]/40 bg-[var(--color-accent-secondary)]/5 p-3">
      <h3 className="font-heading text-sm font-semibold text-[var(--color-accent-secondary)]">{t('settings.clearTitle')}</h3>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t('settings.localOnly')}</p>
      <button
        type="button"
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          setArmed(false);
          onConfirm();
        }}
        className={cn(
          'mt-2 w-full rounded-[var(--radius-sm)] px-3 py-2 text-sm font-heading font-semibold transition-colors',
          armed ? 'bg-[var(--color-accent-secondary)] text-white' : 'border border-[var(--color-accent-secondary)]/50 text-[var(--color-accent-secondary)] hover:bg-[var(--color-accent-secondary)]/10'
        )}
      >
        {armed ? confirmLabel : label}
      </button>
    </div>
  );
}
