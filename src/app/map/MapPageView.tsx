'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bus, ExternalLink, Map as MapIcon, MapPin, TrainFront } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { DorchesterMapLoader } from '@/components/map/DorchesterMapLoader';
import { useI18n } from '@/i18n/hook';
import { TRANSIT_LINES, DORCHESTER_BUS_ROUTES, TRANSIT_DATA_AS_OF } from '@/data/transit';
import { RESOURCES } from '@/data/resources';

export function MapPageView() {
  const { t, format } = useI18n();
  const stations = useMemo(() => {
    const seen = new Set<string>();
    return TRANSIT_LINES.flatMap((line) => line.dorchesterStops).filter((stop) => {
      if (seen.has(stop.id)) return false;
      seen.add(stop.id);
      return true;
    });
  }, []);
  const pins = RESOURCES.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));

  return (
    <MainLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {t('map.title')}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('map.title')}</h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('map.subtitle')}</p>
          </div>
          <p className="text-[11px] leading-snug text-[var(--color-text-muted)]">
            {t('common.updated')} {format.date(TRANSIT_DATA_AS_OF, 'short')} · {t('map.stopCount', { count: String(stations.length) })}
          </p>
        </header>

        <DorchesterMapLoader />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-3.5">
            <h2 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              <TrainFront className="h-3.5 w-3.5" aria-hidden="true" />
              {t('map.transitRoutes')}
            </h2>
            <ul className="mt-2 flex flex-col gap-1">
              {TRANSIT_LINES.map((line) => (
                <li key={line.id}>
                  <Link
                    href={`/map?route=${line.routeId}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-xs transition-colors hover:bg-[var(--color-bg-tertiary)]"
                  >
                    <span className="truncate">{line.name}</span>
                    <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">{t('map.headwayValue', { minutes: String(line.headwayMinutes) })}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-3.5">
            <h2 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              <Bus className="h-3.5 w-3.5" aria-hidden="true" />
              {t('map.line.bus')}
            </h2>
            <ul className="mt-2 flex flex-wrap gap-1">
              {DORCHESTER_BUS_ROUTES.map((bus) => (
                <li key={bus.id}>
                  <Link
                    href={`/map?route=${bus.id}`}
                    title={bus.longName}
                    className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-0.5 font-heading text-[11px] font-bold tabular-nums transition-colors hover:border-[var(--color-accent-primary)]"
                  >
                    {bus.name}
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-3.5">
            <h2 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t('map.placeLayers')}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {t('map.locationsShown', { shown: String(pins.length), total: String(RESOURCES.length) })}
            </p>
            <a
              href="https://mbta.com/alerts"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-flex items-center gap-1 font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
            >
              {t('map.openMbta')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </article>
        <ProjectNote sources={['mbta', 'osm', 'esri', 'dor101']}>
          Arrival times and alerts are live from the MBTA&apos;s public API when it answers, and fall back to the published timetable when it does not; the map says which. Basemap tiles are OpenStreetMap (streets) and Esri World Imagery (satellite). Pins are the same directory listings as the rest of the site.
        </ProjectNote>
        </section>
      </motion.div>
    </MainLayout>
  );
}
