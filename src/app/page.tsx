'use client';

import { useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Home, Building2, DollarSign, Apple, Clock, TrendingUp, ArrowRight, MapPin, Calendar, BookOpen, Shield } from 'lucide-react';
import { getTimeOfDay } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/stores/appStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then(m => m.DorchesterMap),
  { ssr: false, loading: () => <div className="h-64 bg-[var(--color-bg-tertiary)] rounded-lg flex items-center justify-center"><LoadingSpinner /></div> }
);

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const cv: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };

interface NewsArticle { id: string; title: string; source: string; publishedAt: string; category: string }

export default function DashboardPage() {
  const { language, setLastUpdated } = useAppStore();
  const { t } = useTranslation(language);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    const h = () => fetchData();
    window.addEventListener('refreshData', h);
    return () => window.removeEventListener('refreshData', h);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/news');
      const d = await r.json();
      setNews(d.articles?.slice(0, 3) || []);
      const now = new Date().toLocaleTimeString();
      setLastRefresh(now);
      setLastUpdated(now);
    } catch { /* swallow */ }
    setLoading(false);
  };

  const timeOfDay = getTimeOfDay();
  const greeting = t(`dashboard.greeting.${timeOfDay}`);
  const today = new Date().toLocaleDateString(language === 'ar' ? 'ar' : language === 'zh' ? 'zh-CN' : language === 'vi' ? 'vi' : language === 'pt' ? 'pt-BR' : language === 'es' ? 'es' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const fmtTime = (d: string) => { const ms = Date.now() - new Date(d).getTime(); const h = Math.floor(ms / 3600000); return h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="max-w-7xl mx-auto space-y-8">

        {/* ── Introduction Banner ──────────────────────────── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[#2E5A99] text-white p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5" />
              <span className="text-xs font-heading font-medium uppercase tracking-wider text-white/80">{t('intro.subtitle')}</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{t('intro.title')}</h1>
            <p className="text-white/90 leading-relaxed mb-6">{t('intro.body')}</p>
            <Link href="/resources" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[var(--color-accent-primary)] rounded-lg font-heading font-semibold hover:bg-white/90 transition-colors">
              {t('intro.cta')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Greeting ────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              {greeting}, <span className="text-[var(--color-accent-primary)]">{t('dashboard.welcome')}</span>
            </h2>
            <p className="text-[var(--color-text-muted)] font-body">{today} · {t('dashboard.tagline')}</p>
          </div>
          <DataRefreshIndicator lastUpdated={lastRefresh} isRefreshing={loading} />
        </header>

        {/* ── Emergency Banner ─────────────────────────────── */}
        <EmergencyBanner />

        {/* ── Stats ────────────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-semibold text-xl mb-4">{t('dashboard.glance')}</h2>
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={cv} initial="hidden" animate="visible">
            <StatCard icon={<DollarSign className="w-5 h-5" />} label={t('stats.medianRent')} value={2875} format="currency" trend={{ value: 4.5, direction: 'up' }} source="Zillow ZORI" sourceDate="June 1, 2026" color="var(--color-accent-primary)" />
            <StatCard icon={<Home className="w-5 h-5" />} label={t('stats.incomeRestricted')} value={1342} trend={{ value: 8.2, direction: 'up' }} source="BPDA" sourceDate="June 5, 2026" color="var(--color-accent-green)" />
            <StatCard icon={<Building2 className="w-5 h-5" />} label={t('stats.activeProjects')} value={24} trend={{ value: 2, direction: 'up' }} source="Boston Plans" sourceDate="June 3, 2026" color="var(--color-accent-amber)" />
            <StatCard icon={<Clock className="w-5 h-5" />} label={t('stats.openWaitlists')} value={6} trend={{ value: 1, direction: 'up' }} source="BHA/MassAccess" sourceDate="June 5, 2026" color="#6B5B95" />
            <StatCard icon={<Apple className="w-5 h-5" />} label={t('stats.foodSites')} value={38} source="Greater Boston Food Bank" sourceDate="June 5, 2026" color="#C8102E" />
            <StatCard icon={<TrendingUp className="w-5 h-5" />} label={t('stats.medianSale')} value={642500} format="currency" trend={{ value: 5.8, direction: 'up' }} source="Redfin" sourceDate="June 3, 2026" color="var(--color-accent-primary)" />
          </motion.div>
        </section>

        {/* ── Quick Links ──────────────────────────────────── */}
        <section>
          <h2 className="font-heading font-semibold text-xl mb-4">{t('dashboard.quickAccess')}</h2>
          <QuickLinks />
        </section>

        {/* ── News + Spotlight ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.latestNews')}</CardTitle>
                <Link href="/news" className="text-sm text-[var(--color-accent-primary)] font-heading font-medium hover:underline flex items-center gap-1">{t('dashboard.viewAll')} <ArrowRight className="w-4 h-4" /></Link>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="animate-pulse flex gap-4 p-3"><div className="flex-1 space-y-2"><div className="h-4 bg-[var(--color-bg-tertiary)] rounded w-3/4" /><div className="h-3 bg-[var(--color-bg-tertiary)] rounded w-1/2" /></div></div>)}</div>
                ) : (
                  <div className="space-y-3">{news.map(a => (
                    <Link key={a.id} href="/news" className="flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading font-medium text-sm mb-1 line-clamp-2">{a.title}</h4>
                        <p className="text-xs text-[var(--color-text-muted)]">{a.source} · {fmtTime(a.publishedAt)}</p>
                      </div>
                      <Badge variant="blue">{a.category}</Badge>
                    </Link>
                  ))}</div>
                )}
              </CardContent>
            </Card>
          </section>
          <section>
            <Card className="h-full bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-[var(--color-accent-primary)]/10">
              <CardHeader><div className="flex items-center gap-2"><span className="text-lg">✨</span><CardTitle>{t('dashboard.spotlight')}</CardTitle></div></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-heading font-semibold mb-2">RAFT Emergency Rental Assistance</h4>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">$12M in new funding. Up to $10,000 for rent arrears, first/last month rent, or security deposits.</p>
                </div>
                <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-[var(--color-accent-primary)]" /><span className="font-medium">{t('common.ongoing')} — {t('common.applyNow')}</span></div>
                <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => window.open('https://www.mass.gov/raft', '_blank')}>{t('common.learnMore')} & {t('common.apply')}</Button>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ── Map Preview ──────────────────────────────────── */}
        <section>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-[var(--color-accent-primary)]" />{t('dashboard.mapTitle')}</CardTitle>
              <Link href="/map" className="text-sm text-[var(--color-accent-primary)] font-heading font-medium hover:underline flex items-center gap-1">{t('dashboard.viewFullMap')} <ArrowRight className="w-4 h-4" /></Link>
            </CardHeader>
            <CardContent className="p-0"><DorchesterMap height="280px" showControls={false} preview={true} /></CardContent>
          </Card>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="text-center py-8 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">{t('dashboard.footer.line1')}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-2">{t('dashboard.footer.line2')}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('dashboard.footer.verified')}</p>
        </footer>
      </motion.div>
    </MainLayout>
  );
}
