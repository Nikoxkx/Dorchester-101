'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  BarChart3,
  CircleAlert,
  DollarSign,
  ExternalLink,
  Home,
  Info,
  LineChart as LineChartIcon,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { Cite, SourceMark } from '@/components/sources/SourceMark';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { useLivePolling } from '@/hooks/useLivePolling';
import { useReduceMotion } from '@/stores/appStore';
import type { TranslationKey } from '@/i18n/en';
import type { MarketResponse } from '@/app/api/market-data/route';

/**
 * Market trends.
 *
 * Every chart on this page is drawn from `/api/market-data`, which reads the
 * Census Bureau's ACS tables for Suffolk County and, when
 * an operator has installed it, HUD's Fair Market Rent table. Under each chart
 * is a sentence saying what it shows and what it does not, and a citation with
 * the table id, because a chart without a table id cannot be checked.
 */

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FMR_ORDER: Array<{ keys: string[]; label: TranslationKey }> = [
  { keys: ['0', 'studio', 'efficiency'], label: 'market.studio' },
  { keys: ['1', 'oneBed', 'one'], label: 'market.oneBed' },
  { keys: ['2', 'twoBed', 'two'], label: 'market.twoBed' },
  { keys: ['3', 'threeBed', 'three'], label: 'market.threeBed' },
  { keys: ['4', 'fourBed', 'four'], label: 'market.fourBed' },
];

const PORTAL_KEYS: Record<string, TranslationKey> = {
  'https://www.boston.gov/metrolist': 'market.portalMetro',
  'https://housingnavigatorma.org': 'market.portalNavigator',
  'https://www.mymasshome.org': 'market.portalHome',
  'https://www.bostonhousing.org': 'market.portalBha',
};

const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'var(--color-bg-raised)',
  border: '1px solid var(--color-border-strong)',
  borderRadius: '10px',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-heading)',
  fontSize: 12,
  boxShadow: 'var(--shadow-md)',
};

