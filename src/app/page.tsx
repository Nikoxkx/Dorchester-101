'use client';

import { useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { StatCard } from '@/components/dashboard/StatCard';
import { RedLineStrip } from '@/components/transit/RedLineStrip';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { getTimeOfDay, localeForLanguage } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/stores/appStore';
import { useApi } from '@/hooks/useApi';
import { BHA_STATUS } from '@/data/programs';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  { ssr: false, loading: () => <div className="h-64 bg-[var(--surface)] flex items-center justify-center"><LoadingSpinner /></div> },
);

interface NewsPayload { articles?: { id: string; title: string; source: string; publishedAt: string; category: string }[] }
interface StatsPayload {
  stats?: {
    id: string;
    label: string;
    value: number;
    format: 'number' | 'currency' | 'percent' | 'status';
    trend?: number;
    source?: string;
    sourceDate?: string;
    status?: string;
  }[];
}

export default function DashboardPage() {
  const { language, setLastUpdated } = useAppStore();
  const { t } = useTranslation(language);
  const news = useApi<NewsPayload>('/api/news');
  const stats = useApi<StatsPayload>('/api/stats');

  const today = useMemo(
    () => new Date().toLocaleDateString(localeForLanguage(language), {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    [language],
  );

  useEffect(() => {
    if (news.data) setLastUpdated(new Date().toLocaleTimeString());
  }, [news.data, setLastUpdated]);

  const greeting = t(`dashboard.greeting.${getTimeOfDay()}`);
  const articles = news.data?.articles?.slice(0, 4) || [];

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4">
          <p className="masthead-date">{today}</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">{t('intro.title')}</h1>
          <p className="text-[var(--ink-soft)] mt-2 max-w-2xl">{t('intro.body')}</p>
          <p className="text-sm text-[var(--muted)] mt-1">{greeting}. {t('dashboard.tagline')}</p>
        </header>

        <EmergencyBanner />

        <section className="grid md:grid-cols-[1.3fr_0.7fr] gap-8">
          <div>
            <div className="flex items-end justify-between mb-2">
              <h2 className="font-display text-2xl">{t('dashboard.glance')}</h2>
              <DataRefreshIndicator lastUpdated={stats.loading ? null : 'sourced'} isRefreshing={stats.loading} />
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8">
              {(stats.data?.stats || []).map((s) => (
                <StatCard
                  key={s.id}
                  label={s.label}
                  value={s.value}
                  format={s.format}
                  status={s.status}
                  trend={typeof s.trend === 'number' ? { value: s.trend, direction: s.trend >= 0 ? 'up' : 'down' } : undefined}
                  source={s.source}
                  sourceDate={s.sourceDate}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] mt-3">
              BHA tenant-based Section 8 is <strong>{BHA_STATUS.section8TenantBased}</strong> as of {BHA_STATUS.asOf}. Public housing waitlists are {BHA_STATUS.publicHousing}.
            </p>
          </div>
          <aside className="desk-panel p-4">
            <RedLineStrip />
            <Link href="/map" className="text-sm underline mt-4 inline-block">{t('dashboard.viewFullMap')}</Link>
          </aside>
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">{t('dashboard.quickAccess')}</h2>
          <QuickLinks />
        </section>

        <div className="grid lg:grid-cols-[1.4fr_0.6fr] gap-8">
          <section>
            <div className="flex items-end justify-between border-b border-[var(--ink)] pb-2 mb-3">
              <h2 className="font-display text-2xl">{t('dashboard.latestNews')}</h2>
              <Link href="/news" className="text-sm underline">{t('dashboard.viewAll')}</Link>
            </div>
            {news.loading && <LoadingSpinner text={t('common.loading')} />}
            {!news.loading && articles.length === 0 && (
              <p className="text-sm text-[var(--muted)]">Feeds are quiet. Try the Dorchester Reporter directly.</p>
            )}
            <ul>
              {articles.map((a) => (
                <li key={a.id} className="py-3 border-b border-[var(--line)]">
                  <Link href="/news" className="block">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="red">{a.category}</Badge>
                      <span className="text-[11px] text-[var(--muted)]">{a.source}</span>
                    </div>
                    <p className="font-display text-lg leading-snug">{a.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <aside className="desk-panel p-4 space-y-3">
            <p className="kicker">RAFT</p>
            <h3 className="font-display text-xl">Emergency rent help is $7,000 / year, not $10,000</h3>
            <p className="text-sm text-[var(--ink-soft)]">
              Massachusetts cut the RAFT cap in 2023. Apply through Metro Housing|Boston. Bring a notice to quit if you have one.
            </p>
            <a href="https://www.mass.gov/raft" target="_blank" rel="noreferrer" className="inline-block bg-[var(--red)] text-white px-4 py-2 text-sm font-bold">
              mass.gov/raft
            </a>
          </aside>
        </div>

        <section>
          <div className="flex items-end justify-between mb-2">
            <h2 className="font-display text-2xl">{t('dashboard.mapTitle')}</h2>
            <Link href="/map" className="text-sm underline">{t('dashboard.viewFullMap')}</Link>
          </div>
          <div className="border border-[var(--line)] overflow-hidden">
            <DorchesterMap height="280px" showControls={false} preview />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
