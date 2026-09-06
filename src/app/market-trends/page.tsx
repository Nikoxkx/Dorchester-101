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
import type { MarketResponse } from '@/app/api/market-data/route';

/**
 * Market trends.
 *
 * Every chart on this page is drawn from `/api/market-data`, which reads the
 * Census Bureau's ACS tables for Suffolk County (the City of Boston) and, when
 * an operator has installed it, HUD's Fair Market Rent table. Under each chart
 * is a sentence saying what it shows and what it does not, and a citation with
 * the table id, because a chart without a table id cannot be checked.
 */

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FMR_ORDER: Array<{ keys: string[]; label: string }> = [
  { keys: ['0', 'studio', 'efficiency'], label: 'Studio' },
  { keys: ['1', 'oneBed', 'one'], label: '1 BR' },
  { keys: ['2', 'twoBed', 'two'], label: '2 BR' },
  { keys: ['3', 'threeBed', 'three'], label: '3 BR' },
  { keys: ['4', 'fourBed', 'four'], label: '4 BR' },
];

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
  const { t, format } = useI18n();
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

  const fmrRows =
    hudFmr.status === 'available'
      ? FMR_ORDER.map((row) => {
          const key = row.keys.find((k) => k in hudFmr.units);
          return key ? { name: row.label, rent: hudFmr.units[key] } : null;
        }).filter((r): r is { name: string; rent: number } => r !== null)
      : [];

  const first = series[0];
  const last = series[series.length - 1];
  const change = (a: number | null, b: number | null) => (a && b ? Math.round(((b - a) / a) * 1000) / 10 : null);
  const rentChange = first && last ? change(first.medianGrossRent, last.medianGrossRent) : null;
  const incomeChange = first && last ? change(first.medianIncome, last.medianIncome) : null;
  const valueChange = first && last ? change(first.medianHomeValue, last.medianHomeValue) : null;

  const metrics: Array<{ icon: React.ReactNode; label: string; value: string; note: string; delta: number | null }> = [
    { icon: <DollarSign className="h-5 w-5" aria-hidden="true" />, label: 'Median gross rent', value: money(m.medianGrossRent), note: 'per month, rent plus utilities, all unit sizes', delta: rentChange },
    { icon: <Home className="h-5 w-5" aria-hidden="true" />, label: 'Median home value', value: money(m.medianHomeValue), note: 'owner-occupied units, owner-estimated', delta: valueChange },
    { icon: <Users className="h-5 w-5" aria-hidden="true" />, label: 'Median household income', value: money(m.medianIncome), note: 'per year, all households', delta: incomeChange },
    { icon: <Percent className="h-5 w-5" aria-hidden="true" />, label: 'Renter households', value: pct(m.renterShare), note: 'share of all occupied homes', delta: null },
  ];

  const trendKey = { rent: 'medianGrossRent', income: 'medianIncome', value: 'medianHomeValue', burden: 'medianRentBurden' }[trendMetric] as
    | 'medianGrossRent'
    | 'medianIncome'
    | 'medianHomeValue'
    | 'medianRentBurden';
  const trendLabel = { rent: 'Median gross rent ($/month)', income: 'Median household income ($/year)', value: 'Median home value ($)', burden: 'Median rent burden (% of income)' }[trendMetric];
  const trendFormatter = (v: number) => (trendMetric === 'burden' ? `${v}%` : format.currency(v));
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
              What it costs to rent, buy and stay in Boston, drawn from the Census Bureau&apos;s American Community Survey and HUD&apos;s published rent tables.
              Dorchester does not have its own line in either dataset, so the figures are for <strong>Suffolk County, which is the City of Boston</strong>. Every
              chart names its table so you can open the source and check it yourself.
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              No listing prices, no estimates, nothing from a brokerage. When a number is missing the chart says so rather than filling the gap.
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

        {!acsLive && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 p-4 text-sm">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
            <div>
              <p className="font-heading font-semibold">{t('error.dataUnavailable')}</p>
              <p className="text-[var(--color-text-secondary)]">
                {acs.error ?? t('error.dataUnavailableBody')} The Census API at <code className="font-mono text-xs">api.census.gov</code> could not be reached from this
                server. Figures reappear on the next successful fetch; nothing is substituted in the meantime.
              </p>
            </div>
          </div>
        )}

        {/* ── Snapshot ─────────────────────────────────────────── */}
        <section aria-labelledby="snapshot">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 id="snapshot" className="font-heading text-lg font-bold sm:text-xl">{t('market.currentSnapshot')}</h2>
            <Badge variant={acs.status === 'live' ? 'green' : acs.status === 'cache' ? 'amber' : 'red'}>
              {acs.status === 'live' ? 'Live from Census' : acs.status === 'cache' ? 'Cached copy' : 'Unavailable'}
            </Badge>
            <span className="text-xs text-[var(--color-text-muted)]">{data.geography} · {acs.vintage}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="dor101-glass">
                <CardContent className="py-1">
                  <div className="mb-3 flex items-start justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg text-[var(--color-accent-primary)]" style={{ background: 'color-mix(in srgb, var(--color-accent-primary) 14%, transparent)' }} aria-hidden="true">
                      {metric.icon}
                    </span>
                    {metric.delta !== null && first && last && (
                      <span className={cn('font-heading text-[11px] font-semibold', metric.delta >= 0 ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-accent-green)]')} title={`Change from the ${first.vintage} estimate to ${last.vintage}`}>
                        {metric.delta >= 0 ? '+' : ''}{format.percent(metric.delta / 100, 1)} since {first.year}
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
          <Cite id="census" asOf={asOf} note={`${acs.vintage}, tables B25064, B25077, B19013, B25003`} href={acs.citation.url} className="mt-2" />
        </section>

        {/* ── Trend over vintages ──────────────────────────────── */}
        <Card>
          <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center">
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
              Twelve years of Census estimates
            </CardTitle>
            <div role="tablist" aria-label="Metric" className="flex flex-wrap gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/60 p-1">
              {(
                [
                  ['rent', 'Rent'],
                  ['income', 'Income'],
                  ['value', 'Home value'],
                  ['burden', 'Rent burden'],
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
                <div className="h-[280px] sm:h-[320px]" role="img" aria-label={`${trendLabel}, ${trendSeries[0].vintage} to ${trendSeries[trendSeries.length - 1].vintage}`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendSeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                        tickLine={false}
                        axisLine={false}
                        width={trendMetric === 'burden' ? 40 : 64}
                        tickFormatter={(v: number) => (trendMetric === 'burden' ? `${v}%` : v >= 1000 ? `$${Math.round(v / 1000)}k` : `$${v}`)}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelFormatter={(_, payload) => `ACS 5-year ${payload?.[0]?.payload?.vintage ?? ''}`}
                        formatter={(value) => [trendFormatter(Number(value)), trendLabel]}
                      />
                      {trendMetric === 'burden' && <ReferenceLine y={30} stroke="var(--color-accent-secondary)" strokeDasharray="4 4" label={{ value: '30% — HUD affordability line', position: 'insideTopLeft', fill: 'var(--color-accent-secondary)', fontSize: 11 }} />}
                      <Area type="monotone" dataKey="value" stroke="var(--color-accent-primary)" strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 3, strokeWidth: 2, fill: 'var(--color-bg-raised)' }} activeDot={{ r: 5 }} isAnimationActive={animate} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <strong>How to read this.</strong> {data.series.note} The x-axis label is the last year of each five-year window.
                  {trendMetric === 'burden' && ' The dashed line at 30% is the point HUD considers a household “cost-burdened”; a median above it means more than half of renters pay more than that.'}
                </p>
                <Cite id="census" asOf={asOf} note={`tables B25064, B19013, B25077, B25071 for ACS 5-year ${trendSeries[0].year}–${trendSeries[trendSeries.length - 1].year}`} className="mt-2" />
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
                Rent versus what the median household can afford
              </CardTitle>
            </CardHeader>
            <CardContent>
              {affordabilitySeries.length >= 3 ? (
                <>
                  <div className="h-[260px]" role="img" aria-label="Median gross rent compared with 30 percent of median household income, by ACS vintage">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={affordabilitySeries} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={56} tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [format.currency(Number(value)), name === 'rent' ? 'Median gross rent' : name === 'affordable' ? 'Affordable at 30% of median income' : 'Monthly gap']} labelFormatter={(_, p) => `ACS 5-year ${p?.[0]?.payload?.vintage ?? ''}`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'rent' ? 'Median gross rent' : v === 'affordable' ? 'Affordable at 30% of income' : 'Gap')} />
                        <Bar dataKey="gap" fill="var(--color-accent-secondary)" fillOpacity={0.25} radius={[4, 4, 0, 0]} isAnimationActive={animate} />
                        <Line type="monotone" dataKey="rent" stroke="var(--color-accent-secondary)" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={animate} />
                        <Line type="monotone" dataKey="affordable" stroke="var(--color-accent-green)" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 3 }} isAnimationActive={animate} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    <strong>How to read this.</strong> The green dashed line is 30% of the median household&apos;s income divided over twelve months — the rent HUD would call
                    affordable for that household. The red line is the actual median rent. The shaded bars are the monthly difference. Half of households earn less than the median, so their gap is wider.
                  </p>
                  <Cite id="census" asOf={asOf} note="derived from B25064 and B19013" className="mt-2" />
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
                Growth since {indexed[0]?.year ?? '—'}, indexed to 100
              </CardTitle>
            </CardHeader>
            <CardContent>
              {indexed.length >= 3 ? (
                <>
                  <div className="h-[260px]" role="img" aria-label="Rent, income and home value indexed to the earliest vintage">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={indexed} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} />
                        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={36} domain={[90, 'auto']} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, name) => [`${value}`, name === 'rent' ? 'Rent' : name === 'income' ? 'Income' : 'Home value']} labelFormatter={(_, p) => `ACS 5-year ${p?.[0]?.payload?.vintage ?? ''}`} />
                        <Legend wrapperStyle={{ fontSize: 11 }} formatter={(v) => (v === 'rent' ? 'Median gross rent' : v === 'income' ? 'Median household income' : 'Median home value')} />
                        <ReferenceLine y={100} stroke="var(--color-border-strong)" />
                        <Line type="monotone" dataKey="rent" stroke="var(--color-accent-secondary)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                        <Line type="monotone" dataKey="income" stroke="var(--color-accent-green)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                        <Line type="monotone" dataKey="value" stroke="var(--color-accent-primary)" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={animate} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    <strong>How to read this.</strong> Each line starts at 100 in the earliest vintage. A line at 150 means that figure is one and a half times what it was. When the rent and
                    home-value lines sit above the income line, housing is taking a growing share of what people earn. Figures are in nominal dollars, not adjusted for inflation, which affects all three lines equally.
                  </p>
                  <Cite id="census" asOf={asOf} note="derived from B25064, B19013, B25077" className="mt-2" />
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
              <Stat label="Median renter pays" value={pct(m.medianRentBurden)} note="of household income on rent and utilities (B25071)" />
              <Stat label="Renters paying over 30%" value={pct(m.burden30)} note="HUD’s “cost-burdened” threshold" />
              <Stat label="Renters paying 40% or more" value={pct(m.burden40)} note="little left for food, transit or savings" tone="warn" />
            </div>

            {m.burdenDistribution ? (
              <>
                <div className="h-[240px]" role="img" aria-label="Share of renter households by the percentage of income spent on rent">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={m.burdenDistribution} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="bin" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={{ stroke: 'var(--color-border)' }} label={{ value: 'Share of income spent on rent', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'var(--color-text-muted)' }} height={40} />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} width={40} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value, _name, item) => [`${value}% · ${format.number(item.payload.households)} households`, 'Share of renters']} />
                      <Bar dataKey="share" radius={[6, 6, 0, 0]} isAnimationActive={animate}>
                        {m.burdenDistribution.map((entry) => (
                          <Cell key={entry.bin} fill={entry.bin.startsWith('50') || entry.bin.startsWith('40') ? 'var(--color-accent-secondary)' : entry.bin.startsWith('3') ? 'var(--color-accent-amber)' : 'var(--color-accent-green)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <strong>How to read this.</strong> Every renter household in Boston sits in one of these bars. Green bars are below 30% of income (affordable by HUD&apos;s rule), amber is 30–40%
                  (cost-burdened), red is 40% and above (severely burdened). Households whose rent share could not be computed — no cash rent or no income — are excluded from the denominator.
                </p>
              </>
            ) : (
              <EmptyChart />
            )}

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {derived.affordableRentAtWage && (
                  <>
                    A full-time worker at the Massachusetts minimum wage ({format.currency(derived.affordableRentAtWage.wageCents / 100)}/hour, 40 hours a week) can afford about{' '}
                    <strong>{format.currency(derived.affordableRentAtWage.monthly)}</strong> a month by the 30% rule.
                  </>
                )}
                {m.medianGrossRent !== null && derived.gapPercent !== null && (
                  <>
                    {' '}The median gross rent is <strong>{format.currency(m.medianGrossRent)}</strong>, so that household cannot cover <strong>{format.percent(derived.gapPercent / 100, 1)}</strong> of a typical rent on its own.
                  </>
                )}
                {m.moveInCost !== null && (
                  <>
                    {' '}First month plus a security deposit equals roughly <strong>{format.decimal(m.moveInCost, 1)} months</strong> of median household income — the up-front barrier that RAFT and the city&apos;s
                    move-in assistance programs exist to cover.
                  </>
                )}
                <p className="mt-2 text-xs text-[var(--color-text-muted)]">{derived.method}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/tools" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm text-white">
                  Check your own rent burden
                </Link>
                <Link href="/affordable-housing" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2 font-heading text-sm">
                  {t('housing.title')}
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Cite id="census" asOf={asOf} note="tables B25070, B25071" />
              <Cite id="massgov" note="minimum wage, M.G.L. c.151 §1" href="https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage" />
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
            {hudFmr.status === 'available' && <Badge variant="blue">HUD FMR FY{hudFmr.fiscalYear}</Badge>}
          </CardHeader>
          <CardContent>
            {hudFmr.status === 'available' && fmrRows.length > 0 ? (
              <>
                <div className="h-[260px]" role="img" aria-label="HUD Fair Market Rent by number of bedrooms">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fmrRows} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }} tickLine={false} axisLine={false} width={52} />
                      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [format.currency(Number(value)), 'Fair Market Rent']} />
                      <Bar dataKey="rent" fill="var(--color-accent-primary)" radius={[0, 6, 6, 0]} isAnimationActive={animate} label={{ position: 'right', fontSize: 11, fill: 'var(--color-text-secondary)', formatter: (v: unknown) => format.currency(Number(v)) }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                  <strong>How to read this.</strong> Fair Market Rent is the 40th-percentile gross rent HUD sets for the Boston metro each year. It is the ceiling a Section 8 voucher will normally pay, so
                  a listing above these bars is one a voucher holder usually cannot take.
                </p>
                <Cite id="hud" asOf={`FY${hudFmr.fiscalYear}, effective ${hudFmr.effectiveDate}`} href={hudFmr.sourceUrl} className="mt-2" />
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
                <p>
                  HUD publishes Fair Market Rents by bedroom count once a year. This build does not have the table installed, so no figure is shown here; the official table for the Boston–Cambridge–Quincy
                  area is one click away:
                </p>
                <SourceMark id="hud" withName size="sm" className="mt-2" href={hudFmr.status === 'not-installed' ? hudFmr.sourceUrl : 'https://www.huduser.gov/portal/datasets/fmr.html'} />
                <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">
                  Operators: drop the FY table at <code className="font-mono">public/data/hud-fmr.json</code> and this chart draws itself.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── AMI ladder ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('housing.amiCalculator')} · {ami.effectiveYear} income limits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
              {ami.note} Most income-restricted apartments in Boston are set at 30%, 50%, 60%, 70% or 80% of these figures; the lottery listing will say which. Use the{' '}
              <Link href="/tools" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">income limit check</Link> to see where your household falls.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(ami.table).map(([household, income]) => (
                <div key={household} className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-center">
                  <p className="font-heading text-xs text-[var(--color-text-muted)]">{household}</p>
                  <p className="font-mono text-base font-bold">{format.currency(income)}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">80% = {format.currency(Math.round(income * 0.8))}</p>
                </div>
              ))}
            </div>
            <Cite id="hud" note={ami.basis} href={ami.sourceUrl} className="mt-3" />
          </CardContent>
        </Card>

        {/* ── Sources ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('market.dataSources')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SourceCard id="census" detail={`Rent, income, home value, tenure, rent burden · ${acs.vintage}`} href={acs.citation.url} />
              <SourceCard id="hud" detail="Fair Market Rents and area median income limits · annual" />
              <SourceCard id="massgov" detail="State minimum wage used in the affordability arithmetic" href="https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage" />
            </div>
            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm text-[var(--color-text-secondary)]">{listings.reason}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {listings.officialPortals.map((portal) => (
                  <li key={portal.url}>
                    <a href={portal.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 font-heading text-xs font-semibold text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)]">
                      {portal.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--color-text-muted)]">
              Found a number that does not match its source? DOR101 is open source — open an issue from the <Link href="/about" className="underline decoration-dotted underline-offset-2">About page</Link> or the
              “Report a problem” link in the footer, and the fix lands in public.
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
  return (
    <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center text-sm text-[var(--color-text-muted)]">
      <p className="max-w-sm px-4">
        No chart: the Census API did not answer, and DOR101 does not draw a line it cannot source. Try again in a few minutes.
      </p>
    </div>
  );
}
