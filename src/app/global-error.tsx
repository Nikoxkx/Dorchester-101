'use client';

import { dictionaries } from '@/i18n';
import { LANGUAGES, detectLanguage } from '@/i18n/config';
import type { TranslationKey } from '@/i18n/en';

/**
 * Last-resort boundary: it renders when the root layout itself has failed, which
 * means no providers, no store and no CSS pipeline to lean on. Everything is inline
 * and everything is defensive.
 *
 * The text is still translated. Use the saved preference first, then the document
 * attribute or browser language if the root provider never mounted.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // The root provider may fail before it has applied its document attributes.
  // Read the same persisted preference directly, without importing the store.
  let persistedLanguage: unknown;
  let savedTheme: 'light' | 'dark' | 'system' = 'dark';
  try {
    if (typeof window !== 'undefined') {
      const state = JSON.parse(window.localStorage.getItem('dor101-settings') ?? '{}')?.state;
      persistedLanguage = state?.language;
      if (state?.theme === 'light' || state?.theme === 'dark' || state?.theme === 'system') {
        savedTheme = state.theme;
      }
    }
  } catch {
    // Storage can be disabled or corrupt; fall back to document/browser preferences.
  }
  const knownCode = (value: unknown) => LANGUAGES.find((language) => language.code === value)?.code;
  const code = knownCode(persistedLanguage) ??
    knownCode(typeof document !== 'undefined' ? document.documentElement?.dataset?.locale : undefined) ??
    (typeof navigator !== 'undefined' ? detectLanguage([navigator.language]) : 'en');
  const prefersDark = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
  const colors = dark
    ? { background: '#11181B', text: '#F1F4F2', secondary: '#CDD6D3', muted: '#9AA9A5', border: '#506064', button: '#86C7D5', buttonText: '#11181B' }
    : { background: '#F2F7F7', text: '#152A32', secondary: '#40545B', muted: '#64777D', border: '#AFC1C4', button: '#123D54', buttonText: '#FFFFFF' };
  const dict = dictionaries[code as keyof typeof dictionaries] ?? dictionaries.en;
  const label = (key: TranslationKey, fallback: string) => (dict?.[key] as string) ?? fallback;

  return (
    <html lang={code} dir={code === 'ar' ? 'rtl' : 'ltr'} className={dark ? 'dark' : undefined}>
      <body style={{ margin: 0, background: colors.background, color: colors.text, fontFamily: '"Public Sans", system-ui, sans-serif' }}>
        <main style={{ maxWidth: '38rem', margin: '0 auto', padding: '4rem 1.25rem' }}>
          <div style={{ maxWidth: '38rem' }}>
            <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.75rem', lineHeight: 1.2, margin: '0 0 .5rem' }}>
              {label('error.title', 'This page could not be loaded')}
            </h1>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, color: colors.secondary }}>{label('error.body', 'The problem is on our side. Trying again usually fixes it.')}</p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={reset}
                style={{ background: colors.button, color: colors.buttonText, border: 0, borderRadius: 999, padding: '.6rem 1.1rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {label('common.retry', 'Try again')}
              </button>
              {/* next/link needs the root layout and the client router, and this
                  boundary renders when those have failed, so this one link is
                  deliberately a plain anchor. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ border: `1px solid ${colors.border}`, borderRadius: 999, padding: '.6rem 1.1rem', fontWeight: 700, color: colors.text, textDecoration: 'none' }}
              >
                {label('error.backHome', 'Go to the home page')}
              </a>
            </div>
            {error?.digest && (
              <p style={{ marginTop: '1.5rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', color: colors.muted }}>
                {label('error.technical', 'Technical details')}: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
