'use client';

import { Bus, DollarSign, Train } from 'lucide-react';
import { ExpandableSection } from '@/components/ui/ExpandableSection';
import { useTranslation } from '@/lib/i18n';
import {
  FAIRMOUNT_STATIONS, GUIDE_BUS_ROUTES, MATTAPAN_STATIONS, RED_STATIONS,
  type Connection, type GuideStation,
} from './transitGuideData';

/** A static, source-linked introduction, not a live schedule or eligibility
 * determination. Dynamic MBTA information remains on the authority's site. */
export function TransitGuide() {
  const { t, lang } = useTranslation();
  const connectionText = (connection: Connection) => {
    if (connection.type === 'bus') return `${t('map.line.bus')} ${connection.routes}`;
    if (connection.type === 'rail') return t('map.line.rail');
    if (connection.type === 'red') return t('neighborhoodTransit.redTitle');
    return t('neighborhoodTransit.mattTitle');
  };
  const stationGrid = (stations: readonly GuideStation[], color: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {stations.map((station) => (
        <div key={station.name} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className={`w-3 h-3 rounded-full ${color}`} />
            <bdi className="font-heading font-semibold">{station.name}</bdi>
          </div>
          {station.connections.length > 0 && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {t('neighborhoodTransit.transfers')}: {station.connections.map(connectionText).join(' · ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
  const notice = <p className="text-sm text-[var(--color-text-muted)]">{t('neighborhoodTransit.scheduleNotice')}</p>;
  const programs = [
    { title: 'CharlieCard', body: t('neighborhoodTransit.charlieBody'), href: 'https://www.mbta.com/fares/charliecard' },
    { title: 'M7', body: t('neighborhoodTransit.m7Body'), href: 'https://www.bostonpublicschools.org/bps-departments/transportation/students-families/mbta-passes' },
    { title: t('neighborhoodTransit.reducedTitle'), body: t('neighborhoodTransit.reducedBody'), href: 'https://www.mbta.com/fares/reduced' },
    { title: t('neighborhoodTransit.incomeTitle'), body: t('neighborhoodTransit.incomeBody'), href: 'https://www.mbta.com/fares/reduced/income-eligible' },
    { title: 'Car-Free Seniors', body: t('neighborhoodTransit.seniorBody'), href: 'https://www.mbta.com/fares/reduced/senior-charliecard' },
  ];
  const busDescription = (route: typeof GUIDE_BUS_ROUTES[number]) => {
    if (route.alternate) return t('neighborhoodTransit.routeAlternative', { from: route.from, to: route.to, alternate: route.alternate });
    if (route.via) return t('neighborhoodTransit.routeVia', { from: route.from, to: route.to, via: route.via });
    if (route.loop) return t('neighborhoodTransit.routeLoop', { from: route.from, to: route.to });
    return `${route.from} – ${route.to}`;
  };

  return (
    <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="space-y-4">
      {lang !== 'en' && <p role="note" className="text-xs text-[var(--color-text-muted)]">{t('neighborhoodTransit.draft')}</p>}
      <ExpandableSection title={t('neighborhoodTransit.redTitle')} preview={t('neighborhoodTransit.redPreview')}
        icon={<Train className="w-5 h-5" />} sourceUrl="https://www.mbta.com/schedules/Red/line" sourceName="MBTA">
        <div className="space-y-4">
          {notice}
          {stationGrid(RED_STATIONS, 'bg-red-600')}
          <p className="text-sm">{t('neighborhoodTransit.redFare')}</p>
        </div>
      </ExpandableSection>
      <ExpandableSection title={t('neighborhoodTransit.mattTitle')} preview={t('neighborhoodTransit.mattPreview')}
        icon={<Train className="w-5 h-5" />} sourceUrl="https://www.mbta.com/schedules/Mattapan/line" sourceName="MBTA">
        <div className="space-y-4">
          {notice}
          <p className="text-sm p-3 bg-[var(--color-accent-primary)]/10 rounded-lg">{t('neighborhoodTransit.mattNote')}</p>
          {stationGrid(MATTAPAN_STATIONS, 'bg-red-600')}
          <p className="text-sm">{t('neighborhoodTransit.mattFare')}</p>
        </div>
      </ExpandableSection>
      <ExpandableSection title={t('neighborhoodTransit.fairTitle')} preview={t('neighborhoodTransit.fairPreview')}
        icon={<Train className="w-5 h-5" />} sourceUrl="https://www.mbta.com/schedules/CR-Fairmount/line" sourceName="MBTA">
        <div className="space-y-4">
          {notice}
          {stationGrid(FAIRMOUNT_STATIONS, 'bg-purple-600')}
          <p className="text-sm">{t('neighborhoodTransit.fairFare')}</p>
        </div>
      </ExpandableSection>
      <ExpandableSection title={t('neighborhoodTransit.busTitle')} preview={t('neighborhoodTransit.busPreview')}
        icon={<Bus className="w-5 h-5" />} sourceUrl="https://www.mbta.com/schedules/bus" sourceName="MBTA">
        <div className="space-y-4">
          {notice}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {GUIDE_BUS_ROUTES.map((route) => (
              <a key={route.id} href={`https://www.mbta.com/schedules/${route.id}/line`} target="_blank" rel="noreferrer noopener"
                aria-label={t('neighborhoodTransit.busRouteLabel', { number: route.id, route: busDescription(route) })}
                className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg hover:underline">
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">{route.id}</span>
                <p className="text-xs mt-1">{busDescription(route)}</p>
              </a>
            ))}
          </div>
        </div>
      </ExpandableSection>
      <ExpandableSection title={t('neighborhoodTransit.faresTitle')} preview={t('neighborhoodTransit.faresPreview')}
        icon={<DollarSign className="w-5 h-5" />} sourceUrl="https://www.mbta.com/fares/reduced" sourceName="MBTA">
        <div className="space-y-3">
          {programs.map((program) => (
            <div key={program.href} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
              <a href={program.href} target="_blank" rel="noreferrer noopener" className="font-heading font-semibold text-sm text-[var(--color-accent-primary)] hover:underline">{program.title}</a>
              <p className="text-xs text-[var(--color-text-muted)]">{program.body}</p>
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}