export default function MarketTrendsPage() {
  const { t, format, lang } = useI18n();
  const reduceMotion = useReduceMotion();
  const [data, setData] = useState<MarketResponse | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [trendMetric, setTrendMetric] = useState<'rent' | 'income' | 'value' | 'burden'>('rent');

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/market-data');
      if (!response.ok) throw new Error(String(response.status));
      const json = (await response.json()) as MarketResponse;
      setData(json);
      setLastUpdated(new Date().toISOString());
      setState('ready');
    } catch {
      setState((prev) => (prev === 'ready' ? prev : 'error'));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useLivePolling(load, { minMs: 15 * 60_000 });

  /* ── Derived chart series (hooks must run before any early return) ── */
  const series = useMemo(() => data?.series.points ?? [], [data]);

  const affordabilitySeries = useMemo(
    () =>
      series
        .filter((p) => p.medianGrossRent !== null && p.medianIncome !== null)
        .map((p) => ({
          year: p.year,
          vintage: p.vintage,
          rent: p.medianGrossRent as number,
          // What 30% of the median household income buys per month.
          affordable: Math.round(((p.medianIncome as number) * 0.3) / 12),
          gap: Math.max(0, (p.medianGrossRent as number) - Math.round(((p.medianIncome as number) * 0.3) / 12)),
        })),
    [series]
  );

  const indexed = useMemo(() => {
    const base = series.find((p) => p.medianGrossRent && p.medianIncome && p.medianHomeValue);
    if (!base) return [];
    return series.map((p) => ({
      year: p.year,
      vintage: p.vintage,
      rent: p.medianGrossRent && base.medianGrossRent ? Math.round((p.medianGrossRent / base.medianGrossRent) * 100) : null,
      income: p.medianIncome && base.medianIncome ? Math.round((p.medianIncome / base.medianIncome) * 100) : null,
      value: p.medianHomeValue && base.medianHomeValue ? Math.round((p.medianHomeValue / base.medianHomeValue) * 100) : null,
    }));
  }, [series]);

  if (state === 'loading') {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text={t('common.loading')} />
        </div>
      </MainLayout>
    );
  }

  if (state === 'error' || !data) {
    return (
      <MainLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
          <CircleAlert className="h-10 w-10 text-[var(--color-accent-secondary)]" aria-hidden="true" />
          <h1 className="font-display text-2xl font-bold">{t('error.dataUnavailable')}</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('error.dataUnavailableBody')}</p>
          <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('common.retry')}
          </button>
        </div>
      </MainLayout>
    );
  }

  const { acs, hudFmr, ami, derived, listings } = data;
  const m = acs.metrics;
  const acsLive = acs.status !== 'unavailable';
  const money = (v: number | null | undefined) => (v === null || v === undefined ? '—' : format.currency(v));
  const pct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : format.percent(v / 100, 1));
  const asOf = acsLive ? format.date(acs.retrievedAt, 'medium') : undefined;
  const animate = !reduceMotion;
  const localVintage = (value: string) => t('market.vintage', {
    years: value.replace(/^ACS 5-year\s*/, '').replace(/\d{4}/g, (year) => format.year(Number(year))),
  });
  // Known endpoint descriptions are translated, while a capture is never
  // described as a live read. Unknown future sources retain the citation link.
  const accessKey: TranslationKey | undefined = acs.snapshot ? 'market.accessSnapshot'
    : acs.access?.startsWith('api.census.gov') ? 'market.accessApi'
      : acs.access?.startsWith('data.census.gov') ? 'market.accessSite'
        : acs.access?.startsWith('api.censusreporter.org') ? 'market.accessReporter'
          : undefined;
  const fiscalYear = hudFmr.status === 'available' ? t('market.fiscalYear', { year: format.year(Number(hudFmr.fiscalYear)) }) : '';
  const hasAmiValues = Object.keys(ami.table).length > 0;

  const fmrRows =
    hudFmr.status === 'available'
      ? FMR_ORDER.map((row) => {
          const key = row.keys.find((k) => k in hudFmr.units);
          return key ? { name: t(row.label), rent: hudFmr.units[key] } : null;
        }).filter((r): r is { name: string; rent: number } => r !== null)
      : [];

  const first = series[0];
  const last = series[series.length - 1];
  const change = (a: number | null, b: number | null) => (a && b ? Math.round(((b - a) / a) * 1000) / 10 : null);
  const rentChange = first && last ? change(first.medianGrossRent, last.medianGrossRent) : null;
  const incomeChange = first && last ? change(first.medianIncome, last.medianIncome) : null;
  const valueChange = first && last ? change(first.medianHomeValue, last.medianHomeValue) : null;

  const metrics: Array<{ icon: React.ReactNode; label: string; value: string; note: string; delta: number | null }> = [
    { icon: <DollarSign className="h-5 w-5" aria-hidden="true" />, label: t('market.rentLabel'), value: money(m.medianGrossRent), note: t('market.rentNote'), delta: rentChange },
    { icon: <Home className="h-5 w-5" aria-hidden="true" />, label: t('market.homeLabel'), value: money(m.medianHomeValue), note: t('market.homeNote'), delta: valueChange },
    { icon: <Users className="h-5 w-5" aria-hidden="true" />, label: t('market.incomeLabel'), value: money(m.medianIncome), note: t('market.incomeNote'), delta: incomeChange },
    { icon: <Percent className="h-5 w-5" aria-hidden="true" />, label: t('market.renterLabel'), value: pct(m.renterShare), note: t('market.renterNote'), delta: null },
  ];

  const trendKey = { rent: 'medianGrossRent', income: 'medianIncome', value: 'medianHomeValue', burden: 'medianRentBurden' }[trendMetric] as
    | 'medianGrossRent'
    | 'medianIncome'
    | 'medianHomeValue'
    | 'medianRentBurden';
  const trendLabel = { rent: t('market.rentAxis'), income: t('market.incomeAxis'), value: t('market.homeAxis'), burden: t('market.burdenAxis') }[trendMetric];
  const trendFormatter = (v: number) => (trendMetric === 'burden' ? format.percent(v / 100, 1) : format.currency(v));
  const trendSeries = series.filter((p) => p[trendKey] !== null).map((p) => ({ year: p.year, vintage: p.vintage, value: p[trendKey] as number }));

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="mx-auto max-w-7xl space-y-8 pb-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl space-y-2">
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold md:text-4xl">
              <TrendingUp className="h-8 w-8 text-[var(--color-accent-primary)]" aria-hidden="true" />
              {t('market.title')}
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              {t('market.geographyIntro')}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t('market.noListings')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DataRefreshIndicator lastUpdated={lastUpdated} isRefreshing={refreshing} />
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
              aria-label={t('common.refresh')}
              title={t('common.refresh')}
            >
              <RefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} aria-hidden="true" />
            </button>
          </div>
        </header>

        {lang !== 'en' && <p role="note" className="text-xs text-[var(--color-text-muted)]">{t('lang.someEnglish')}</p>}

        {!acsLive && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 p-4 text-sm">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
            <div>
              <p className="font-heading font-semibold">{t('error.dataUnavailable')}</p>
              <p className="text-[var(--color-text-secondary)]">
                {t('market.noCensus')}
              </p>
            </div>
          </div>
        )}

        {/* ── Snapshot ─────────────────────────────────────────── */}
        <section aria-labelledby="snapshot">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 id="snapshot" className="font-heading text-lg font-bold sm:text-xl">{t('market.currentSnapshot')}</h2>
            <Badge variant={acs.status === 'live' ? 'green' : acs.status === 'cache' ? 'amber' : acs.status === 'snapshot' ? 'amber' : 'red'}>
              {acs.status === 'live'
                ? t('market.liveCensus')
                : acs.status === 'cache'
                  ? t('market.cachedCopy')
                  : acs.status === 'snapshot'
                    ? t('market.verifiedCapture')
                    : t('market.unavailable')}
            </Badge>
            <span className="text-xs text-[var(--color-text-muted)]">{t('market.geographyLabel')} · {localVintage(acs.vintage)}</span>
          </div>
          {acs.snapshot && (
            <p role="status" className="mb-3 flex items-start gap-2 rounded-xl border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
              <span>
                {t('market.snapshotNotice', { vintage: localVintage(acs.vintage), date: format.date(acs.retrievedAt, 'medium') })}
              </span>
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="dor101-glass">
                <CardContent className="py-1">
                  <div className="mb-3 flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-accent-primary)]" style={{ background: 'color-mix(in srgb, var(--color-accent-primary) 14%, transparent)' }} aria-hidden="true">
                      {metric.icon}
                    </span>
                    {metric.delta !== null && first && last && (
                      <span className={cn('font-heading text-[11px] font-semibold', metric.delta >= 0 ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-accent-green)]')} title={t('market.changeTooltip', { first: localVintage(first.vintage), last: localVintage(last.vintage) })}>
                        {t('market.since', { change: `${metric.delta >= 0 ? '+' : ''}${format.percent(metric.delta / 100, 1)}`, year: format.year(first.year) })}
                      </span>
                    )}
                  </div>
                  <p className={cn('font-mono text-2xl font-bold', metric.value === '—' && 'text-[var(--color-text-muted)]')}>{metric.value}</p>
                  <p className="mt-1 font-heading text-sm text-[var(--color-text-muted)]">{metric.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{metric.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Cite
            id="census"
            asOf={asOf}
            note={`${localVintage(acs.vintage)} · ${t('market.tables', { ids: 'B25064, B25077, B19013, B25003' })}${accessKey ? ` · ${t(accessKey)}` : ''}`}
            href={acs.citation.url}
            className="mt-2"
          />
        </section>

        {/* ── Trend over vintages ──────────────────────────────── */}
        <Card>
          <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
              {t('market.estimatesOverTime')}
            </CardTitle>
            <div role="tablist" aria-label={t('market.metric')} className="flex flex-wrap gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/60 p-1">
              {(
                [
                  ['rent', t('market.rentTab')],
                  ['income', t('market.incomeTab')],
                  ['value', t('market.homeTab')],
                  ['burden', t('market.burdenTab')],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={trendMetric === key}
                  onClick={() => setTrendMetric(key)}
                  className={cn(
                    'rounded-full px-3 py-1 font-heading text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                    trendMetric === key ? 'bg-[var(--color-accent-primary)] text-white shadow-sm' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {trendSeries.length >= 3 ? (
              <>
                <div className="h-[280px] sm:h-[320px]" role="img" aria-label={t('market.periodChart', { metric: trendLabel, first: localVintage(trendSeries[0].vintage), last: localVintage(trendSeries[trendSeries.length - 1].vintage) })}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="year" tickFormatter={(value: number) => format.year(value)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        tickLine={false}
                        axisLine={false}
                        width={trendMetric === 'burden' ? 40 : 64}
                        tickFormatter={(v: number) => (trendMetric === 'burden' ? format.percent(v / 100) : format.currency(v))}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={(_, payload) => localVintage(payload?.[0]?.payload?.vintage ?? '')}
                        formatter={(value) => [trendFormatter(Number(value)), trendLabel]}
                      />
                      {trendMetric === 'burden' && <ReferenceLine y={30} stroke="var(--color-accent-secondary)" strokeDasharray="4 4" label={{ value: t('market.affordabilityLine'), position: 'insideTopLeft', fill: 'var(--color-accent-secondary)', fontSize: 11 }} />}
                      <Area type="monotone" dataKey="value" stroke="var(--color-accent-primary)" strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 3, strokeWidth: 2, fill: 'var(--color-bg-raised)' }} activeDot={{ r: 5 }} isAnimationActive={animate} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {t('market.trendExplain')}
                  {trendMetric === 'burden' && ` ${t('market.trendBurdenExplain')}`}
                </p>
                <Cite id="census" asOf={asOf} note={t('market.seriesTables', { ids: 'B25064, B19013, B25077, B25071', years: `${format.year(trendSeries[0].year)}–${format.year(trendSeries[trendSeries.length - 1].year)}` })} className="mt-2" />
              </>
            ) : (
              <EmptyChart />
            )}
          </CardContent>
        </Card>

        {/* ── Affordability gap + indexed growth ───────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[var(--color-accent-secondary)]" aria-hidden="true" />
                {t('market.budgetChartTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {affordabilitySeries.length >= 3 ? (
                <>
                  <div className="h-[260px]" role="img" aria-label={t('market.budgetChartAria')}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={affordabilitySeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="year" tickFormatter={(value: number) => format.year(value)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => format.currency(v)} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [format.currency(Number(value)), name === 'rent' ? t('market.rentLabel') : name === 'affordable' ? t('market.affordableIncome') : t('market.monthlyGap')]} labelFormatter={(_, p) => localVintage(p?.[0]?.payload?.vintage ?? '')} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'rent' ? t('market.rentLabel') : v === 'affordable' ? t('market.affordableIncome') : t('market.monthlyGap'))} />
                        <Bar dataKey="gap" fill="var(--color-accent-secondary)" fillOpacity={0.25} radius={[4, 4, 0, 0]} isAnimationActive={animate} />
                        <Line type="monotone" dataKey="rent" stroke="var(--color-accent-secondary)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={animate} />
                        <Line type="monotone" dataKey="affordable" stroke="var(--color-accent-green)" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3 }} isAnimationActive={animate} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {t('market.affordabilityExplain')}
                  </p>
                  <Cite id="census" asOf={asOf} note={t('market.derivedTables', { ids: 'B25064, B19013' })} className="mt-2" />
                </>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
                {t('market.growthChartTitle', { year: indexed[0] ? format.year(indexed[0].year) : '—' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {indexed.length >= 3 ? (
                <>
                  <div className="h-[260px]" role="img" aria-label={t('market.growthChartAria')}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={indexed} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="year" tickFormatter={(value: number) => format.year(value)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={36} domain={[90, 'auto']} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [format.number(Number(value)), name === 'rent' ? t('market.rentTab') : name === 'income' ? t('market.incomeTab') : t('market.homeTab')]} labelFormatter={(_, p) => localVintage(p?.[0]?.payload?.vintage ?? '')} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'rent' ? t('market.rentLabel') : v === 'income' ? t('market.incomeLabel') : t('market.homeLabel'))} />
                        <ReferenceLine y={100} stroke="var(--color-border-strong)" />
                        <Line type="monotone" dataKey="rent" stroke="var(--color-accent-secondary)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                        <Line type="monotone" dataKey="income" stroke="var(--color-accent-green)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                        <Line type="monotone" dataKey="value" stroke="var(--color-accent-primary)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    {t('market.growthExplain')}
                  </p>
                  <Cite id="census" asOf={asOf} note={t('market.derivedTables', { ids: 'B25064, B19013, B25077' })} className="mt-2" />
                </>
              ) : (
                <EmptyChart />
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Rent burden distribution ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--color-accent-secondary)]" aria-hidden="true" />
              {t('market.affordability')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Stat label={t('market.medianRenterPays')} value={pct(m.medianRentBurden)} note={t('market.medianRenterNote')} />
              <Stat label={t('market.renters30')} value={pct(m.burden30)} note={t('market.renters30Note')} />
              <Stat label={t('market.renters40')} value={pct(m.burden40)} note={t('market.renters40Note')} tone="warn" />
            </div>

            {m.burdenDistribution ? (
              <>
                <div className="h-[240px]" role="img" aria-label={t('market.distributionAria')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.burdenDistribution} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="bin" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} label={{ value: t('market.distributionAxis'), position: 'insideBottom', offset: -2, fontSize: 11, fill: 'var(--color-text-muted)' }} height={40} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => format.percent(v / 100)} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, _name, item) => [`${format.percent(Number(value) / 100, 1)} · ${t('market.householdsCount', { count: format.number(item.payload.households) })}`, t('market.shareRenters')]} />
                      <Bar dataKey="share" radius={[6, 6, 0, 0]} isAnimationActive={animate}>
                        {m.burdenDistribution.map((entry) => (
                          <Cell key={entry.bin} fill={entry.bin.startsWith('50') || entry.bin.startsWith('40') ? 'var(--color-accent-secondary)' : entry.bin.startsWith('3') ? 'var(--color-accent-amber)' : 'var(--color-accent-green)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {t('market.distributionNote')}
                </p>
              </>
            ) : (
              <EmptyChart />
            )}

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {derived.affordableRentAtWage && (
                  <p>{t('market.wageGuideline', {
                    wage: format.currency(derived.affordableRentAtWage.wageCents / 100, { cents: true }),
                    amount: format.currency(derived.affordableRentAtWage.monthly),
                  })}</p>
                )}
                {m.medianGrossRent !== null && derived.gapPercent !== null && (
                  <p>{t(derived.gapPercent >= 0 ? 'market.gapShortfall' : 'market.gapSurplus', {
                    rent: format.currency(m.medianGrossRent),
                    percent: format.percent(Math.abs(derived.gapPercent) / 100, 1),
                  })}</p>
                )}
                {m.moveInCost !== null && (
                  <p>{t('market.moveInEstimate', { months: format.decimal(m.moveInCost, 1) })}</p>
                )}
                {derived.affordableRentAtWage && <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t('market.budgetMethod')}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/tools" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm text-white">
                  {t('market.checkRentBurden')}
                </Link>
                <Link href="/affordable-housing" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2 font-heading text-sm">
                  {t('housing.title')}
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Cite id="census" asOf={asOf} note={t('market.tables', { ids: 'B25070, B25071' })} />
              <Cite id="hud" href="https://www.huduser.gov/portal/pdredge/pdr-edge-research-110617.html" />
              <Cite id="massgov" note={t('market.citeWage')} href="https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage" />
            </div>
          </CardContent>
        </Card>

        {/* ── HUD FMR ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
              {t('market.rentByType')}
            </CardTitle>
            {hudFmr.status === 'available' && <Badge variant="blue">{t('market.fmrName')} · {fiscalYear}</Badge>}
          </CardHeader>
          <CardContent>
            {hudFmr.status === 'available' && fmrRows.length > 0 ? (
              <>
                <div className="h-[260px]" role="img" aria-label={t('market.fmrChart')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fmrRows} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => format.currency(v)} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }} tickLine={false} axisLine={false} width={120} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [format.currency(Number(value)), t('market.fmrName')]} />
                      <Bar dataKey="rent" fill="var(--color-accent-primary)" radius={[0, 6, 6, 0]} isAnimationActive={animate} label={{ position: 'right', fontSize: 11, fill: 'var(--color-text-secondary)', formatter: (v: unknown) => format.currency(Number(v)) }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  {t('market.fmrExplain')}
                </p>
                <Cite id="hud" asOf={`${fiscalYear} · ${t('market.effectiveDate', { date: format.date(hudFmr.effectiveDate, 'medium') })}`} href={hudFmr.sourceUrl} className="mt-2" />
                {hudFmr.snapshot && (
                  <p role="status" className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    {t('market.fmrSnapshot', { year: fiscalYear, date: hudFmr.publishedAt ? format.date(hudFmr.publishedAt, 'medium') : '—' })}
                  </p>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
                <p>
                  {t('market.fmrUnavailable')}
                </p>
                <SourceMark id="hud" withName size="sm" className="mt-2" href={hudFmr.status === 'not-installed' ? hudFmr.sourceUrl : 'https://www.huduser.gov/portal/datasets/fmr.html'} />

              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Income-limit estimates ─────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('housing.amiCalculator')} · {hasAmiValues ? t('market.incomeLimitsTitle', { year: format.year(ami.effectiveYear) }) : t('market.unavailable')}</CardTitle>
            {ami.snapshot && <Badge variant="amber">{t('market.verifiedCapture')}</Badge>}
          </CardHeader>
          <CardContent>
            {hasAmiValues ? (
              <>
                <p className="mb-3 text-sm text-[var(--color-text-secondary)]">{t('market.amiExplanation')} {ami.snapshot ? t('market.amiSnapshotNote') : t('market.amiLiveNote')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(ami.table).map(([household, income]) => {
                    const size = /^(\d+)-person household$/.exec(household);
                    return (
                      <div key={household} className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-center">
                        <p className="font-heading text-xs text-[var(--color-text-muted)]" lang={size ? lang : 'en'} dir={size ? undefined : 'ltr'}>
                          {size ? t('market.householdSize', { count: Number(size[1]) }) : household}
                        </p>
                        <p className="font-mono text-base font-bold">{format.currency(income)}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{t('market.eightyEstimate', { amount: format.currency(Math.round(income * 0.8)) })}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
                {t('market.amiUnavailable')}
                <SourceMark id="hud" withName size="sm" className="mt-2" href={ami.sourceUrl} />
              </div>
            )}
            <Cite id="hud" href={ami.sourceUrl} className="mt-3" />
          </CardContent>
        </Card>

        {/* ── Sources ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('market.dataSources')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SourceCard id="census" detail={t('market.sourceCensus', { vintage: localVintage(acs.vintage) })} href={acs.citation.url} />
              <SourceCard id="hud" detail={t('market.sourceHud')} />
              <SourceCard id="massgov" detail={t('market.sourceWage')} href="https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage" />
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm text-[var(--color-text-secondary)]">{t('market.listingsReason')}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {listings.officialPortals.map((portal) => {
                  const key = PORTAL_KEYS[portal.url];
                  return (
                    <li key={portal.url}>
                      <a href={portal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 font-heading text-xs font-semibold text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)]">
                        <span lang={key ? undefined : 'en'} dir={key ? undefined : 'ltr'}>{key ? t(key) : portal.label}</span>
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              {t('market.reportMismatch')} <Link href="/about" className="underline decoration-dotted underline-offset-2">{t('market.aboutLink')}</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}

function Stat({ label, value, note, tone }: { label: string; value: string; note: string; tone?: 'warn' }) {
  return (
    <div className={cn('rounded-lg p-4 text-center', tone === 'warn' ? 'bg-[var(--color-accent-secondary)]/10' : 'bg-[var(--color-bg-tertiary)]')}>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className={cn('font-mono text-2xl font-bold', tone === 'warn' && 'text-[var(--color-accent-secondary)]')}>{value}</p>
      <p className="text-xs text-[var(--color-text-muted)]">{note}</p>
    </div>
  );
}

function SourceCard({ id, detail, href }: { id: Parameters<typeof SourceMark>[0]['id']; detail: string; href?: string }) {
  return (
    <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3">
      <SourceMark id={id} withName size="md" href={href} />
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">{detail}</p>
    </div>
  );
}

function EmptyChart() {
  const { t } = useI18n();
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
      <p className="max-w-sm px-4">
        {t('market.noChart')}
      </p>
    </div>
  );
}
