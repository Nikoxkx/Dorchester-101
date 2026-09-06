'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, MapPin, Phone, Printer, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/hook';
import { RESOURCES, verificationAge, verificationLevel, type ResourceCategory } from '@/data/resources';
import { BOSTON_TZ, formatWindow, isOpenNow, statusFor } from '@/lib/hours';
import { cn } from '@/lib/utils';
import type { TranslationKey } from '@/i18n/en';

/**
 * The whole dataset in one table.
 *
 * This page exists because the filtered pages are not enough on their own: a
 * caseworker, a line at a pantry, a printed sheet for someone without a phone all
 * need the complete list, sorted by what is open and by what has gone unchecked.
 * Every value is read from `src/data/resources.ts`, so it can never disagree with
 * the card a visitor saw on another page.
 */

const CATEGORY_KEYS: Record<ResourceCategory, TranslationKey> = {
  housing: 'map.housing',
  food: 'map.food',
  health: 'map.health',
  legal: 'map.legal',
  community: 'map.community',
  school: 'map.school',
};

export function DirectoryView() {
  const { t, lang, meta, format, pickContent } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [staleFirst, setStaleFirst] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // One timestamp per render pass. Every open/closed badge and every age on this
  // page is measured from it, so two rows cannot disagree about what "today" is.
  const [now] = useState(() => new Date());

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = RESOURCES.map((resource) => {
      const status = resource.hours ? statusFor(resource.hours, now, BOSTON_TZ) : null;
      const today = resource.hours ? resource.hours[(now.getDay() + 6) % 7] : [];
      return {
        resource,
        status,
        openNow: resource.hours ? isOpenNow(resource.hours, now, BOSTON_TZ) : null,
        today,
        age: verificationAge(resource, now),
        level: verificationLevel(resource, now),
      };
    })
      .filter((row) => (category === 'all' ? true : row.resource.category === category))
      .filter((row) => (openOnly ? row.openNow === true : true))
      .filter((row) => {
        if (!needle) return true;
        const haystack = [
          row.resource.name,
          row.resource.address,
          row.resource.neighborhood,
          row.resource.summary.en,
          row.resource.services.join(' '),
          row.resource.operator ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(needle);
      });

    // Sorted in the reader's own collation: a Spanish speaker scanning for
    // "Oficina" should not have accented names dumped at the end of the list.
    return list.sort((a, b) => (staleFirst ? b.age - a.age : a.resource.name.localeCompare(b.resource.name, lang)));
  }, [query, category, openOnly, staleFirst, now, lang]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-4 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('directory.title')}</h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('directory.intro')}</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] md:self-auto"
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            {t('directory.print')}
          </button>
        </header>

        <p className="print-only text-xs text-[var(--color-text-muted)]">
          {t('directory.printHeading')} · {t('common.updated')} {format.date(now, 'medium')}
        </p>

        <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-3">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <label className="relative flex min-w-0 flex-1 items-center">
              <span className="sr-only">{t('directory.search')}</span>
              <Search className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('directory.search')}
                className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] ps-8 pe-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus-visible:border-[var(--color-accent-primary)]"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 font-heading text-xs font-semibold">
                <span className="text-[var(--color-text-muted)]">{t('directory.filterCategory')}</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as ResourceCategory | 'all')}
                  className="h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 font-heading text-xs font-semibold"
                >
                  <option value="all">{t('common.all')}</option>
                  {(Object.keys(CATEGORY_KEYS) as ResourceCategory[]).map((key) => (
                    <option key={key} value={key}>
                      {t(CATEGORY_KEYS[key])}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 font-heading text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={openOnly}
                  onChange={(event) => setOpenOnly(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--color-accent-primary)]"
                />
                {t('directory.openToday')}
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 font-heading text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={staleFirst}
                  onChange={(event) => setStaleFirst(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--color-accent-primary)]"
                />
                {t('directory.sortStaleness')}
              </label>
            </div>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {t('directory.showing', { shown: String(rows.length), total: String(RESOURCES.length) })} ·{' '}
            {t('directory.langNote', { language: meta.name })}
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
            {t('directory.noResults')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map(({ resource, status, today, level, age }) => {
              const summary = pickContent(resource.summary);
              const open = expanded === resource.id;
              return (
                <li key={resource.id}>
                  <article
                    className={cn(
                      'rounded-2xl border bg-[var(--color-bg-primary)]/95 p-3.5 transition-colors',
                      level === 'fresh' ? 'border-[var(--color-border)]' : 'border-[var(--color-accent-amber)]/45'
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="font-heading text-sm font-bold leading-snug">{resource.name}</h2>
                        <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
                          {t(CATEGORY_KEYS[resource.category])} · {resource.neighborhood}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {status && (
                          <Badge variant={status.state === 'open' ? 'green' : status.state === 'closing-soon' ? 'amber' : 'default'}>
                            {status.state === 'open'
                              ? t('common.open')
                              : status.state === 'closing-soon'
                                ? t('common.closingSoon')
                                : t('common.closed')}
                          </Badge>
                        )}
                        {level !== 'fresh' && (
                          <Badge variant="amber">
                            {t('directory.needsReview')} {age > 0 ? `· ${format.number(age)} d` : ''}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary)]" dir="auto">
                      {summary.value}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--color-text-secondary)]">
                      <span>{resource.address}</span>
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
                          className="inline-flex items-center gap-1 font-heading font-bold text-[var(--color-accent-primary)] hover:underline"
                        >
                          <Phone className="h-3 w-3" aria-hidden="true" />
                          {t('directory.call', { number: resource.phone })}
                        </a>
                      )}
                      {resource.website && (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 font-heading font-bold text-[var(--color-accent-primary)] hover:underline"
                        >
                          {t('common.learnMore')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        {today.length > 0 ? (
                          <>
                            <span className="text-[var(--color-text-muted)]">{t('directory.openToday')}:</span>
                            {today.map((window) => formatWindow(window)).join(', ')}
                          </>
                        ) : resource.hours ? (
                          t('directory.closedToday')
                        ) : (
                          <span className="italic text-[var(--color-text-muted)]">{t('directory.noHours')}</span>
                        )}
                      </span>
                      <span className="ms-auto flex items-center gap-2">
                        <Link href={`/map?place=${resource.id}`} className="inline-flex items-center gap-1 font-heading font-bold hover:underline">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {t('directory.openMap')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => setExpanded(open ? null : resource.id)}
                          aria-expanded={open}
                          aria-controls={`hours-${resource.id}`}
                          className="rounded-full border border-[var(--color-border)] px-2 py-0.5 font-heading font-bold transition-colors hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
                        >
                          {t('directory.allHours')}
                        </button>
                      </span>
                    </div>

                    {open && (
                      <div id={`hours-${resource.id}`} className="mt-2.5 grid gap-2 border-t border-[var(--color-border)] pt-2.5 sm:grid-cols-2">
                        <table className="w-full text-[11px]">
                          <caption className="sr-only">{t('directory.allHours')}</caption>
                          <tbody>
                            {resource.hours
                              ? resource.hours.map((windows, index) => (
                                  <tr key={index}>
                                    <th scope="row" className="py-0.5 pe-2 text-start font-heading font-bold text-[var(--color-text-muted)]">
                                      {format.weekday(new Date(now.getTime() + ((index - ((now.getDay() + 6) % 7)) * 86_400_000)), 'short')}
                                    </th>
                                    <td className="py-0.5 tabular-nums">
                                      {windows.length ? windows.map((window) => formatWindow(window)).join(', ') : t('common.closed')}
                                    </td>
                                  </tr>
                                ))
                              : null}
                          </tbody>
                        </table>
                        <div className="text-[11px] leading-snug">
                          {resource.hoursNote && <p className="text-[var(--color-text-secondary)]">{resource.hoursNote}</p>}
                          {resource.requiresId && <p className="mt-1">{t('food.idRequired')}</p>}
                          {resource.acceptsEbt && <p className="mt-1">{t('food.ebt')}</p>}
                          {resource.accessibility?.stepFree && <p className="mt-1">{t('map.wheelchair')}</p>}
                          {resource.verification.source && (
                            <p className="mt-1.5 text-[var(--color-text-muted)]">
                              {t('common.source')}: {resource.verification.source} · {format.date(resource.verification.checkedOn, 'medium')}
                            </p>
                          )}
                          {level !== 'fresh' && <p className="mt-1 font-semibold text-[var(--color-accent-amber)]">{t('directory.staleWarning')}</p>}
                        </div>
                      </div>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </MainLayout>
  );
}
