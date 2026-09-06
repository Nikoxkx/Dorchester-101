'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import type { TranslationKey } from '@/i18n/en';

/**
 * 404, in the reader's language.
 *
 * The dead end is stated first, then the way out: the eight routes that actually
 * exist in this build, read from the same list the navigation uses. A 404 that
 * offers only "go home" wastes the one moment a visitor is willing to re-orient.
 */
const ROUTES: Array<{ href: string; key: TranslationKey }> = [
  { href: '/', key: 'nav.dashboard' },
  { href: '/resources', key: 'nav.resources' },
  { href: '/map', key: 'nav.map' },
  { href: '/affordable-housing', key: 'nav.affordable' },
  { href: '/food', key: 'nav.food' },
  { href: '/news', key: 'nav.news' },
  { href: '/faq', key: 'nav.faq' },
  { href: '/settings', key: 'nav.settings' },
];

export default function NotFound() {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-14" id="main">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-text-muted)]">404</p>
      <h1 className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('error.notFoundTitle')}</h1>
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('error.notFoundBody')}</p>
      {pathname && pathname !== '/' && (
        <p className="font-mono text-xs text-[var(--color-text-muted)]">{pathname}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          {t('error.backHome')}
        </Link>
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 font-heading text-sm font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          {t('error.notFoundCta')}
        </Link>
      </div>

      <nav aria-label={t('nav.section.community')}>
        <ul className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
          {ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="inline-flex rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
              >
                {t(route.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
