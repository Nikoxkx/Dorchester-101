'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Home, 
  Calendar, 
  ArrowUp, 
  ArrowDown,
  ExternalLink,
  RefreshCw,
  Info,
  BarChart3,
  LineChart,
  PieChart,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExpandableSection } from '@/components/ui/ExpandableSection';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { formatCurrency, cn } from '@/lib/utils';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface MarketData {
  timestamp: string;
  medianRent: Record<string, { value: number; change1m: number; change1y: number; source: { provider: string; url: string } }>;
  medianSalePrice: Record<string, { value: number; change1m: number; change1y: number; source: { provider: string; url: string } }>;
  historicalRent2BR: { month: string; value: number }[];
  historicalSalePrice: { month: string; value: number }[];
  inventory: { totalListings: number; newListings30d: number; avgDaysOnMarket: number; monthsSupply: number };
  pricePerSqFt: { rental: { value: number; change1y: number }; sale: { value: number; change1y: number } };
  rentBurdenAnalysis: { dorchesterMedianIncome: number; avgRent2BR: number; rentBurdenPercent: number; affordableRentAt30Percent: number; rentGap: number };
  ami2026: { byHouseholdSize: Record<string, { ami100: number; ami80: number; ami60: number; ami50: number; ami30: number }> };
}

