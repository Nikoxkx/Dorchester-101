'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore, FONT_SIZE_VALUES, type FontSize, type Language, type Theme } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { Check, Info, Moon, ShieldCheck, Sun, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEMES: Theme[] = ['light', 'dark', 'system'];
const SIZES: { id: FontSize; label: string }[] = [
  { id: 'small', label: 'A' },
  { id: 'medium', label: 'A' },
  { id: 'large', label: 'A+' },
  { id: 'extra-large', label: 'A++' },
];

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion } = useAppStore();
  const { t } = useTranslation(language);

  const clearPrefs = () => {
    try {
      localStorage.removeItem('dor101-settings');
      localStorage.removeItem('dor101-read-notifications');
      localStorage.removeItem('dor101-news-saved');
      localStorage.removeItem('dor101-doc-checklist');
      localStorage.removeItem('dor101-map-style');
      localStorage.removeItem('dor101-install-dismissed');
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="pb-6 border-b border-[var(--line)]">
          <p className="kicker mb-3">This device only</p>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.25rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">{t('settings.title')}</h1>
          <p className="text-[var(--ink-soft)] mt-4 max-w-2xl leading-relaxed">
            {t('settings.description')} Nothing here is uploaded — preferences live in this
            browser&apos;s local storage and leave with it.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-5 items-start">
          <section className="desk-card p-5">
            <h2 className="font-display text-xl font-extrabold mb-1">{t('settings.language')}</h2>
            <p className="text-xs text-[var(--muted)] mb-4">{t('settings.selectLang')}</p>
            <div className="flex flex-wrap gap-2">
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code as Language)}
                  aria-pressed={language === l.code}
                  className={cn(
                    'px-3.5 py-2 text-sm rounded-full border transition-colors',
                    language === l.code
                      ? 'bg-[var(--charcoal)] text-[var(--paper)] border-[var(--charcoal)] font-bold'
                      : 'border-[var(--line)] hover:border-[var(--ink-soft)] bg-[var(--paper)]',
                  )}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-4">Arabic switches the whole desk to right-to-left. Other languages fall back to English where a phrase hasn&apos;t been translated yet.</p>
          </section>

          <section className="desk-card p-5">
            <h2 className="font-display text-xl font-extrabold mb-1">{t('settings.theme')}</h2>
            <p className="text-xs text-[var(--muted)] mb-4">Paper, pine, and transit red — in light or dark.</p>
            <div className="flex gap-2">
              {THEMES.map((th) => (
                <button
                  key={th}
                  onClick={() => setTheme(th)}
                  aria-pressed={theme === th}
                  className={cn(
                    'px-3.5 py-2 text-sm rounded-full border flex items-center gap-1.5 transition-colors',
                    theme === th
                      ? 'bg-[var(--charcoal)] text-[var(--paper)] border-[var(--charcoal)] font-bold'
                      : 'border-[var(--line)] hover:border-[var(--ink-soft)] bg-[var(--paper)]',
                  )}
                >
                  {th === 'dark' ? <Moon className="w-3.5 h-3.5" /> : th === 'light' ? <Sun className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                  {t(`settings.${th}`)}
                </button>
              ))}
            </div>

            <h2 className="font-display text-xl font-extrabold mt-6 mb-1">{t('settings.fontSize')}</h2>
            <p className="text-xs text-[var(--muted)] mb-4">Make the desk easier to read.</p>
            <div className="flex gap-2 items-center">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setFontSize(s.id)}
                  aria-pressed={fontSize === s.id}
                  className={cn(
                    'px-4 py-2 rounded-full border font-display font-bold transition-colors',
                    fontSize === s.id
                      ? 'bg-[var(--charcoal)] text-[var(--paper)] border-[var(--charcoal)]'
                      : 'border-[var(--line)] hover:border-[var(--ink-soft)] bg-[var(--paper)]',
                  )}
                  style={{ fontSize: FONT_SIZE_VALUES[s.id] }}
                  aria-label={s.id.replace('-', ' ')}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <label className="flex items-start gap-3 mt-6 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 accent-[var(--red)]"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                aria-label={t('settings.reduceMotion')}
              />
              <span>
                <span className="font-bold text-sm block">{t('settings.reduceMotion')}</span>
                <span className="text-xs text-[var(--muted)]">{t('settings.reduceMotionDesc')}</span>
              </span>
            </label>
          </section>

          <section className="desk-card p-5">
            <h2 className="font-display text-xl font-extrabold mb-3">{t('settings.privacyTitle')}</h2>
            <ul className="space-y-2.5 text-sm text-[var(--ink)]">
              <li className="flex items-start gap-2.5"><ShieldCheck className="w-4 h-4 text-[var(--sage)] mt-0.5 shrink-0" />{t('settings.noDataCollected')}</li>
              <li className="flex items-start gap-2.5"><ShieldCheck className="w-4 h-4 text-[var(--sage)] mt-0.5 shrink-0" />{t('settings.localOnly')}</li>
              <li className="flex items-start gap-2.5"><ShieldCheck className="w-4 h-4 text-[var(--sage)] mt-0.5 shrink-0" />{t('settings.noTracking')}</li>
              <li className="flex items-start gap-2.5"><ShieldCheck className="w-4 h-4 text-[var(--sage)] mt-0.5 shrink-0" />{t('settings.noAccount')}</li>
            </ul>
            <button
              onClick={clearPrefs}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline underline-offset-2 text-[var(--red)] hover:text-[var(--red-dark)]"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t('settings.resetPrefs')}
            </button>
          </section>

          <section className="desk-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-xl font-extrabold">{t('settings.about')}</h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">v2.0.0</span>
            </div>
            <p className="text-sm text-[var(--ink-soft)] leading-relaxed">{t('settings.aboutDesc')}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href="/resources" className="cta cta-outline cta-sm">Data sources</a>
              <a href="https://github.com/Nikoxkx/Dorchester-101" target="_blank" rel="noreferrer" className="cta cta-outline cta-sm">Open source</a>
            </div>
            <p className="mt-4 text-[11px] text-[var(--muted)] flex items-center gap-1.5"><Check className="w-3 h-3 text-[var(--sage)]" /> Last checked: Sept 6, 2026 — HUD FY2026, MBTA fares, SNAP, RAFT.</p>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
