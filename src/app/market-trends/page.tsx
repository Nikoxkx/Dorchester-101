'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface MarketData {
  disclaimer: string;
  medianRent: Record<string, { value: number; change1y: number }>;
  medianSalePrice: Record<string, { value: number; change1y: number }>;
  historicalRent2BR: { month: string; value: number }[];
  historicalSalePrice: { month: string; value: number }[];
  inventory: { totalListings: number; avgDaysOnMarket: number };
  rentBurdenAnalysis: {
    dorchesterMedianIncome: number;
    avgRent2BR: number;
    rentBurdenPercent: number;
    affordableRentAt30Percent: number;
  };
}

export default function MarketTrendsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading, error, reload } = useApi<{ data: MarketData; lastUpdated: string }>('/api/market-data');
  const market = data?.data;

  if (loading || !market) {
    return <MainLayout><div className="min-h-[40vh] flex items-center justify-center"><LoadingSpinner size="lg" text="Loading published figures…" /></div></MainLayout>;
  }

  const rentData = [
    { name: 'Studio', rent: market.medianRent.studio.value, change: market.medianRent.studio.change1y },
    { name: '1BR', rent: market.medianRent.oneBed.value, change: market.medianRent.oneBed.change1y },
    { name: '2BR', rent: market.medianRent.twoBed.value, change: market.medianRent.twoBed.change1y },
    { name: '3BR', rent: market.medianRent.threeBed.value, change: market.medianRent.threeBed.change1y },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <header className="border-b-2 border-[var(--ink)] pb-4 flex items-end justify-between gap-3">
          <div>
            <p className="kicker">Estimates</p>
            <h1 className="font-display text-4xl">{t('market.title')}</h1>
            <p className="text-[var(--muted)] mt-2">{t('market.description')}</p>
          </div>
          <DataRefreshIndicator lastUpdated={data ? new Date(data.lastUpdated).toLocaleTimeString() : null} isRefreshing={loading} />
        </header>

        <p className="text-sm border border-[var(--line)] p-3 bg-[var(--surface)]">{market.disclaimer}</p>
        {error && <button onClick={reload} className="underline">{t('common.retry')}</button>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-[var(--line)] py-4">
          <div>
            <p className="text-[11px] uppercase text-[var(--muted)]">2BR rent</p>
            <p className="font-display text-3xl">{formatCurrency(market.medianRent.twoBed.value)}</p>
            <p className="text-xs">{market.medianRent.twoBed.change1y}% yr</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--muted)]">Median sale</p>
            <p className="font-display text-3xl">{formatCurrency(market.medianSalePrice.all.value)}</p>
            <p className="text-xs">{market.medianSalePrice.all.change1y}% yr</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--muted)]">Days on market</p>
            <p className="font-display text-3xl">{market.inventory.avgDaysOnMarket}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase text-[var(--muted)]">Active listings</p>
            <p className="font-display text-3xl">{market.inventory.totalListings}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="desk-panel p-4">
            <h2 className="font-display text-xl mb-3">2BR rent, 24 months</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={market.historicalRent2BR}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--line)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="value" stroke="#c8102e" fill="#c8102e22" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="desk-panel p-4">
            <h2 className="font-display text-xl mb-3">Sale price, 24 months</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={market.historicalSalePrice}>
                  <CartesianGrid strokeDasharray="2 2" stroke="var(--line)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Area type="monotone" dataKey="value" stroke="#1e3a5f" fill="#1e3a5f22" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="desk-panel p-4">
          <h2 className="font-display text-xl mb-3">{t('market.rentByType')}</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentData} layout="vertical">
                <CartesianGrid strokeDasharray="2 2" stroke="var(--line)" />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" width={50} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="rent" fill="#1e3a5f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <section className="desk-panel p-5 space-y-3">
          <h2 className="font-display text-2xl">{t('market.affordability')}</h2>
          <p className="text-sm leading-relaxed">
            A Dorchester household at the published median income of <strong>{formatCurrency(market.rentBurdenAnalysis.dorchesterMedianIncome)}</strong> paying <strong>{formatCurrency(market.rentBurdenAnalysis.avgRent2BR)}</strong> for a 2BR spends <strong>{market.rentBurdenAnalysis.rentBurdenPercent}%</strong> of income on rent. HUD’s 30% line would be {formatCurrency(market.rentBurdenAnalysis.affordableRentAt30Percent)} a month.
          </p>
          <div className="flex gap-3">
            <a href="/affordable-housing" className="bg-[var(--red)] text-white px-4 py-2 text-sm font-bold">Housing desk</a>
            <a href="/tools" className="border border-[var(--ink)] px-4 py-2 text-sm font-bold">Calculator</a>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
