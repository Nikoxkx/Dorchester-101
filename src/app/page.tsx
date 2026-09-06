'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { StatCard } from '@/components/dashboard/StatCard';
import { LiveTransit } from '@/components/transit/LiveTransit';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useLiveApi } from '@/hooks/useLiveApi';
import { getTimeOfDay } from '@/lib/utils';
import { RAFT_PROGRAM } from '@/data/programs';
import { ArrowRight, GraduationCap, RadioTower } from 'lucide-react';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  {
    ssr: false,
    loading: () => <div className="h-72 content-card squircle animate-pulse" aria-hidden />,
  },
);

interface NewsPayload {
  articles?: {
    id: string;
    title: string;
    source: string;
    sourceUrl: string;
    publishedAt: string;
    category: string;
  }[];
}
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
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);

  // Live channels: news items push via SSE; stats reload when verified
  // datasets change on the server.
  const news = useLiveApi<NewsPayload>('/api/news', { channels: ['news'] });
  const stats = useLiveApi<StatsPayload>('/api/stats', { channels: ['data'] });

  const articles = news.data?.articles?.slice(0, 5) ?? [];
  const greeting = t(`dashboard.greeting.${getTimeOfDay()}`);

  useEffect(() => {
    document.title = 'DOR101 — Dorchester resources, live';
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Masthead */}
        <header>
          <p className="kicker">{formatFor.date(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-large md:text-5xl font-bold tracking-tight text-1 mt-1 text-balance">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-title3 text-text-2 mt-2 max-w-2xl leading-snug text-balance">
            {t('dashboard.tagline')}
          </p>
          <p className="text-subhead text-text-2 mt-3 flex items-center gap-2">
            <span className="font-semibold text-1">{greeting}.</span>
            <span className="inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider text-success">
              <RadioTower className="w-3 h-3" aria-hidden />
              {t('dashboard.liveBadge')}
            </span>
          </p>
        </header>

        <EmergencyBanner />

        {/* Live stats + transit */}
        <section aria-label={t('dashboard.glance')} className="grid lg:grid-cols-[1fr_320px] gap-4">
          <div>
            <div className="flex items-end justify-between mb-2.5">
              <h2 className="text-title2 font-bold text-1">{t('dashboard.glance')}</h2>
            </div>
            {stats.loading && (
              <div className="grid sm:grid-cols-2 gap-2.5" aria-hidden>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-28" />
                ))}
              </div>
            )}
            {stats.error && !stats.data && (
              <div role="alert" className="content-card squircle p-4">
                <p className="text-subhead font-semibold text-1">{t('common.error')}</p>
                <p className="text-footnote text-text-2 mt-1">{t('common.errorHint')}</p>
              </div>
            )}
            {stats.data?.stats && (
              <div className="grid sm:grid-cols-2 gap-2.5">
                {stats.data.stats.map((s) => (
                  <StatCard
                    key={s.id}
                    label={s.label}
                    value={
                      s.format === 'currency'
                        ? formatFor.currency(s.value)
                        : s.format === 'percent'
                          ? formatFor.percent(s.value / 100)
                          : formatFor.number(s.value)
                    }
                    trend={typeof s.trend === 'number' ? { value: s.trend, direction: s.trend >= 0 ? 'up' : 'down' } : undefined}
                    source={s.source}
                    sourceDate={s.sourceDate}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <LiveTransit compact />
            <Link
              href="/college-access"
              className="content-card squircle group flex items-start gap-3 p-4 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <span className="w-9 h-9 rounded-full grid place-items-center bg-[var(--surface-2)] shrink-0">
                <GraduationCap className="w-4.5 h-4.5 text-1" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-subhead font-bold text-1">{t('college.title')}</span>
                <span className="block text-caption text-text-2 mt-0.5 leading-snug">{t('college.description')}</span>
              </span>
              <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-text-3 group-hover:text-1 transition-colors rtl:rotate-180" aria-hidden />
            </Link>
          </div>
        </section>

        {/* Quick actions */}
        <section aria-label={t('dashboard.quickAccess')}>
          <h2 className="text-title2 font-bold text-1 mb-2.5">{t('dashboard.quickAccess')}</h2>
          <QuickLinks />
        </section>

        {/* News + spotlight */}
        <section className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
          <div>
            <div className="flex items-end justify-between mb-2.5">
              <h2 className="text-title2 font-bold text-1">{t('dashboard.latestNews')}</h2>
              <Link href="/news" className="text-footnote font-semibold text-text-2 hover:text-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded">
                {t('dashboard.viewAll')} →
              </Link>
            </div>
            {news.loading && articles.length === 0 && (
              <div className="space-y-2.5" aria-hidden>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-16" />
                ))}
              </div>
            )}
            {!news.loading && articles.length === 0 && (
              <div className="content-card squircle p-6 text-center">
                <p className="text-subhead font-semibold text-1">{t('common.empty')}</p>
                <p className="text-footnote text-text-2 mt-1">{t('news.offline')}</p>
              </div>
            )}
            <ul className="space-y-0">
              {articles.map((a, idx) => (
                <li key={a.id} className="border-b border-separator last:border-0">
                  <a
                    href={newsSourceUrl(a)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 py-3 group focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current rounded-lg"
                  >
                    <span className="text-caption2 font-bold uppercase tracking-wider text-text-3 w-20 shrink-0 pt-1 num">
                      {formatFor.relative(a.publishedAt)}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-subhead font-semibold text-1 leading-snug group-hover:underline underline-offset-2">
                        {a.title}
                      </span>
                      <span className="block text-caption text-text-3 mt-0.5">
                        {a.source} · {a.category}
                      </span>
                    </span>
                    {idx === 0 && (
                      <span className="ms-auto shrink-0 text-caption2 font-bold uppercase tracking-wider text-success pt-1">
                        {t('news.new')}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <aside className="content-card squircle p-5 self-start" aria-label="RAFT">
            <p className="kicker">RAFT</p>
            <p className="text-title2 font-bold text-1 mt-1 num">
              {formatFor.currency(RAFT_PROGRAM.maxBenefit)}
              <span className="text-subhead font-medium text-text-2"> / {RAFT_PROGRAM.period}</span>
            </p>
            <p className="text-footnote text-text-2 mt-2 leading-relaxed">{RAFT_PROGRAM.note}</p>
            <a
              href={RAFT_PROGRAM.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-subhead font-semibold text-1 hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded"
            >
              {t('common.apply')} <ArrowRight className="w-4 h-4 rtl:rotate-180" aria-hidden />
            </a>
            <p className="text-caption2 text-text-3 mt-3">
              {t('common.source')}: {RAFT_PROGRAM.source}
            </p>
          </aside>
        </section>

        {/* Map preview */}
        <section aria-label={t('dashboard.mapTitle')}>
          <div className="flex items-end justify-between mb-2.5">
            <h2 className="text-title2 font-bold text-1">{t('dashboard.mapTitle')}</h2>
            <Link href="/map" className="text-footnote font-semibold text-text-2 hover:text-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current rounded">
              {t('dashboard.viewFullMap')} →
            </Link>
          </div>
          <div className="content-card squircle overflow-hidden">
            <DorchesterMap height="300px" showControls={false} preview />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

function newsSourceUrl(a: { sourceUrl: string }): string {
  return a.sourceUrl || '/news';
}
