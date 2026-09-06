'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore, FONT_SIZE_VALUES, type FontSize, type Language, type Theme } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';

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
      <div className="max-w-xl space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">This device</p>
          <h1 className="font-display text-4xl">{t('settings.title')}</h1>
          <p className="text-[var(--muted)] mt-2">{t('settings.description')}</p>
        </header>

        <section>
          <h2 className="font-display text-xl mb-3">{t('settings.language')}</h2>
          <p className="text-xs text-[var(--muted)] mb-2">{t('settings.selectLang')}</p>
          <div className="flex flex-wrap gap-2">
            {availableLanguages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code as Language)}
                className={`px-3 py-2 text-sm border ${language === l.code ? 'bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--ink)]'}`}
              >
                {l.nativeName}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">{t('settings.theme')}</h2>
          <div className="flex gap-2">
            {THEMES.map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={`px-3 py-2 text-sm border capitalize ${theme === th ? 'bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--ink)]'}`}
              >
                {t(`settings.${th}`)}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">{t('settings.fontSize')}</h2>
          <div className="flex gap-2 items-end">
            {SIZES.map((s) => (
              <button
                key={s.id}
                onClick={() => setFontSize(s.id)}
                className={`px-3 py-2 border ${fontSize === s.id ? 'bg-[var(--ink)] text-[var(--paper)]' : 'border-[var(--ink)]'}`}
                style={{ fontSize: FONT_SIZE_VALUES[s.id] }}
                aria-label={s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              aria-label={t('settings.reduceMotion')}
            />
            <span>
              <span className="font-bold block">{t('settings.reduceMotion')}</span>
              <span className="text-[var(--muted)]">{t('settings.reduceMotionDesc')}</span>
            </span>
          </label>
        </section>

        <section className="border-t border-[var(--line)] pt-6 space-y-2">
          <h2 className="font-display text-xl">{t('settings.privacyTitle')}</h2>
          <ul className="text-sm list-disc pl-5 space-y-1 text-[var(--ink-soft)]">
            <li>{t('settings.noDataCollected')}</li>
            <li>{t('settings.localOnly')}</li>
            <li>{t('settings.noTracking')}</li>
            <li>{t('settings.noAccount')}</li>
          </ul>
          <button onClick={clearPrefs} className="text-sm underline mt-3">
            {t('settings.resetPrefs')}
          </button>
        </section>
      </div>
    </MainLayout>
  );
}
