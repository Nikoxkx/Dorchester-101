'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useLiveApi } from '@/hooks/useLiveApi';
import { formatFor } from '@/lib/i18n';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Info } from 'lucide-react';

interface MarketPayload {
  medianRent: Record<string, { value: number; change1y: number; source: { provider: string }; lastUpdate: string }>;
  hudFairMarketRent: Record<string, { value: number; effectiveDate: string }>;
  medianSalePrice: Record<string, { value: number; change1y: number; source: { provider: string }; lastUpdate: string }>;
  inventory: { totalListings: number; newListings30d: number; avgDaysOnMarket: number; lastUpdate: string };
  historicalRent2BR: { month: string; value: number }[];
  historicalSalePrice: { month: string; value: number }[];
  disclaimer: string;
}

const RENT_KEYS = ['studio', 'oneBed', 'twoBed', 'threeBed', 'fourBed'] as const;
const SALE_KEYS = ['all', 'condo', 'singleFamily', 'multiFamily'] as const;

export default function MarketTrendsPage() {
  return (
    <MainLayout>
      <MarketView />
    </MainLayout>
  );
}

function MarketView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const { data, loading, error } = useLiveApi<MarketPayload>('/api/market-data', { channels: ['data'] });

  const rentRows = RENT_KEYS.filter((k) => data?.medianRent?.[k]);
  const saleRows = SALE_KEYS.filter((k) => data?.medianSalePrice?.[k]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('market.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('market.description')}</p>
      </header>

      {loading && !data && (
        <div className="space-y-3" aria-hidden>
          <div className="skeleton h-24" />
          <div className="skeleton h-72" />
        </div>
      )}
      {error && !data && (
        <div role="alert" className="content-card squircle p-6 text-center">
          <p className="text-body font-semibold text-1">{t('common.error')}</p>
          <p className="text-subhead text-text-2 mt-1">{t('common.errorHint')}</p>
        </div>
      )}

      {data && (
        <>
          {/* Published-estimate notice — honesty before aesthetics */}
          <div className="content-card squircle p-4 flex items-start gap-3">
            <Info className="w-4.5 h-4.5 text-text-2 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
            <p className="text-footnote text-text-2 leading-relaxed">
              {data.disclaimer} {t('market.estimateNote')}.
            </p>
          </div>

          {/* Snapshot table — content layer, sources on every row */}
          <section aria-label={t('market.currentSnapshot')}>
            <h2 className="text-title2 font-bold text-1 mb-2.5">{t('market.currentSnapshot')}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="content-card squircle overflow-x-auto">
                <table className="data-table">
                  <caption className="sr-only-x">{t('market.rentByType')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('market.rentByType')}</th>
                      <th scope="col" className="text-end">{t('common.perMonth')}</th>
                      <th scope="col" className="text-end">{t('market.yoy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentRows.map((k) => {
                      const row = data.medianRent[k];
                      return (
                        <tr key={k}>
                          <td className="font-semibold text-1">{t(rentLabel(k))}</td>
                          <td className="text-end num font-semibold text-1">{formatFor.currency(row.value)}</td>
                          <td className="text-end num text-warning">{row.change1y > 0 ? '+' : ''}{formatFor.percent(row.change1y / 100)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <SourceLine
                  provider={data.medianRent.twoBed.source.provider}
                  date={data.medianRent.twoBed.lastUpdate}
                />
              </div>

              <div className="content-card squircle overflow-x-auto">
                <table className="data-table">
                  <caption className="sr-only-x">{t('stats.medianSale')}</caption>
                  <thead>
                    <tr>
                      <th scope="col">{t('stats.medianSale')}</th>
                      <th scope="col" className="text-end">{t('common.free').replace(/./g, '') || '—'}</th>
                      <th scope="col" className="text-end">{t('market.yoy')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saleRows.map((k) => {
                      const row = data.medianSalePrice[k];
                      return (
                        <tr key={k}>
                          <td className="font-semibold text-1">{t(saleLabel(k))}</td>
                          <td className="text-end num font-semibold text-1">{formatFor.currency(row.value)}</td>
                          <td className="text-end num text-warning">{row.change1y > 0 ? '+' : ''}{formatFor.percent(row.change1y / 100)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <SourceLine
                  provider={data.medianSalePrice.all.source.provider}
                  date={data.medianSalePrice.all.lastUpdate}
                />
              </div>
            </div>
          </section>

          {/* Charts — canvas stays flat; source and as-of date above each chart */}
          <section className="grid lg:grid-cols-2 gap-3">
            <div className="content-card squircle p-5">
              <h3 className="text-subhead font-bold text-1">{t('market.rentByType')} — 2BR</h3>
              <SourceLine provider={data.medianRent.twoBed.source.provider} date={data.medianRent.twoBed.lastUpdate} inline />
              <div className="h-60 mt-3" role="img" aria-label={`2BR rent trend chart, ending ${formatFor.currency(data.medianRent.twoBed.value)} per month`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.historicalRent2BR} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="var(--separator)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                      tickFormatter={(m: string) => m.slice(2)}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--separator-strong)' }}
                    />
                    <YAxis
                      domain={['dataMin - 100', 'dataMax + 100']}
                      tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                      tickFormatter={(v: number) => `$${Math.round(v / 100) / 10}k`}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Tooltip
                      formatter={(v) => [formatFor.currency(Number(v)), '']}
                      contentStyle={{
                        background: 'var(--canvas)',
                        border: '1px solid var(--separator-strong)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--ink)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="content-card squircle p-5">
              <h3 className="text-subhead font-bold text-1">{t('stats.medianSale')}</h3>
              <SourceLine provider={data.medianSalePrice.all.source.provider} date={data.medianSalePrice.all.lastUpdate} inline />
              <div className="h-60 mt-3" role="img" aria-label={`Median sale price chart, ending ${formatFor.currency(data.medianSalePrice.all.value)}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.historicalSalePrice} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="var(--separator)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                      tickFormatter={(m: string) => m.slice(2)}
                      tickLine={false}
                      axisLine={{ stroke: 'var(--separator-strong)' }}
                    />
                    <YAxis
                      domain={['dataMin - 15000', 'dataMax + 15000']}
                      tick={{ fontSize: 11, fill: 'var(--text-2)' }}
                      tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
                      tickLine={false}
                      axisLine={false}
                      width={44}
                    />
                    <Tooltip
                      formatter={(v) => [formatFor.currency(Number(v)), '']}
                      contentStyle={{
                        background: 'var(--canvas)',
                        border: '1px solid var(--separator-strong)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="var(--ink)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* HUD FMR — what vouchers cover */}
          <section aria-label={t('market.fmrTitle')} className="content-card squircle p-5">
            <h3 className="text-subhead font-bold text-1">{t('market.fmrTitle')}</h3>
            <p className="text-caption text-text-2 mt-1">{t('market.fmrNote')}</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-4">
              {RENT_KEYS.filter((k) => data.hudFairMarketRent?.[k]).map((k) => (
                <div key={k} className="bg-[var(--surface)] rounded-[var(--radius-sm)] p-3">
                  <p className="text-caption2 font-semibold uppercase tracking-wider text-text-2">{t(rentLabel(k))}</p>
                  <p className="text-body font-bold text-1 num mt-1">{formatFor.currency(data.hudFairMarketRent[k].value)}</p>
                </div>
              ))}
            </div>
            <SourceLine provider="HUD User" date={data.hudFairMarketRent.twoBed.effectiveDate} />
          </section>
        </>
      )}
    </div>
  );
}

function SourceLine({ provider, date, inline }: { provider: string; date: string; inline?: boolean }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  return (
    <p className={inline ? 'text-caption2 text-text-3 mt-0.5' : 'text-caption2 text-text-3 px-4 py-2.5 border-t border-separator'}>
      {t('common.source')}: {provider} · {t('common.asOf')} {formatFor.date(date)}
    </p>
  );
}

type TKey = Parameters<ReturnType<typeof useTranslation>['t']>[0];

function rentLabel(k: string): TKey {
  const map: Record<string, TKey> = {
    studio: 'market.studio',
    oneBed: 'market.br1',
    twoBed: 'market.br2',
    threeBed: 'market.br3',
    fourBed: 'market.br4',
  };
  return map[k] ?? 'market.br2';
}

function saleLabel(k: string): TKey {
  const map: Record<string, TKey> = {
    all: 'common.all',
    condo: 'market.condo',
    singleFamily: 'market.singleFamily',
    multiFamily: 'market.multiFamily',
  };
  return map[k] ?? 'common.all';
}
