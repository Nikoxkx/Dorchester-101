'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { StatCard } from '@/components/dashboard/StatCard';
import { RedLineStrip } from '@/components/transit/RedLineStrip';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { ReportGenerator } from '@/components/features/ReportGenerator';
import { getTimeOfDay, localeForLanguage } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/stores/appStore';
import { useApi } from '@/hooks/useApi';
import {
  BHA_STATUS,
  HUD_FMR_FY2026,
  LIHEAP,
  MBTA_FARES,
  PROGRAM_META,
  RAFT_PROGRAM,
  SNAP_FY2026,
} from '@/data/programs';
import { ArrowRight, Phone, ShieldCheck } from 'lucide-react';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  { ssr: false, loading: () => <div className="h-64 bg-[var(--wax)] flex items-center justify-center rounded-xl"><LoadingSpinner /></div> },
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
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const news = useApi<NewsPayload>('/api/news');
  const stats = useApi<StatsPayload>('/api/stats');

  const today = useMemo(
    () => new Date().toLocaleDateString(localeForLanguage(language), {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    [language],
  );

  const greeting = t(`dashboard.greeting.${getTimeOfDay()}`);
  const articles = news.data?.articles?.slice(0, 4) || [];

  const board = [
    {
      label: 'BHA Section 8 · tenant-based',
      value: BHA_STATUS.section8TenantBased === 'closed' ? 'Closed' : 'Open',
      tone: 'red' as const,
      note: 'Public housing + project-based lists remain open.',
      href: '/affordable-housing',
      cta: 'Housing desk',
    },
    {
      label: 'RAFT · emergency rent help',
      value: '$7,000',
      tone: 'green' as const,
      note: `Max benefit in 12 months · as of ${PROGRAM_META.lastReviewed}.`,
      href: RAFT_PROGRAM.sourceUrl,
      cta: 'mass.gov/raft',
      external: true,
    },
    {
      label: '2BR Fair Market Rent · FY2026',
      value: '$2,941',
      tone: 'default' as const,
      note: 'HUD Boston-metro FMR. Check the calculator before you apply.',
      href: '/tools',
      cta: 'Rent calculator',
    },
    {
      label: 'SNAP · 4-person maximum',
      value: '$994',
      tone: 'default' as const,
      note: 'Per month, FY2026 · most Dorchester households qualify at 200% FPL.',
      href: '/food',
      cta: 'Food desk',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-10">
        {/* Masthead */}
        <header className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-end pb-6 border-b border-[var(--line)]">
          <div>
            <p className="kicker mb-4">{today}</p>
            <h1 className="font-display text-[clamp(3rem,7vw,5.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">
              Dorchester
              <br />
              <span className="text-[var(--red)]">101</span>
            </h1>
            <p className="font-display text-xl md:text-2xl font-semibold text-[var(--ink)] mt-4">
              Your neighborhood. Your rights. Your future.
            </p>
            <p className="text-[var(--ink-soft)] mt-3 max-w-xl leading-relaxed">
              {greeting}. One desk for the whole Dot: income-restricted housing, food pantries,
              rent help, the Red Line, and tenant rights — with phone numbers, dated sources,
              and zero accounts. In nine languages.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link href="/affordable-housing" className="cta cta-primary cta-lg">
                Find housing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/food" className="cta cta-outline cta-lg">
                Food today
              </Link>
              <Link href="/map" className="cta cta-outline cta-lg">
                Map &amp; transit
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-5 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> No account · no tracking</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Real numbers, dated sources</span>
            </div>
          </div>

          {/* On the desk today */}
          <aside className="desk-card p-5 space-y-1" aria-label="On the desk today">
            <div className="flex items-center justify-between mb-2">
              <p className="kicker">On the desk today</p>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">Verified {PROGRAM_META.lastReviewed}</span>
            </div>
            {board.map((row) => (
              <div key={row.label} className="border-t border-[var(--line)] py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-bold">{row.label}</p>
                  <p className="text-sm text-[var(--ink-soft)] mt-0.5">{row.note}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-xl font-extrabold text-[var(--charcoal)] block leading-none mt-0.5">{row.value}</span>
                  {row.href && (
                    <Link
                      href={row.href}
                      {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="text-[11px] font-bold underline underline-offset-2 hover:text-[var(--red)]"
                    >
                      {row.cta}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </aside>
        </header>

        <EmergencyBanner />

        {/* Numbers at a glance */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">{t('dashboard.glance')}</h2>
            <DataRefreshIndicator lastUpdated={stats.loading ? null : 'sourced'} isRefreshing={stats.loading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(stats.data?.stats || []).slice(0, 4).map((s) => (
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
            {t('dashboard.footer.line2')} <Link href="/market-trends" className="underline hover:text-[var(--red)]">Rent &amp; sale estimates</Link> · BHA status: {BHA_STATUS.section8TenantBased === 'closed' ? 'Section 8 closed' : 'Section 8 open'}, public housing {BHA_STATUS.publicHousing} ({BHA_STATUS.asOf}).
          </p>
        </section>

        <QuickLinks />

        {/* Two-up: news + transit */}
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
          <section className="desk-card p-5">
            <div className="flex items-end justify-between border-b border-[var(--line)] pb-3 mb-2">
              <h2 className="font-display text-2xl font-extrabold">{t('dashboard.latestNews')}</h2>
              <Link href="/news" className="text-sm font-bold underline underline-offset-2 hover:text-[var(--red)]">{t('dashboard.viewAll')}</Link>
            </div>
            {news.loading && <LoadingSpinner text={t('common.loading')} />}
            {!news.loading && articles.length === 0 && (
              <p className="text-sm text-[var(--muted)] py-6">Feeds are quiet right now — try the Dorchester Reporter directly.</p>
            )}
            <ul>
              {articles.map((a) => (
                <li key={a.id} className="py-3 border-b border-[var(--line)] last:border-0">
                  <Link href="/news" className="group block">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="red">{a.category}</Badge>
                      <span className="text-[11px] text-[var(--muted)]">{a.source}</span>
                    </div>
                    <p className="font-display text-base md:text-lg font-semibold leading-snug group-hover:text-[var(--red)] transition-colors">{a.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-6">
            <aside className="desk-card p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="kicker">Red Line · Ashmont branch</p>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)]">{MBTA_FARES.asOf}</span>
              </div>
              <RedLineStrip />
              <p className="text-sm mt-2">
                Subway {`$${MBTA_FARES.subway.toFixed(2)}`} · bus {`$${MBTA_FARES.localBus.toFixed(2)}`} · monthly LinkPass {`$${MBTA_FARES.monthlyLink}`}
                <Link href="/map" className="block mt-2 font-bold underline underline-offset-2 hover:text-[var(--red)]">{t('dashboard.viewFullMap')} →</Link>
              </p>
            </aside>

            <aside className="bg-[var(--charcoal)] text-[var(--paper)] p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-[11px] font-display font-bold uppercase tracking-[0.18em] text-[#E8B54A]">Heat this winter · LIHEAP</p>
                <p className="font-display text-lg font-bold leading-snug">{LIHEAP.applyOrg} — {LIHEAP.applyPhone}</p>
                <p className="text-sm text-[var(--ink-soft)] mt-1 opacity-90">{LIHEAP.season} · shut-off protection Nov 15–Mar 15</p>
              </div>
              <a href={LIHEAP.sourceUrl} target="_blank" rel="noreferrer" className="cta cta-primary cta-md shrink-0">
                Apply <ArrowRight className="w-4 h-4" />
              </a>
            </aside>
          </div>
        </div>

        {/* Snapshot report */}
        <ReportGenerator />

        {/* Map */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">{t('dashboard.mapTitle')}</h2>
            <Link href="/map" className="text-sm font-bold underline underline-offset-2 hover:text-[var(--red)]">{t('dashboard.viewFullMap')}</Link>
          </div>
          <div className="border border-[var(--line)] rounded-xl overflow-hidden">
            <DorchesterMap height="300px" showControls={false} preview />
          </div>
          <p className="text-[11px] text-[var(--muted)] mt-2">Live MBTA predictions refresh every 30 s. Pins point to pantries, clinics, legal aid, and community orgs across the Dot.</p>
        </section>
      </div>
    </MainLayout>
  );
}
