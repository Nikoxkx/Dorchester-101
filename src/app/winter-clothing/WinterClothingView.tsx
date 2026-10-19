'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Phone, Search, Shirt, Snowflake } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { useWinterClothing } from '@/hooks/useWinterClothing';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { coldSignal } from '@/lib/weather';
import type { ClothingAudience } from '@/data/winterClothing';
import type { TranslationKey } from '@/i18n/en';

/**
 * Free coats and winter clothing around Dorchester and Boston.
 *
 * The ordering is the advice: places that are open now and in season come
 * first, and when the live weather says a warm coat matters today the page
 * says so and puts the warming-center route at the top. The finder band at
 * the bottom is the backstop that can never go stale — Mass 2-1-1 and the
 * other locators maintain their own listings daily.
 */

const AUDIENCES: Array<{ id: 'all' | ClothingAudience; key: TranslationKey }> = [
  { id: 'all', key: 'clothing.filterAll' },
  { id: 'kids', key: 'clothing.filterKids' },
  { id: 'adults', key: 'clothing.filterAdults' },
  { id: 'women', key: 'clothing.filterWomen' },
  { id: 'families', key: 'clothing.filterFamilies' },
  { id: 'veterans', key: 'clothing.filterVeterans' },
];

export default function WinterClothingView() {
  const { t, format } = useI18n();
  const { places } = useWinterClothing();
  const { data: weather } = useWeather();
  const cold = weather ? coldSignal(weather) : false;

  const [audience, setAudience] = useState<'all' | ClothingAudience>('all');
  const [walkInOnly, setWalkInOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [query, setQuery] = useState('');

  const { listed, locators } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (p: (typeof places)[number]) =>
      (audience === 'all' || p.audiences.includes(audience)) &&
      (!walkInOnly || p.kind === 'walkIn') &&
      (!openOnly || p.computed?.openNow === true) &&
      (!q || `${p.name} ${p.neighborhood}`.toLowerCase().includes(q));
    const rank = (p: (typeof places)[number]) =>
      (p.computed?.openNow === true ? 0 : p.computed?.openNow === null || p.computed?.openNow === undefined ? 1 : 2) +
      (p.computed?.inSeason === false ? 3 : 0);
    return {
      listed: places.filter((p) => p.kind !== 'locator' && matches(p)).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name)),
      locators: places.filter((p) => p.kind === 'locator' && matches(p)),
    };
  }, [places, audience, walkInOnly, openOnly, query]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 font-heading text-sm font-bold transition-colors ${
      active
        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white'
        : 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]'
    }`;

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header>
          <p className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <Shirt className="h-3.5 w-3.5" aria-hidden="true" /> {t('clothing.title')}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
            {cold ? t('clothing.homeColdTitle') : t('clothing.title')}
          </h1>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('clothing.subtitle')}</p>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('clothing.intro')}</p>
          <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">
            {t('clothing.count', { count: format.number(listed.length + locators.length) })} · {t('clothing.callFirst')}
          </p>
        </header>

        {cold && (
          <section className="rounded-[var(--radius-lg)] border border-[var(--color-accent-secondary)]/40 bg-[var(--color-accent-secondary)]/8 p-5" aria-labelledby="cl-warm">
            <h2 id="cl-warm" className="flex items-center gap-2 font-heading text-base font-extrabold">
              <Snowflake className="h-4 w-4 text-[var(--color-accent-secondary)]" aria-hidden="true" /> {t('clothing.warmTitle')}
            </h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('clothing.warmBody')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="https://www.boston.gov/cold" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-secondary)] px-4 py-2 font-heading text-sm font-bold text-white">
                {t('clothing.warmLink')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a href="tel:211" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-4 py-2 font-heading text-sm font-bold">
                <Phone className="h-4 w-4" aria-hidden="true" /> 2-1-1
              </a>
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3">
          <label className="relative block max-w-md">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('clothing.searchPlaceholder')}
              className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2 ps-9 pe-3 text-sm"
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('clothing.whoFor')}>
            {AUDIENCES.map((a) => (
              <button key={a.id} type="button" aria-pressed={audience === a.id} onClick={() => setAudience(a.id)} className={chip(audience === a.id)}>
                {t(a.key)}
              </button>
            ))}
            <button type="button" aria-pressed={walkInOnly} onClick={() => setWalkInOnly((v) => !v)} className={chip(walkInOnly)}>
              {t('clothing.filterWalkIn')}
            </button>
            <button type="button" aria-pressed={openOnly} onClick={() => setOpenOnly((v) => !v)} className={chip(openOnly)}>
              {t('clothing.openNow')}
            </button>
          </div>
        </div>

        {cold && listed.length > 0 && (
          <p className="font-heading text-sm font-bold text-[var(--color-accent-secondary)]">{t('clothing.needsCoatNow')}</p>
        )}

        {listed.length === 0 && locators.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] p-5">
            <p className="text-sm text-[var(--color-text-secondary)]">{t('clothing.noResults')}</p>
            <a href="tel:211" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white">
              <Phone className="h-4 w-4" aria-hidden="true" /> 2-1-1
            </a>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {listed.map((place) => (
              <ClothingCard key={place.id} place={place} />
            ))}
          </div>
        )}

        {locators.length > 0 && (
          <section aria-labelledby="cl-locators" className="mt-2">
            <h2 id="cl-locators" className="font-heading text-lg font-extrabold">{t('clothing.locatorsTitle')}</h2>
            <p className="mt-1 max-w-prose text-sm text-[var(--color-text-secondary)]">{t('clothing.locatorsBody')}</p>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              {locators.map((place) => (
                <ClothingCard key={place.id} place={place} />
              ))}
            </div>
          </section>
        )}

        <ProjectNote sources={['bostongov', 'dor101']}>{t('clothing.datasetNote')}</ProjectNote>
      </div>
    </MainLayout>
  );
}
