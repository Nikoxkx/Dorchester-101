'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { ExpandableSection, ExpandableCard } from '@/components/ui/ExpandableSection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, telHref } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { RedLineStrip } from '@/components/transit/RedLineStrip';

interface Payload {
  overview: { settled: number; annexed: number; approxSqMiles: number; zipCodes: string[]; note: string };
  neighborhoods: {
    slug: string; name: string; description: string; transitAccess: string;
    landmarks: string[]; schools: string[]; history: string; currentDevelopments: string;
  }[];
  transit: {
    fairmount: { note: string; stations: { name: string; transfers: string[] }[] };
    busRoutes: { route: string; destination: string; frequency: string }[];
    farePrograms: { name: string; description: string }[];
  };
  fares: { subway: number; localBus: number; monthlyLink: number; sourceUrl: string };
  rights: { sourceUrl: string; eviction: string[]; habitability: string[]; deposits: string[] };
}

export default function NeighborhoodPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading } = useApi<Payload>('/api/neighborhoods');

  if (loading || !data) {
    return <MainLayout><LoadingSpinner size="lg" /></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">Walking tour</p>
          <h1 className="font-display text-4xl">{t('neighborhood.title')}</h1>
          <p className="text-[var(--muted)] mt-2 max-w-2xl">{t('neighborhood.description')}</p>
        </header>

        <ExpandableSection title="About the Dot" preview={`Settled ${data.overview.settled}, annexed ${data.overview.annexed}`} defaultExpanded>
          <p className="text-sm leading-relaxed mb-3">
            Dorchester is older than Boston. The town was settled in 1630 and annexed in 1870. It is not a Census place — treat population figures as planning estimates. ZIP codes {data.overview.zipCodes.join(', ')}. About {data.overview.approxSqMiles} square miles of triple-deckers, squares, and the Red Line.
          </p>
          <p className="text-xs text-[var(--muted)]">{data.overview.note}</p>
        </ExpandableSection>

        <section>
          <h2 className="font-display text-2xl mb-3">Squares</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {data.neighborhoods.map((n) => (
              <ExpandableCard key={n.slug} title={n.name} subtitle={n.description}>
                <div className="space-y-2 text-sm">
                  <p><strong>Transit.</strong> {n.transitAccess}</p>
                  <p><strong>Landmarks.</strong> {n.landmarks.join(', ')}</p>
                  <p><strong>Schools.</strong> {n.schools.join(', ')}</p>
                  <p><strong>History.</strong> {n.history}</p>
                  <p><strong>Now.</strong> {n.currentDevelopments}</p>
                </div>
              </ExpandableCard>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="desk-panel p-4">
            <RedLineStrip />
            <p className="text-sm mt-4">Subway {formatCurrency(data.fares.subway)} · bus {formatCurrency(data.fares.localBus)} · monthly {formatCurrency(data.fares.monthlyLink)}. <a className="underline" href={data.fares.sourceUrl}>mbta.com/fares</a></p>
          </div>
          <div className="desk-panel p-4 space-y-3">
            <h3 className="font-display text-xl">Fairmount Line</h3>
            <p className="text-sm">{data.transit.fairmount.note}</p>
            <ul className="text-sm list-disc pl-4">
              {data.transit.fairmount.stations.map((s) => <li key={s.name}>{s.name} — {s.transfers.join(', ')}</li>)}
            </ul>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {data.transit.busRoutes.map((b) => (
                <div key={b.route} className="border border-[var(--line)] p-2">
                  <span className="font-mono font-bold bg-[#ffc72c] text-black px-1">{b.route}</span>
                  <p className="mt-1">{b.destination}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <ExpandableSection title="Tenant rights" sourceUrl={data.rights.sourceUrl} sourceName="Mass Legal Help">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div><h4 className="font-bold mb-1">Eviction</h4><ul className="list-disc pl-4 space-y-1">{data.rights.eviction.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h4 className="font-bold mb-1">Heat & repairs</h4><ul className="list-disc pl-4 space-y-1">{data.rights.habitability.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div><h4 className="font-bold mb-1">Deposits</h4><ul className="list-disc pl-4 space-y-1">{data.rights.deposits.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
          <p className="text-sm mt-3">GBLS <a className="underline" href={telHref('(617) 603-1700')}>(617) 603-1700</a> · City Life <a className="underline" href={telHref('(617) 524-3541')}>(617) 524-3541</a></p>
        </ExpandableSection>
      </div>
    </MainLayout>
  );
}