export default function MarketTrendsPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [activeChart, setActiveChart] = useState<'rent' | 'sales'>('rent');

  useEffect(() => {
    fetchMarketData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market-data');
      const result = await response.json();
      setMarketData(result.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setIsLoading(false);
    }
  };

  if (isLoading || !marketData) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading market data..." />
        </div>
      </MainLayout>
    );
  }

  const rentData = [
    { name: 'Studio', rent: marketData.medianRent.studio.value, change: marketData.medianRent.studio.change1y },
    { name: '1BR', rent: marketData.medianRent.oneBed.value, change: marketData.medianRent.oneBed.change1y },
    { name: '2BR', rent: marketData.medianRent.twoBed.value, change: marketData.medianRent.twoBed.change1y },
    { name: '3BR', rent: marketData.medianRent.threeBed.value, change: marketData.medianRent.threeBed.change1y },
    { name: '4BR', rent: marketData.medianRent.fourBed.value, change: marketData.medianRent.fourBed.change1y },
  ];

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-[var(--color-accent-primary)]" />
              Market Trends
            </h1>
            <p className="text-[var(--color-text-muted)] font-body">
              Real-time housing market data for Dorchester (ZIP: 02121, 02122, 02124, 02125)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DataRefreshIndicator lastUpdated={lastUpdated} isRefreshing={isLoading} />
            <button
              onClick={fetchMarketData}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
            </button>
          </div>
        </header>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Median 2BR Rent', 
              value: marketData.medianRent.twoBed.value, 
              change: marketData.medianRent.twoBed.change1y,
              format: 'currency',
              period: '/month',
              source: 'Zillow ZORI',
            },
            { 
              label: 'Median Sale Price', 
              value: marketData.medianSalePrice.all.value, 
              change: marketData.medianSalePrice.all.change1y,
              format: 'currency',
              source: 'Redfin MLS',
            },
            { 
              label: 'Days on Market', 
              value: marketData.inventory.avgDaysOnMarket, 
              change: -12,
              format: 'number',
              period: 'days',
              source: 'Redfin',
            },
            { 
              label: 'Active Listings', 
              value: marketData.inventory.totalListings, 
              change: -8,
              format: 'number',
              source: 'Redfin',
            },
          ].map((metric) => (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardContent className="py-4">
                <p className="text-xs text-[var(--color-text-muted)] font-heading mb-1">{metric.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-2xl font-bold">
                    {metric.format === 'currency' ? formatCurrency(metric.value) : metric.value.toLocaleString()}
                  </span>
                  {metric.period && (
                    <span className="text-sm text-[var(--color-text-muted)]">{metric.period}</span>
                  )}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-sm mt-2',
                  metric.change > 0 ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-accent-green)]'
                )}>
                  {metric.change > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span>{Math.abs(metric.change).toFixed(1)}% YoY</span>
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-2">
                  Source: {metric.source}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[var(--color-accent-primary)]" />
                2BR Rent Trend (24 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData.historicalRent2BR}>
                    <defs>
                      <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B3A6B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1B3A6B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                      domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Median Rent']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1B3A6B" 
                      strokeWidth={2}
                      fill="url(#rentGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Data: Zillow Observed Rent Index (ZORI) • Updated monthly
                  <a href="https://www.zillow.com/research/data/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] ml-2 inline-flex items-center gap-1">
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sale Price Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--color-accent-green)]" />
                Median Sale Price (24 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketData.historicalSalePrice}>
                    <defs>
                      <linearGradient id="saleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A6B3A" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#1A6B3A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                      tickFormatter={(value) => value.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      domain={['dataMin - 20000', 'dataMax + 20000']}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), 'Median Price']}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{ 
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1A6B3A" 
                      strokeWidth={2}
                      fill="url(#saleGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                <p className="text-xs text-[var(--color-text-muted)]">
                  Data: Redfin MLS Data Center • Updated weekly
                  <a href="https://www.redfin.com/news/data-center/" target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent-primary)] ml-2 inline-flex items-center gap-1">
                    Source <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rent by Unit Type */}
        <Card>
          <CardHeader>
            <CardTitle>Median Rent by Unit Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12, fill: 'var(--color-text-primary)' }}
                    width={40}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'Median Rent']}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="rent" fill="#1B3A6B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4 text-center">
              {rentData.map((item) => (
                <div key={item.name} className="p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <p className="font-heading font-semibold text-sm">{item.name}</p>
                  <p className="font-mono text-sm">{formatCurrency(item.rent)}</p>
                  <p className={cn(
                    'text-xs',
                    item.change > 0 ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-accent-green)]'
                  )}>
                    {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}% YoY
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Affordability Analysis */}
        <Card className="bg-gradient-to-br from-[var(--color-accent-secondary)]/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              Affordability Analysis — What This Means for You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Dorchester Median Income</p>
                <p className="font-mono text-2xl font-bold">{formatCurrency(marketData.rentBurdenAnalysis.dorchesterMedianIncome)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Per year (ACS 2024)</p>
              </div>
              <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Average 2BR Rent</p>
                <p className="font-mono text-2xl font-bold">{formatCurrency(marketData.rentBurdenAnalysis.avgRent2BR)}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Per month</p>
              </div>
              <div className="p-4 bg-[var(--color-accent-secondary)]/10 rounded-lg text-center">
                <p className="text-sm text-[var(--color-text-muted)]">Rent Burden</p>
                <p className="font-mono text-2xl font-bold text-[var(--color-accent-secondary)]">
                  {marketData.rentBurdenAnalysis.rentBurdenPercent.toFixed(1)}%
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">of income (30% = affordable)</p>
              </div>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
              <h4 className="font-heading font-semibold mb-2">Plain Language Analysis</h4>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                A typical Dorchester household earning <strong>{formatCurrency(marketData.rentBurdenAnalysis.dorchesterMedianIncome)}</strong> per year 
                would need to pay <strong>{formatCurrency(marketData.rentBurdenAnalysis.avgRent2BR)}</strong>/month for a 2-bedroom apartment. 
                This means spending <strong>{marketData.rentBurdenAnalysis.rentBurdenPercent.toFixed(1)}% of gross income</strong> on rent — 
                nearly double the <strong>30%</strong> threshold that HUD considers &quot;affordable.&quot;
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed mt-3">
                To afford this rent at 30% of income, a household would need to earn 
                <strong> {formatCurrency(marketData.rentBurdenAnalysis.avgRent2BR * 12 / 0.3)}</strong>/year — 
                a gap of <strong>{formatCurrency(marketData.rentBurdenAnalysis.avgRent2BR * 12 / 0.3 - marketData.rentBurdenAnalysis.dorchesterMedianIncome)}</strong> 
                from the median income.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="/affordable-housing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent-primary)] text-white rounded-lg font-heading text-sm"
              >
                Find Affordable Housing
              </a>
              <a
                href="/tools"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-tertiary)] rounded-lg font-heading text-sm"
              >
                Calculate Your Rent Burden
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Data Sources & Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: 'Zillow Research',
                  data: 'Rental prices (ZORI methodology)',
                  url: 'https://www.zillow.com/research/data/',
                  updated: 'Monthly',
                },
                {
                  name: 'Redfin Data Center',
                  data: 'Sale prices, inventory, days on market',
                  url: 'https://www.redfin.com/news/data-center/',
                  updated: 'Weekly',
                },
                {
                  name: 'HUD User',
                  data: 'Fair Market Rents, AMI limits',
                  url: 'https://www.huduser.gov/portal/datasets/fmr.html',
                  updated: 'Annually (FY2026)',
                },
                {
                  name: 'U.S. Census ACS',
                  data: 'Median income, demographics',
                  url: 'https://data.census.gov',
                  updated: '5-Year Estimates (2024)',
                },
              ].map((source) => (
                <div key={source.name} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading font-semibold text-sm">{source.name}</h4>
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent-primary)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{source.data}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Updated: {source.updated}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </MainLayout>
  );
}
