'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { telHref } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface Resource {
  id: string;
  name: string;
  category: string;
  address?: string;
  phone: string;
  website?: string;
  hours: string;
  languages: string[];
  services: string;
  eligibility?: string;
  notes?: string;
  isFree: boolean;
  lastVerified: string;
}

const cats = [
  ['all', 'All'],
  ['housing', 'Housing'],
  ['legal', 'Legal'],
  ['healthcare', 'Health'],
  ['food', 'Food'],
  ['employment', 'Jobs'],
  ['education', 'Libraries'],
  ['family', 'Family'],
  ['emergency', 'Emergency'],
];

export default function ResourcesPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<{ resources: Resource[] }>('/api/resources');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const list = (data?.resources || []).filter((r) => {
    const hay = `${r.name} ${r.services} ${r.address || ''}`.toLowerCase();
    return hay.includes(q.toLowerCase()) && (cat === 'all' || r.category === cat);
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="kicker">Directory</p>
          <h1 className="font-display text-4xl">{t('resources.title')}</h1>
          <p className="text-[var(--muted)] mt-2 max-w-2xl">{t('resources.description')}</p>
        </header>

        <aside className="desk-panel p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-display text-xl">{t('resources.notSure')}</p>
            <p className="text-sm">{t('resources.call211')}</p>
          </div>
          <a href="tel:211" className="bg-[var(--red)] text-white px-4 py-2 font-mono font-bold">2-1-1</a>
        </aside>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('resources.search', 'Search organizations or services...')}
          className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--line)]"
        />
        <div className="flex flex-wrap gap-1">
          {cats.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCat(id)}
              className={cat === id ? 'bg-[var(--ink)] text-[var(--paper)] px-3 py-1 text-xs font-bold' : 'border border-[var(--line)] px-3 py-1 text-xs'}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--muted)]">{list.length} listed</p>
        {loading && <LoadingSpinner />}
        {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

        <div className="grid lg:grid-cols-2 gap-4">
          {list.map((org) => (
            <article key={org.id} className="desk-panel p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-xl">{org.name}</h2>
                {org.isFree && <Badge variant="green">Free</Badge>}
              </div>
              <p className="text-sm">{org.services}</p>
              {org.address && <p className="text-sm text-[var(--muted)]">{org.address}</p>}
              <p className="text-sm"><a href={telHref(org.phone)} className="underline">{org.phone}</a> · {org.hours}</p>
              <p className="text-xs text-[var(--muted)]">{org.languages.join(', ')}</p>
              {org.eligibility && <p className="text-xs border-t border-[var(--line)] pt-2">Eligibility: {org.eligibility}</p>}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)]">Verified {org.lastVerified}</span>
                {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="underline">Website</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
