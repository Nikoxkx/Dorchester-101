'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import {
  BarChart3,
  CircleAlert,
  DollarSign,
  ExternalLink,
  Home,
  Info,
  Percent,
  RefreshCw,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { useLivePolling } from '@/hooks/useLivePolling';
import type { MarketResponse } from '@/app/api/market-data/route';

/**
 * Market trends.
 *
 * Reads exactly what `/api/market-data` returns: Census ACS estimates for the
 * City of Boston, the HUD Fair Market Rent table when an operator has installed
 * it, and the published AMI ladder. Every figure names its source and date, and
 * a missing figure is shown as missing. The previous version of this page read
 * a payload shape (`data.medianRent.studio`, Zillow/Redfin series) the API had
 * stopped producing, so it sat on a spinner forever.
 */

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const FMR_ORDER: Array<{ key: string; label: string }> = [
  { key: '0', label: 'Studio' },
  { key: 'studio', label: 'Studio' },
  { key: '1', label: '1 BR' },
  { key: 'oneBed', label: '1 BR' },
  { key: '2', label: '2 BR' },
  { key: 'twoBed', label: '2 BR' },
  { key: '3', label: '3 BR' },
  { key: 'threeBed', label: '3 BR' },
  { key: '4', label: '4 BR' },
  { key: 'fourBed', label: '4 BR' },
];

