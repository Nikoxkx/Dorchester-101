'use client';

import { useAppStore, FONT_SIZE_VALUES, type FontSize, type Language, type Theme } from '@/stores/appStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { availableLanguages, useTranslation, localeFor } from '@/lib/i18n';
import { GlassButton, GlassSegmented, GlassSwitch } from '@/components/glass/GlassControls';
import { GlassMenu } from '@/components/glass/GlassMenu';
import { useSavedSheet } from '@/stores/uiStore';
import { useToast } from '@/stores/toastStore';
import { useLiveApi } from '@/hooks/useLiveApi';
import { Globe, Heart, Monitor, Moon, ShieldCheck, Sun, Database, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <MainLayout>
      <SettingsView />
    </MainLayout>
  );
}

function SettingsView() {
  const store = useAppStore();
  const { t, formatFor } = useTranslation(store.language);
  const toast = useToast();
  const openSaved = useSavedSheet((s) => s.setOpen);
  const { data: health, reload } = useLiveApi<{ lastReviewed?: string; timestamp?: string }>('/api/health', {
    channels: ['data'],
  });

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('settings.light'), icon: <Sun className="w-4 h-4" aria-hidden /> },
    { value: 'dark', label: t('settings.dark'), icon: <Moon className="w-4 h-4" aria-hidden /> },
    { value: 'system', label: t('settings.system'), icon: <Monitor className="w-4 h-4" aria-hidden /> },
  ];
  const currentTheme = themeOptions.find((o) => o.value === store.theme);

  const fontOptions: { value: FontSize; label: string }[] = [
    { value: 'small', label: t('settings.small') },
    { value: 'medium', label: t('settings.medium') },
    { value: 'large', label: t('settings.large') },
    { value: 'extra-large', label: t('settings.extraLarge') },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('settings.title')}</h1>
        <p className="text-subhead text-text-2 mt-1.5">{t('settings.description')}</p>
      </header>

      {/* Language */}
      <section aria-label={t('settings.language')} className="content-card squircle p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-subhead font-bold text-1 flex items-center gap-2">
              <Globe className="w-4 h-4 text-text-2" strokeWidth={2} aria-hidden />
              {t('settings.language')}
            </h2>
            <p className="text-caption text-text-2 mt-0.5">{t('settings.selectLang')}</p>
          </div>
          <GlassMenu
            label={t('settings.language')}
            value={store.language}
            onChange={(v) => {
              store.setLanguage(v as Language);
              toast(t('common.saved'), 'success');
            }}
            options={availableLanguages.map((l) => ({
              value: l.code,
              label: l.nativeName,
              hint: l.name,
            }))}
            triggerClassName="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85"
            trigger={<span className="min-w-20">{availableLanguages.find((l) => l.code === store.language)?.nativeName}</span>}
            width="w-64"
          />
        </div>
      </section>

      {/* Appearance */}
      <section aria-label={t('settings.appearance')} className="content-card squircle p-5">
        <h2 className="text-subhead font-bold text-1">{t('settings.appearance')}</h2>

        <div className="flex items-center justify-between gap-4 mt-4 flex-wrap">
          <p className="text-footnote font-semibold text-text-2">{t('settings.theme')}</p>
          <GlassMenu
            label={t('settings.theme')}
            value={store.theme}
            onChange={(v) => {
              store.setTheme(v as Theme);
              toast(t('common.saved'), 'success');
            }}
            options={themeOptions.map((o) => ({ value: o.value, label: o.label }))}
            triggerClassName="inline-flex items-center gap-2 h-10 px-4 rounded-full glass glass-clear glass-edge text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
            trigger={
              <span className="inline-flex items-center gap-2">
                {currentTheme?.icon}
                {currentTheme?.label}
              </span>
            }
            width="w-44"
          />
        </div>

        <div className="flex items-center justify-between gap-4 mt-5 flex-wrap">
          <div>
            <p className="text-footnote font-semibold text-text-2">{t('settings.fontSize')}</p>
            <p className="text-caption2 text-text-3 mt-0.5">{t('settings.fontSizeHint')}</p>
          </div>
          <GlassSegmented<FontSize>
            ariaLabel={t('settings.fontSize')}
            value={store.fontSize}
            onChange={(v) => {
              store.setFontSize(v);
            }}
            options={fontOptions}
          />
        </div>
      </section>

      {/* Accessibility */}
      <section aria-label={t('settings.accessibility')} className="content-card squircle p-5">
        <h2 className="text-subhead font-bold text-1">{t('settings.accessibility')}</h2>
        <div className="flex items-center justify-between gap-4 mt-4">
          <div>
            <p className="text-footnote font-semibold text-1">{t('settings.reduceMotion')}</p>
            <p className="text-caption text-text-2 mt-0.5">{t('settings.reduceMotionDesc')}</p>
          </div>
          <GlassSwitch
            label={t('settings.reduceMotion')}
            checked={store.reduceMotion}
            onChange={(v) => store.setReduceMotion(v)}
          />
        </div>
        <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-separator">
          <div>
            <p className="text-footnote font-semibold text-1">{t('settings.reduceTransparency')}</p>
            <p className="text-caption text-text-2 mt-0.5">{t('settings.reduceTransparencyDesc')}</p>
          </div>
          <GlassSwitch
            label={t('settings.reduceTransparency')}
            checked={store.reduceTransparency}
            onChange={(v) => store.setReduceTransparency(v)}
          />
        </div>
      </section>

      {/* Saved items */}
      <section aria-label={t('saved.title')} className="content-card squircle p-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-subhead font-bold text-1 flex items-center gap-2">
              <Heart className="w-4 h-4 text-text-2" strokeWidth={2} aria-hidden />
              {t('saved.title')}
            </h2>
            <p className="text-caption text-text-2 mt-0.5 num">
              {t('settings.savedCount', { n: store.favorites.length })}
            </p>
          </div>
          <GlassButton size="sm" onClick={() => openSaved(true)}>{t('common.viewDetails')}</GlassButton>
        </div>
      </section>

      {/* Data */}
      <section aria-label={t('settings.data')} className="content-card squircle p-5">
        <h2 className="text-subhead font-bold text-1 flex items-center gap-2">
          <Database className="w-4 h-4 text-text-2" strokeWidth={2} aria-hidden />
          {t('settings.data')}
        </h2>
        <div className="flex items-center justify-between gap-4 mt-3 flex-wrap">
          <p className="text-caption text-text-2">
            {t('settings.lastUpdated')}:{' '}
            <span className="font-semibold text-1 num">
              {health?.timestamp ? formatFor.date(health.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </span>
          </p>
          <GlassButton
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('refreshData'));
              void reload();
              toast(t('common.updated'), 'success');
            }}
            icon={<RefreshCw className="w-4 h-4" aria-hidden />}
          >
            {t('settings.refreshNow')}
          </GlassButton>
        </div>
        <p className="text-caption2 text-text-3 mt-2">
          {t('common.source')}: HUD · MBTA · BPDA · BHA · {t('common.lastVerified')} {health?.lastReviewed ?? '—'} ({localeFor(store.language)})
        </p>
      </section>

      {/* Privacy */}
      <section aria-label={t('settings.privacy')} className="content-card squircle p-5">
        <h2 className="text-subhead font-bold text-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-success" strokeWidth={2} aria-hidden />
          {t('settings.privacyTitle')}
        </h2>
        <ul className="mt-3 space-y-1.5">
          {[t('settings.noDataCollected'), t('settings.localOnly'), t('settings.noTracking'), t('settings.noAccount')].map((line) => (
            <li key={line} className="text-footnote text-text-2 flex items-start gap-2">
              <span aria-hidden className="dot dot-open mt-1.5 shrink-0" />
              {line}
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4 flex-wrap">
          <GlassButton
            size="sm"
            onClick={() => {
              if (window.confirm(t('settings.resetConfirm'))) {
                localStorage.removeItem('dor101-settings');
                localStorage.removeItem('dor101-read-notifications');
                location.reload();
              }
            }}
          >
            {t('settings.resetPrefs')}
          </GlassButton>
        </div>
      </section>

      {/* About */}
      <section aria-label={t('settings.about')} className="content-card squircle p-5">
        <h2 className="text-subhead font-bold text-1">{t('settings.about')}</h2>
        <p className="text-caption text-text-2 mt-2 leading-relaxed">{t('settings.aboutDesc')}</p>
        <p className="text-caption2 text-text-3 mt-3">
          {t('settings.version')} · MIT ·{' '}
          <a
            href="https://github.com/Nikoxkx/Dorchester-101"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-1"
          >
            {t('footer.source')}
          </a>
        </p>
        <p className={cn('text-caption2 text-text-3 mt-1')}>Liquid Glass design system · 9 languages · WCAG 2.2 AA</p>
      </section>
    </div>
  );
}
