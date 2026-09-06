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
      <div className="space-y-7">
        <header className="pb-6 border-b border-[var(--line)]">
          <p className="kicker mb-3">Verified directory</p>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.25rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">{t('resources.title')}</h1>
          <p className="text-[var(--ink-soft)] mt-4 max-w-2xl leading-relaxed">
            {t('resources.description')} Each entry carries the date it was last checked — if we
            couldn&apos;t verify a number, it isn&apos;t here.
          </p>
        </header>

        <aside className="desk-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl bg-[var(--red)] text-white flex items-center justify-center font-display text-lg font-black shrink-0">211</span>
            <div>
              <p className="font-display text-lg font-bold text-[var(--charcoal)]">{t('resources.notSure')}</p>
              <p className="text-sm text-[var(--ink-soft)] mt-0.5">{t('resources.call211')}</p>
            </div>
          </div>
          <a href="tel:211" className="cta cta-primary cta-lg">Call 2-1-1</a>
        </aside>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('resources.search', 'Search organizations or services...')}
          className="w-full px-4 py-3 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-sm outline-none focus:border-[var(--charcoal)]"
          aria-label="Search resources"
        />
        <div className="flex flex-wrap gap-1.5">
          {cats.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCat(id)}
              aria-pressed={cat === id}
              className={cat === id
                ? 'bg-[var(--charcoal)] text-[var(--paper)] px-3.5 py-1.5 text-xs font-bold rounded-full'
                : 'border border-[var(--line)] px-3.5 py-1.5 text-xs font-bold rounded-full hover:border-[var(--ink-soft)] transition-colors'}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--muted)]"><strong className="text-[var(--charcoal)]">{list.length}</strong> organizations listed{cat !== 'all' ? ` in ${cat}` : ''}</p>
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
                {org.website && <a href={org.website} target="_blank" rel="noreferrer" className="underline font-bold hover:text-[var(--red)]">Website</a>}
              </div>
            </article>
          ))}
        </div>

        {!loading && list.length === 0 && (
          <div className="desk-card p-8 text-center">
            <p className="font-display text-xl font-bold">Nothing matches that search.</p>
            <p className="text-sm text-[var(--muted)] mt-1">Try a service word (&ldquo;childcare&rdquo;, &ldquo;ESL&rdquo;, &ldquo;eviction&rdquo;) or the org&apos;s name.</p>
            <button onClick={() => { setQ(''); setCat('all'); }} className="cta cta-outline cta-md mt-4">Show everything</button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
