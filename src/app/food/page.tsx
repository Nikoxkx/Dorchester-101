'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, telHref } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface FoodPayload {
  sites: {
    id: string;
    name: string;
    type: string;
    address: string;
    neighborhood: string;
    phone: string;
    website: string | null;
    hours: Record<string, string>;
    languages: string[];
    foodTypes: string[];
    requirements: string;
    openNow: boolean;
    lastVerified: string;
  }[];
  snap: { maxMonthly: Record<number, number>; applyUrl: string; phone: string; sourceUrl: string; fiscalYear: string };
}

export default function FoodPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<FoodPayload>('/api/food');
  const [q, setQ] = useState('');
  const [type, setType] = useState('');

  const sites = (data?.sites || []).filter((s) => {
    const hay = `${s.name} ${s.neighborhood} ${s.address}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (!type || s.type === type);
  });

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">Food desk</p>
          <h1 className="font-display text-4xl">{t('food.title')}</h1>
          <p className="text-[var(--muted)] mt-2 max-w-2xl">{t('food.description')}</p>
        </header>

        <section className="bg-[var(--red)] text-white p-5">
          <h2 className="font-display text-2xl">{t('food.needFoodToday')}</h2>
          <p className="mt-1 text-white/90">{t('food.callHotline')}</p>
          <a href="tel:18006458333" className="inline-block mt-4 bg-white text-[var(--red)] px-4 py-2 font-mono font-bold text-xl">
            1-800-645-8333
          </a>
          <p className="text-xs mt-2 text-white/80">Mon–Fri 8 AM–5 PM · 180+ languages</p>
        </section>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, square, address…"
            className="flex-1 px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm"
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm">
            <option value="">All types</option>
            <option value="Food Pantry">Pantries</option>
            <option value="Hot Meals">Hot meals</option>
            <option value="Mobile Market">Mobile</option>
          </select>
        </div>

        {loading && <LoadingSpinner />}
        {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

        <div className="grid md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <article key={site.id} className="desk-panel p-4 flex flex-col gap-3">
              <div>
                <h2 className="font-display text-xl">{site.name}</h2>
                <div className="flex gap-2 mt-1">
                  <Badge variant="red">{site.type}</Badge>
                  <Badge variant={site.openNow ? 'green' : 'default'}>{site.openNow ? 'Open now' : 'See hours'}</Badge>
                </div>
              </div>
              <p className="text-sm">{site.address}<br /><span className="text-[var(--muted)]">{site.neighborhood}</span></p>
              <a href={telHref(site.phone)} className="underline text-sm">{site.phone}</a>
              <dl className="text-xs text-[var(--muted)] grid grid-cols-2 gap-x-4">
                {Object.entries(site.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-2">
                    <dt className="capitalize">{day.slice(0, 3)}</dt>
                    <dd>{hours}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm">{site.requirements}</p>
              <p className="text-[11px] text-[var(--muted)]">Verified {site.lastVerified}</p>
              {site.website && (
                <a href={site.website} target="_blank" rel="noreferrer" className="text-sm underline">Website</a>
              )}
            </article>
          ))}
        </div>

        {data?.snap && (
          <section className="desk-panel p-5">
            <h2 className="font-display text-2xl mb-2">{t('food.snapTitle')} · {data.snap.fiscalYear}</h2>
            <p className="text-sm mb-3">Massachusetts uses 200% of poverty for the gross test. Maximum allotment, not a promise of that amount:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {Object.entries(data.snap.maxMonthly).map(([size, amt]) => (
                <div key={size} className="border border-[var(--line)] p-2">
                  <p className="text-[11px] uppercase text-[var(--muted)]">{size} person</p>
                  <p className="font-mono">{formatCurrency(Number(amt))}/mo</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={data.snap.applyUrl} target="_blank" rel="noreferrer" className="bg-[var(--red)] text-white px-4 py-2 text-sm font-bold">DTAConnect</a>
              <a href={telHref(data.snap.phone)} className="underline text-sm">{data.snap.phone}</a>
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  );
}
