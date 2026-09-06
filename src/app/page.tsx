'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { StatCard } from '@/components/dashboard/StatCard';
import { RedLineStrip } from '@/components/transit/RedLineStrip';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { ReportGenerator } from '@/components/features/ReportGenerator';
import { getTimeOfDay, localeForLanguage } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/stores/appStore';
import { useApi } from '@/hooks/useApi';
import {
  BHA_STATUS,
  LIHEAP,
  MBTA_FARES,
  PROGRAM_META,
  RAFT_PROGRAM,
  SNAP_FY2026,
  HUD_FMR_FY2026,
} from '@/data/programs';
import { ArrowRight, PhoneIcon, ShieldIcon, ExternalIcon } from '@/components/ui/icons';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  { ssr: false, loading: () => <div className="h-72 bg-[var(--wax)] flex items-center justify-center"><LoadingSpinner /></div> },
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
  const articles = news.data?.articles?.slice(0, 5) || [];

  const board = [
    {
      label: 'BHA Section 8 · tenant-based',
      value: BHA_STATUS.section8TenantBased === 'closed' ? 'Closed' : 'Open',
      chip: BHA_STATUS.section8TenantBased === 'closed' ? 'bg-[var(--red)]' : 'bg-[var(--green)]',
      note: 'Public housing + project-based lists remain open.',
      href: '/affordable-housing',
      cta: 'Housing',
      asOf: `BHA · ${BHA_STATUS.asOf}`,
    },
    {
      label: 'RAFT · emergency rent help',
      value: `$${RAFT_PROGRAM.maxBenefit.toLocaleString()}`,
      chip: 'bg-[var(--blue)]',
      note: `Maximum benefit over 12 months.`,
      href: RAFT_PROGRAM.sourceUrl,
      cta: 'mass.gov',
      external: true,
      asOf: `Reviewed ${PROGRAM_META.lastReviewed}`,
    },
    {
      label: '2BR Fair Market Rent · FY2026',
      value: `$${HUD_FMR_FY2026.twoBed.toLocaleString()}`,
      chip: 'bg-[var(--charcoal)]',
      note: 'HUD Boston-metro FMR — what a voucher will cover.',
      href: '/tools',
      cta: 'Calculator',
      asOf: `HUD · ${PROGRAM_META.lastReviewed}`,
    },
    {
      label: 'SNAP · 4-person household',
      value: `$${SNAP_FY2026.maxMonthly[4].toLocaleString()}`,
      chip: 'bg-[var(--green)]',
      note: 'Per month. Most Dorchester households qualify at 200% FPL.',
      href: '/food',
      cta: 'Food',
      asOf: `USDA · FY2026`,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-14 md:space-y-16">
        {/* ── Masthead ─────────────────────────────────────── */}
        <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-10 lg:gap-14 items-end border-b-2 border-[var(--charcoal)] pb-10 md:pb-12">
          <div>
            <p className="masthead-date mb-4">
              Dorchester, Boston — {today}
            </p>
            <h1 className="font-display font-bold uppercase leading-[0.92] tracking-[0.005em] text-[clamp(2.7rem,6vw,5rem)] text-[var(--charcoal)]">
              Every program<br />
              that touches your<br />
              <span className="text-[#1748e2] dark:text-[#6f96ff]">address book</span>
            </h1>
            <p className="text-[15.5px] md:text-[17px] text-[var(--ink)] mt-5 max-w-xl leading-relaxed">
              {greeting} DOR101 is Dorchester&apos;s own directory: income-restricted housing,
              food pantries, rent help, the Red Line, and tenant rights — listed with the
              agency that runs each program, its real phone number, and the date it was last
              verified. Free, in nine languages, no account.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-7">
              <Link href="/affordable-housing" className="cta cta-primary cta-lg">
                Find housing <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/food" className="cta cta-outline cta-lg">
                Food today
              </Link>
              <Link href="/map" className="cta cta-outline cta-lg">
                Open the map
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-1.5 mt-6 text-[12px] text-[var(--muted)]">
              <li className="inline-flex items-center gap-1.5"><ShieldIcon className="w-3.5 h-3.5" /> No account · no tracking</li>
              <li className="inline-flex items-center gap-1.5"><PhoneIcon className="w-3.5 h-3.5" /> Real numbers, dated sources</li>
              <li className="inline-flex items-center gap-1.5">9 languages</li>
            </ul>
          </div>

          {/* Program status board */}
          <aside className="desk-panel-ink" aria-label="Program status">
            <div className="px-5 py-3 border-b border-[var(--paper)]/15 flex items-baseline justify-between gap-3">
              <h2 className="font-display font-bold uppercase tracking-[0.08em] text-[15px] text-[var(--paper)]">
                Program status
              </h2>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--paper)]/55">
                {PROGRAM_META.lastReviewed}
              </span>
            </div>
            <ul>
              {board.map((row) => (
                <li key={row.label} className="border-b border-[var(--paper)]/10 last:border-0">
                  <div className="px-5 py-3.5 grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2">
                        <span className={`w-2 h-2 shrink-0 ${row.chip}`} aria-hidden="true" />
                        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[var(--paper)]/60 truncate">
                          {row.label}
                        </span>
                      </p>
                      <p className="text-[11.5px] text-[var(--paper)]/65 mt-1 leading-snug">{row.note}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="stat-num text-[1.55rem] text-[var(--paper)]">{row.value}</p>
                      {row.href && (
                        <Link
                          href={row.href}
                          {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--yellow)] hover:underline underline-offset-2 mt-1"
                        >
                          {row.cta} {row.external && <ExternalIcon className="w-2.5 h-2.5" />}
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <EmergencyBanner />

        {/* ── Numbers at a glance ──────────────────────────── */}
        <section aria-labelledby="glance-title">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-2.5 mb-5">
            <h2 id="glance-title" className="font-display font-bold uppercase tracking-[0.02em] text-[1.5rem] md:text-[1.85rem]">
              {t('dashboard.glance')}
            </h2>
            <DataRefreshIndicator lastUpdated={stats.loading ? null : 'sourced'} isRefreshing={stats.loading} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            {t('dashboard.footer.line2')}{' '}
            <Link href="/market-trends" className="underline underline-offset-2 hover:text-[var(--blue)]">Rent &amp; sale estimates</Link>
            {' · '}Section 8 {BHA_STATUS.section8TenantBased === 'closed' ? 'closed' : 'open'}, public housing {BHA_STATUS.publicHousing} ({BHA_STATUS.asOf}).
          </p>
        </section>

        <QuickLinks />

        {/* ── Two-up: news + transit rail ──────────────────── */}
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <section aria-labelledby="news-title" className="border-t-4 border-[var(--charcoal)]">
            <div className="flex items-end justify-between gap-4 pt-3 pb-4">
              <h2 id="news-title" className="font-display font-bold uppercase tracking-[0.02em] text-[1.5rem] md:text-[1.85rem]">
                {t('dashboard.latestNews')}
              </h2>
              <Link href="/news" className="cta cta-outline cta-sm">
                {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {news.loading && <div className="py-10"><LoadingSpinner text={t('common.loading')} /></div>}
            {!news.loading && articles.length === 0 && (
              <p className="text-sm text-[var(--muted)] py-8 border-t border-[var(--line)]">
                Feeds are quiet right now — try the Dorchester Reporter directly.
              </p>
            )}
            <ol className="border-t border-[var(--line)]">
              {articles.map((a, i) => (
                <li key={a.id} className="border-b border-[var(--line)]">
                  <Link href="/news" className="group grid grid-cols-[auto_1fr] gap-4 py-3.5 items-baseline">
                    <span className="font-mono text-[11px] text-[var(--blue)] w-6 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="block text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--muted)] mb-1">
                        {a.category} — {a.source}
                      </span>
                      <span className="font-display text-[1.08rem] md:text-[1.2rem] font-semibold leading-snug group-hover:text-[var(--blue)] transition-colors">
                        {a.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          <div className="grid gap-8">
            <aside className="border border-[var(--line)]" aria-label="Red Line">
              <div className="flex items-center justify-between px-5 pt-4 pb-2.5">
                <h3 className="kicker">Red Line · Ashmont branch</h3>
                <span className="masthead-date">{MBTA_FARES.asOf}</span>
              </div>
              <div className="px-5 pb-4">
                <RedLineStrip />
                <ul className="mt-3 text-[13px] space-y-1.5 text-[var(--ink-soft)]">
                  <li>Subway fare — ${MBTA_FARES.subway.toFixed(2)}</li>
                  <li>Local bus fare — ${MBTA_FARES.localBus.toFixed(2)}</li>
                  <li>Monthly LinkPass — ${MBTA_FARES.monthlyLink}</li>
                </ul>
                <Link href="/map" className="cta cta-outline cta-sm mt-4">
                  {t('dashboard.viewFullMap')} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            <aside className="desk-panel-ink" aria-label="Heating assistance">
              <div className="px-5 py-4 border-b border-[var(--paper)]/15 flex items-center justify-between gap-3">
                <h3 className="font-display font-bold uppercase tracking-[0.1em] text-[15px] text-[var(--paper)]">
                  Heat this winter
                </h3>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--paper)]/55">LIHEAP</span>
              </div>
              <div className="px-5 py-4">
                <p className="text-[var(--paper)]/85 text-sm leading-relaxed">
                  <span className="text-[var(--yellow)] font-semibold">{LIHEAP.applyOrg}</span> — {LIHEAP.applyPhone}.
                  {' '}{LIHEAP.season}. Shut-off protection runs Nov 15 – Mar 15.
                </p>
                <a href={LIHEAP.sourceUrl} target="_blank" rel="noreferrer" className="cta cta-yellow cta-md mt-4">
                  Apply for LIHEAP <ExternalIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Snapshot report ──────────────────────────────── */}
        <ReportGenerator />

        {/* ── Map preview ──────────────────────────────────── */}
        <section aria-labelledby="map-title">
          <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-2.5 mb-5">
            <h2 id="map-title" className="font-display font-bold uppercase tracking-[0.02em] text-[1.5rem] md:text-[1.85rem]">
              {t('dashboard.mapTitle')}
            </h2>
            <Link href="/map" className="cta cta-outline cta-sm">
              {t('dashboard.viewFullMap')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="border border-[var(--line)]">
            <DorchesterMap height="320px" showControls={false} preview />
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mt-2">
            Live MBTA predictions refresh every 30 s. Pins mark pantries, clinics, legal aid,
            and community organizations across Dorchester.
          </p>
        </section>
      </div>
    </MainLayout>
  );
}
