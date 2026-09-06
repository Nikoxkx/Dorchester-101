'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
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
import { useAppStore, type FontSize, type MapStyle } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';
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

const SECTION_IDS = ['language', 'appearance', 'accessibility', 'data', 'feeds', 'saved', 'privacy'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SIZES: FontSize[] = ['small', 'medium', 'large', 'extra-large'];
const SIZE_KEY: Record<FontSize, TranslationKey> = {
  small: 'size.small',
  medium: 'size.medium',
  large: 'size.large',
  'extra-large': 'size.extraLarge',
};
const MAP_STYLES: MapStyle[] = ['satellite', 'street', 'hybrid'];
const REFRESH_CHOICES = [1, 2, 5, 10, 15, 30, 60];

export default function SettingsPage() {
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
    if (SECTION_IDS.includes(hash)) {
      setActiveSection(hash);
      window.setTimeout(() => sectionRefs.current[hash]?.scrollIntoView({ block: 'start' }), 60);
    }
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
    accessibility: 'settings.section.accessibility',
    data: 'settings.section.data',
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
                  lang={option.intlLocale}
                  dir={option.dir}
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
                    <span className="block font-heading text-base font-semibold leading-tight">{option.nativeName}</span>
                    <span className="block text-xs text-[var(--color-text-muted)]">{option.name}</span>
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

            <fieldset>
              <legend className="mb-2 block text-xs font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                {t('settings.surface')}
              </legend>
              <div className="grid grid-cols-2 gap-1.5">
                {(['solid', 'glass'] as const).map((value) => {
                  const active = store.surface === value;
                  return (
                    <label
                      key={value}
                      className={cn(
                        'relative cursor-pointer rounded-[var(--radius-md)] border px-2 py-2 text-center text-xs font-heading transition-colors',
                        'focus-within:ring-2 focus-within:ring-[var(--color-accent-primary)]',
                        active ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-tertiary)]'
                      )}
                    >
                      <input type="radio" name="surface" className="sr-only" checked={active} onChange={() => store.setSurface(value)} />
                      <span className="flex items-center justify-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'inline-block h-3.5 w-3.5 rounded-[3px] border border-[var(--color-border-strong)]',
                            value === 'glass' ? 'bg-[linear-gradient(135deg,rgba(20,48,79,0.55),rgba(166,54,42,0.35))] opacity-70' : 'bg-[var(--color-accent-primary)]'
                          )}
                        />
                        {t(`settings.surface.${value}` as TranslationKey)}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                {t('settings.surfaceNote')} {t('settings.surfaceHint')}
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
            {(['settings.noDataCollected', 'settings.localOnly', 'settings.noTracking', 'settings.noAccount'] as TranslationKey[]).map((key) => (
              <li key={key} className="flex items-start gap-2">
                <Check className="mt-0.5 w-4 h-4 shrink-0 text-[var(--color-accent-green)]" aria-hidden="true" />
                {t(key)}
              </li>
            ))}
          </ul>

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
              {speech.voices.length === 0 ? t('settings.detectedNone') : format.number(speech.voices.length) + ' ' + t('a11y.speechVoice')}
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
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!supported) return;
    const read = () => {
      const prefix = lang === 'kea' ? 'pt' : lang === 'ht' ? 'fr' : lang;
      const all = window.speechSynthesis.getVoices();
      const matching = all.filter((voice) => voice.lang.toLowerCase().replace('_', '-').startsWith(prefix));
      setVoices(matching.length ? matching : all.slice(0, 12));
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
