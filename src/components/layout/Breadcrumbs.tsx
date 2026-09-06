'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { SITE_URL } from '@/lib/site';
import { NAV_LABEL_KEY } from '@/lib/searchIndex';
import type { TranslationKey } from '@/i18n/en';
import { cn } from '@/lib/utils';

/**
 * Where the visitor is, in a form a search engine can also read.
 *
 * The trail is derived from the URL against the same label table the sidebar and
 * the search index use, so adding a route updates all three. The JSON-LD block
 * is the same list, which is the only reason breadcrumbs are in the markup at
 * all rather than purely decorative.
 */
export function Breadcrumbs({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const trial = [
    { href: '/', label: t('nav.dashboard') },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const key = NAV_LABEL_KEY[href] as TranslationKey | undefined;
      return {
        href,
        label: key ? t(key) : decodeURIComponent(segment).replace(/-/g, ' '),
      };
    }),
  ];

  const items = trial.length > 1 ? trial : trial.slice(0, 1);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${SITE_URL}${item.href}`,
    })),
  };

  if (items.length <= 1) return null;

  return (
    <nav aria-label={t('nav.breadcrumbs')} className={cn('min-w-0 flex-1', compact && 'border-t border-[var(--color-border)] px-3 py-1.5')}>
      <script
        type="application/ld+json"
        // Static structural data derived from the route, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] overflow-hidden">
        <li className="shrink-0">
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] px-1 py-0.5 hover:text-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="sr-only">{t('nav.dashboard')}</span>
          </Link>
        </li>
        {items.slice(1).map((item, index, array) => (
          <li key={item.href} className="flex min-w-0 items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
            {index === array.length - 1 ? (
              <span aria-current="page" className="truncate font-heading font-medium text-[var(--color-text-primary)]">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="truncate hover:text-[var(--color-accent-primary)]">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
