'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Shirt } from 'lucide-react';
import { useWinterClothing } from '@/hooks/useWinterClothing';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { Badge } from '@/components/ui/Badge';
import { coldSignal } from '@/lib/weather';
import { useAppStore } from '@/stores/appStore';

/**
 * The homepage door into the free winter-clothing list. It shows the three
 * most useful places right now — Dorchester first, open now ahead of
 * closed, out-of-season programs pushed down — and its heading turns into
 * an explicit cold-weather call when the live forecast says a warm coat
 * matters today, which is decided by the same payload as the weather
 * panel above it.
 */
export function ClothingPreview() {
  const { t } = useI18n();
  const { places } = useWinterClothing();
  const { data: weather } = useWeather();
  const weatherEnabled = useAppStore((s) => s.weatherEnabled);
  const cold = weatherEnabled && weather ? coldSignal(weather) : false;

  const rank = (p: (typeof places)[number]) =>
    (p.neighborhood.toLowerCase().includes('dorchester') || p.neighborhood.toLowerCase().includes('upham') || p.neighborhood.toLowerCase().includes('bowdoin') ? 0 : 4) +
    (p.computed?.openNow === true ? 0 : p.computed?.openNow === null || p.computed?.openNow === undefined ? 1 : 2) +
    (p.computed?.inSeason === false ? 8 : 0);
  const top = places
    .filter((p) => p.kind !== 'locator')
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
    .slice(0, 3);

  return (
    <section aria-labelledby="home-clothing-title" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="home-clothing-title" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <Shirt className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
          {cold ? t('clothing.homeColdTitle') : t('clothing.homeTitle')}
        </h2>
        <Link href="/winter-clothing" className="inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline">
          {t('clothing.viewAll')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Link>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t('clothing.callFirst')}</p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {top.map((place) => (
          <li key={place.id}>
            <Link
              href="/winter-clothing"
              className="flex h-full flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3.5 transition-colors hover:border-[var(--color-accent-primary)]"
            >
              <span className="flex flex-wrap gap-1">
                <Badge variant="green">{t('clothing.free')}</Badge>
                {place.computed?.openNow === true && <Badge variant="blue">{t('clothing.openNow')}</Badge>}
                {place.computed?.inSeason === true && <Badge variant="default">{t('clothing.inSeason')}</Badge>}
              </span>
              <span className="font-heading text-sm font-extrabold leading-snug" dir="auto">{place.name}</span>
              <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <MapPin className="h-3 w-3" aria-hidden="true" /> {place.neighborhood}
              </span>
              <span className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {place.offers.slice(0, 3).map((o) => t(`clothing.offer.${o}` as never)).join(' · ')}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
