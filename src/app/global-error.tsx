'use client';

import { dictionaries } from '@/i18n';
import { LANGUAGES } from '@/i18n/config';
import type { TranslationKey } from '@/i18n/en';

/**
 * Last-resort boundary: it renders when the root layout itself has failed, which
 * means no providers, no store and no CSS pipeline to lean on. Everything is inline
 * and everything is defensive.
 *
 * The text is still translated. The language comes from `document.documentElement`,
 * which the providers set on every render before anything can throw, so a reader
 * whose app crashed at the root is not silently dumped into English.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const code =
    (typeof document !== 'undefined' && document.documentElement?.dataset?.locale) ||
    (typeof navigator !== 'undefined' && LANGUAGES.find((l) => l.code === navigator.language.slice(0, 2))?.code) ||
    'en';
  const dict = dictionaries[code as keyof typeof dictionaries] ?? dictionaries.en;
  const label = (key: TranslationKey, fallback: string) => (dict?.[key] as string) ?? fallback;

  return (
    <html lang={code} dir={code === 'ar' ? 'rtl' : 'ltr'}>
      <body style={{ margin: 0, background: '#F3EFE7', color: '#17202B', fontFamily: '"Public Sans", system-ui, sans-serif' }}>
        <main style={{ maxWidth: 38, margin: '0 auto', padding: '4rem 1.25rem' }}>
          <div style={{ maxWidth: '38rem' }}>
            <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontSize: '1.75rem', lineHeight: 1.2, margin: '0 0 .5rem' }}>
              {label('error.title', 'This page could not be loaded')}
            </h1>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, color: '#42505f' }}>{label('error.body', 'The problem is on our side. Trying again usually fixes it.')}</p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={reset}
                style={{ background: '#14304F', color: '#fff', border: 0, borderRadius: 999, padding: '.6rem 1.1rem', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}
              >
                {label('common.retry', 'Try again')}
              </button>
              {/* next/link needs the root layout and the client router, and this
                  boundary renders when those have failed, so this one link is
                  deliberately a plain anchor. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                style={{ border: '1px solid #cbbfa9', borderRadius: 999, padding: '.6rem 1.1rem', fontWeight: 700, color: '#17202B', textDecoration: 'none' }}
              >
                {label('error.backHome', 'Go to the home page')}
              </a>
            </div>
            {error?.digest && (
              <p style={{ marginTop: '1.5rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.7rem', color: '#6c7a89' }}>
                {label('error.technical', 'Technical details')}: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