export default function MarketTrendsPage() {
  const { t, format } = useI18n();
  const [data, setData] = useState<MarketResponse | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  // ACS is annual; the minimum here only matters for "Refresh now".
  useLivePolling(load, { minMs: 15 * 60_000 });

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
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white"
          >
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

  const fmrRows =
    hudFmr.status === 'available'
      ? FMR_ORDER.filter((row) => row.key in hudFmr.units)
          .map((row) => ({ name: row.label, rent: hudFmr.units[row.key] }))
          // Two aliases for the same size never both exist; dedupe defensively.
          .filter((row, index, rows) => rows.findIndex((r) => r.name === row.name) === index)
      : [];

  const metrics: Array<{ icon: React.ReactNode; label: string; value: string; note: string }> = [
    { icon: <DollarSign className="h-5 w-5" aria-hidden="true" />, label: 'Median gross rent', value: money(m.medianGrossRent), note: 'per month, all unit sizes' },
    { icon: <Home className="h-5 w-5" aria-hidden="true" />, label: 'Median home value', value: money(m.medianHomeValue), note: 'owner-occupied units' },
    { icon: <Users className="h-5 w-5" aria-hidden="true" />, label: 'Median household income', value: money(m.medianIncome), note: 'per year' },
    { icon: <Percent className="h-5 w-5" aria-hidden="true" />, label: 'Renter households', value: pct(m.renterShare), note: 'share of occupied homes' },
  ];

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="mx-auto max-w-7xl space-y-8 pb-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold md:text-4xl">
              <TrendingUp className="h-8 w-8 text-[var(--color-accent-primary)]" aria-hidden="true" />
              {t('market.title')}
            </h1>
            <p className="text-[var(--color-text-muted)]">{t('market.description')}</p>
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
          <div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/10 p-4 text-sm"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
            <div>
              <p className="font-heading font-semibold">{t('error.dataUnavailable')}</p>
              <p className="text-[var(--color-text-secondary)]">{acs.error ?? t('error.dataUnavailableBody')}</p>
            </div>
          </div>
        )}

        {/* Current snapshot */}
        <section aria-labelledby="snapshot">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 id="snapshot" className="font-heading text-lg font-bold sm:text-xl">
              {t('market.currentSnapshot')}
            </h2>
            <Badge variant={acs.status === 'live' ? 'green' : acs.status === 'cache' ? 'amber' : 'red'}>
              {acs.status === 'live' ? 'Live' : acs.status === 'cache' ? 'Cached' : 'Unavailable'}
            </Badge>
            <span className="text-xs text-[var(--color-text-muted)]">{data.geography} · {acs.vintage}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="py-1">
                  <span
                    className="mb-3 grid h-9 w-9 place-items-center rounded-lg text-[var(--color-accent-primary)]"
                    style={{ background: 'color-mix(in srgb, var(--color-accent-primary) 14%, transparent)' }}
                    aria-hidden="true"
                  >
                    {metric.icon}
                  </span>
                  <p className={cn('font-mono text-2xl font-bold', metric.value === '—' && 'text-[var(--color-text-muted)]')}>{metric.value}</p>
                  <p className="mt-1 font-heading text-sm text-[var(--color-text-muted)]">{metric.label}</p>
                  <p className="text-[11px] text-[var(--color-text-muted)]">{metric.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Rent burden */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[var(--color-accent-secondary)]" aria-hidden="true" />
              {t('market.affordability')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Renters paying over 30% of income</p>
                <p className="font-mono text-2xl font-bold">{pct(m.burden30)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">HUD&apos;s “cost-burdened” line</p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Renters paying over 40% of income</p>
                <p className="font-mono text-2xl font-bold">{pct(m.burden40)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Severely burdened</p>
              </div>
              <div className="rounded-lg bg-[var(--color-accent-secondary)]/10 p-4 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Affordable rent at minimum wage</p>
                <p className="font-mono text-2xl font-bold text-[var(--color-accent-secondary)]">
                  {derived.affordableRentAtWage ? format.currency(derived.affordableRentAtWage.monthly) : '—'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {derived.affordableRentAtWage ? `${format.currency(derived.affordableRentAtWage.wageCents / 100)}/hour, 40 h/week, 30% of pay` : ''}
                </p>
              </div>
            </div>

            {m.medianGrossRent !== null && derived.affordableRentAtWage && derived.gapPercent !== null && (
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                A full-time worker at the Massachusetts minimum wage can afford about{' '}
                <strong>{format.currency(derived.affordableRentAtWage.monthly)}</strong> a month. The median gross rent in Boston is{' '}
                <strong>{format.currency(m.medianGrossRent)}</strong>, so that household cannot cover{' '}
                <strong>{format.percent(derived.gapPercent / 100, 1)}</strong> of a typical rent.
                {m.moveInCost !== null && (
                  <>
                    {' '}First month plus a security deposit equals roughly <strong>{format.decimal(m.moveInCost, 1)} months</strong> of median household income.
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">{derived.method}</p>

            <div className="flex flex-wrap gap-3">
              <Link href="/affordable-housing" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm text-white">
                {t('housing.title')}
              </Link>
              <Link href="/tools" className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-bg-tertiary)] px-4 py-2 font-heading text-sm">
                {t('nav.tools')}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* HUD FMR by unit size */}
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
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={fmrRows} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickFormatter={(value: number) => format.currency(value)} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }} width={48} />
                      <Tooltip
                        formatter={(value) => [format.currency(Number(value)), 'Fair Market Rent']}
                        contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                      />
                      <Bar dataKey="rent" fill="var(--color-accent-primary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                  {hudFmr.source} · effective {hudFmr.effectiveDate}{' '}
                  <a href={hudFmr.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-1 text-[var(--color-accent-primary)]">
                    Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </p>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-text-secondary)]">
                <p>{t('error.dataUnavailable')}. HUD publishes Fair Market Rents by bedroom count once a year; the official table for Boston is here:</p>
                <a
                  href={hudFmr.status === 'not-installed' ? hudFmr.sourceUrl : 'https://www.huduser.gov/portal/datasets/fmr.html'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 font-heading font-semibold text-[var(--color-accent-primary)]"
                >
                  HUD User: Fair Market Rents <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AMI ladder */}
        <Card>
          <CardHeader>
            <CardTitle>{t('housing.amiCalculator')} · {ami.effectiveYear} income limits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-[var(--color-text-secondary)]">{ami.note}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(ami.table).map(([household, income]) => (
                <div key={household} className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-center">
                  <p className="font-heading text-xs text-[var(--color-text-muted)]">{household}</p>
                  <p className="font-mono text-base font-bold">{format.currency(income)}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {ami.basis}{' '}
              <a href={ami.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-1 text-[var(--color-accent-primary)]">
                Source <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Listings + sources */}
        <Card>
          <CardHeader>
            <CardTitle>{t('market.dataSources')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading text-sm font-semibold">{acs.citation.label}</h4>
                  <a href={acs.citation.url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)]" aria-label={acs.citation.label}>
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Rent, income, home value, tenure, rent burden · {acs.vintage}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {t('common.updated')} {format.date(acs.retrievedAt, 'medium')}
                </p>
              </div>
              <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading text-sm font-semibold">HUD User</h4>
                  <a href="https://www.huduser.gov/portal/datasets/fmr.html" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)]" aria-label="HUD User">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Fair Market Rents, area median income limits · annual</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="text-sm text-[var(--color-text-secondary)]">{listings.reason}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {listings.officialPortals.map((portal) => (
                  <li key={portal.url}>
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] px-3 py-1 font-heading text-xs font-semibold text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)]"
                    >
                      {portal.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
