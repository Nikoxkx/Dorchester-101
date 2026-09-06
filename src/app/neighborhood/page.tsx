'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useLiveApi } from '@/hooks/useLiveApi';
import { GlassSegmented } from '@/components/glass/GlassControls';
import { NEIGHBORHOODS, DORCHESTER_OVERVIEW, TRANSIT_GUIDE, TENANT_RIGHTS, type NeighborhoodProfile } from '@/data/neighborhoods';
import { formatFor } from '@/lib/i18n';
import { MapPin, TrainFront, Scale, Landmark, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NeighborhoodPage() {
  return (
    <MainLayout>
      <NeighborhoodView />
    </MainLayout>
  );
}

function NeighborhoodView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [tab, setTab] = useState<'areas' | 'transit' | 'rights'>('areas');
  const [selected, setSelected] = useState<NeighborhoodProfile | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('neighborhood.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('neighborhood.description')}</p>
      </header>

      <GlassSegmented
        ariaLabel={t('neighborhood.title')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'areas', label: t('neighborhood.overview') },
          { value: 'transit', label: t('neighborhood.transit') },
          { value: 'rights', label: t('neighborhood.rights') },
        ]}
      />

      {tab === 'areas' && (
        <>
          <div className="grid sm:grid-cols-3 gap-2.5">
            <FactCard label="Est. / annexed" value={`${DORCHESTER_OVERVIEW.settled} / ${DORCHESTER_OVERVIEW.annexed}`} />
            <FactCard label={t('neighborhood.transitAccess')} value={`Red Line · Fairmount · ${formatFor.number(DORCHESTER_OVERVIEW.approxSqMiles)} sq mi`} />
            <FactCard label="ZIP codes" value={DORCHESTER_OVERVIEW.zipCodes.join(' · ')} />
          </div>
          <p className="text-caption text-text-2 -mt-3">{DORCHESTER_OVERVIEW.note}</p>
          <ul className="grid md:grid-cols-2 gap-3">
            {NEIGHBORHOODS.map((n) => (
              <li key={n.slug}>
                <button
                  onClick={() => setSelected(n)}
                  className="content-card squircle p-5 w-full h-full text-start transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current print-block"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-3 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="text-body font-bold text-1">{n.name}</span>
                  </span>
                  <span className="block text-footnote text-text-2 mt-2 leading-relaxed">{n.description}</span>
                  <span className="block text-caption text-text-3 mt-2.5">
                    <TrainFront className="w-3.5 h-3.5 inline align-[-2px] me-1" aria-hidden />
                    {n.transitAccess}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <DetailSheet area={selected} onClose={() => setSelected(null)} />
        </>
      )}

      {tab === 'transit' && (
        <div className="space-y-3">
          <section className="content-card squircle p-5">
            <h2 className="text-title2 font-bold text-1">Red Line</h2>
            <p className="text-caption text-text-3 mt-1">{TRANSIT_GUIDE.redLine.frequency}</p>
            <ul className="mt-3 space-y-1.5">
              {TRANSIT_GUIDE.redLine.stations.map((st) => (
                <li key={st.name} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-footnote font-semibold text-1">{st.name}</span>
                  <span className="text-caption text-text-3">{st.transfers.join(' · ')}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="content-card squircle p-5">
            <h2 className="text-title2 font-bold text-1">Fairmount Line</h2>
            <p className="text-caption text-text-3 mt-1">{TRANSIT_GUIDE.fairmount.note}</p>
            <ul className="mt-3 space-y-1.5">
              {TRANSIT_GUIDE.fairmount.stations.map((st) => (
                <li key={st.name} className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-footnote font-semibold text-1">{st.name}</span>
                  <span className="text-caption text-text-3">{st.transfers.join(' · ')}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="content-card squircle p-5 overflow-x-auto">
            <h2 className="text-title2 font-bold text-1 mb-2">Key bus routes</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Route</th>
                  <th scope="col">Destination</th>
                  <th scope="col">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {TRANSIT_GUIDE.busRoutes.map((b) => (
                  <tr key={b.route}>
                    <td className="font-bold num">{b.route}</td>
                    <td>{b.destination}</td>
                    <td className="num">{b.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section className="content-card squircle p-5">
            <h2 className="text-title2 font-bold text-1 mb-2">Fares</h2>
            <ul className="space-y-2">
              {TRANSIT_GUIDE.farePrograms.map((f) => (
                <li key={f.name}>
                  <span className="text-footnote font-semibold text-1">{f.name}: </span>
                  <span className="text-footnote text-text-2">{f.description}</span>
                </li>
              ))}
            </ul>
          </section>
          <p className="text-caption2 text-text-3">{t('common.source')}: MBTA · {t('common.lastVerified')} 2026-09-06</p>
        </div>
      )}

      {tab === 'rights' && (
        <div className="space-y-3">
          <RightsList title="Eviction" items={TENANT_RIGHTS.eviction} />
          <RightsList title="Habitability" items={TENANT_RIGHTS.habitability} />
          <RightsList title="Deposits & fees" items={TENANT_RIGHTS.deposits} />
          <p className="text-caption2 text-text-3">
            {t('common.source')}: {TENANT_RIGHTS.sourceName} —{' '}
            <a href={TENANT_RIGHTS.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              masslegalhelp.org/housing
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="content-card squircle px-4 py-3.5">
      <p className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{label}</p>
      <p className="text-footnote font-semibold text-1 mt-1">{value}</p>
    </div>
  );
}

function DetailSheet({ area, onClose }: { area: NeighborhoodProfile | null; onClose: () => void }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [openSection, setOpenSection] = useState<string | null>('history');
  if (!area) return null;

  const sections = [
    { id: 'history', label: 'History', body: area.history },
    { id: 'developments', label: 'Development', body: area.currentDevelopments },
    { id: 'landmarks', label: t('neighborhood.highlights'), body: area.landmarks.join(' · ') },
    { id: 'schools', label: 'Schools', body: area.schools.join(' · ') },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6 no-print">
      <button aria-label={t('common.close')} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={area.name}
        className="glass glass-regular glass-edge glass-specular squircle relative z-10 w-full max-w-lg max-h-[86dvh] flex flex-col"
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 shrink-0">
          <h2 className="text-title3 font-bold text-1">{area.name}</h2>
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="glass glass-clear rounded-full w-8 h-8 grid place-items-center text-2 hover:text-1"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-5 pb-6">
          <p className="text-subhead text-text-1 leading-relaxed">{area.description}</p>
          <p className="text-caption text-text-2 mt-3">
            <TrainFront className="w-4 h-4 inline align-[-3px] me-1.5" aria-hidden />
            {area.transitAccess}
          </p>
          <div className="mt-4 space-y-2">
            {sections.map((s) => (
              <div key={s.id} className="content-card rounded-[var(--radius-sm)] overflow-hidden">
                <button
                  onClick={() => setOpenSection(openSection === s.id ? null : s.id)}
                  aria-expanded={openSection === s.id}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current"
                >
                  <span className="text-footnote font-semibold text-1">{s.label}</span>
                  <ChevronDown className={cn('w-4 h-4 text-text-3 transition-transform', openSection === s.id && 'rotate-180')} aria-hidden />
                </button>
                {openSection === s.id && (
                  <p className="px-4 pb-4 text-footnote text-text-2 leading-relaxed">{s.body}</p>
                )}
              </div>
            ))}
          </div>
          <p className="text-caption2 text-text-3 mt-4">{t('common.source')}: BPDA · Boston Open Data · {t('common.lastVerified')} {formatFor.date('2026-09-06')}</p>
        </div>
      </div>
    </div>
  );
}


function RightsList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="content-card squircle p-5 print-block">
      <h3 className="text-subhead font-bold text-1 flex items-center gap-2">
        <Scale className="w-4 h-4 text-text-3 shrink-0" strokeWidth={2} aria-hidden />
        {title}
      </h3>
      <ul className="mt-2.5 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-footnote text-text-1 leading-relaxed flex gap-2.5">
            <span aria-hidden className="dot dot-pending mt-2 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
