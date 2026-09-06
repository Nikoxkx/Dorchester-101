'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, BookOpen, Calendar, Clock, DollarSign, MapPin, Shield } from 'lucide-react';
import { MapPreview } from '@/components/map/DorchesterMapLoader';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';
import { useLivePolling } from '@/hooks/useLivePolling';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { RESOURCES, lastReviewedOn, reviewBacklog, verificationAge } from '@/data/resources';
import { TRANSIT_LINES } from '@/data/transit';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import type { TranslationKey } from '@/i18n/en';

/**
 * The landing screen.
 *
 * Two rules govern what may appear here. Every number is computed in this file from
 * a dataset the site actually ships (`src/data/*.ts`) or read from an API that names
 * its own source and date — nothing is typed in as a figure. And the imagery is the
 * neighbourhood itself rather than a gradient, because a community hub is judged in
 * one second on whether it looks like the place it is about.
 */

const pv: Variants = { initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const cv: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };

interface NewsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  category: string;
}

/** The slice of `/api/market-data` this page reads; see `src/app/api/market-data/route.ts`. */
interface MarketResponse {
  acs?: {
    status: 'live' | 'cache' | 'unavailable';
    vintage?: string;
    retrievedAt?: string;
    metrics?: { medianGrossRent?: number | null };
    error?: string;
  };
}

export default function DashboardPage() {
  const { t, format, meta } = useI18n();
  const setLastUpdated = useAppStore((s) => s.setLastUpdated);
  const dataEpoch = useAppStore((s) => s.dataEpoch);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [newsRes, marketRes] = await Promise.allSettled([
        fetch('/api/news?limit=20&sinceHours=168').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/market-data').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (newsRes.status === 'fulfilled' && newsRes.value) {
        setNews((newsRes.value.articles ?? []).slice(0, 3) as NewsItem[]);
      }
      if (marketRes.status === 'fulfilled' && marketRes.value) setMarket(marketRes.value as MarketResponse);
      const stamp = new Date().toISOString();
      setLastRefresh(stamp);
      setLastUpdated(stamp);
    } finally {
      setLoading(false);
    }
  }, [setLastUpdated]);

  // Mount, auto-refresh and Settings' "refresh now" all run through one rule, so
  // the dashboard cannot hammer the feeds while it sits in a background tab.
  useLivePolling(load, { minMs: 5 * 60_000 });

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener('refreshData', handler);
    return () => window.removeEventListener('refreshData', handler);
  }, [load]);
  void dataEpoch;

  const now = new Date();
  const greeting = t(`dashboard.greeting.${getTimeOfDayKey(now.getHours())}` as TranslationKey);
  const foodOpenThisWeek = RESOURCES.filter(
    (resource) => resource.category === 'food' && resource.hours && isOpenNow(resource.hours, now, BOSTON_TZ)
  ).length;
  const foodListed = RESOURCES.filter((resource) => resource.category === 'food').length;
  const backlog = reviewBacklog(now);
  const recentlyChecked = [...RESOURCES]
    .sort((a, b) => new Date(b.verification.checkedOn).getTime() - new Date(a.verification.checkedOn).getTime())
    .slice(0, 3);
  const medianRent = market?.acs?.metrics?.medianGrossRent ?? null;

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="flex flex-col gap-7 pb-10">
        {/* ── Photo hero: Dorchester Bay at sunset, not a gradient ── */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-border)]">
          <Image
            src="/img/dorchester-bay-sunset.jpg"
            alt="Dorchester Bay and the Neponset River mouth at sunset"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a]/92 via-[#0d1b2a]/68 to-[#0d1b2a]/25" aria-hidden="true" />
          <div className="relative z-10 flex flex-col gap-4 p-6 sm:p-9 lg:max-w-2xl">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              {t('intro.subtitle')}
            </p>
            <h1 className="font-display text-3xl font-extrabold leading-[1.08] text-white sm:text-4xl md:text-5xl">{t('intro.title')}</h1>
            <p className="max-w-prose text-sm leading-relaxed text-white/88 sm:text-base">{t('intro.body')}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 font-heading text-sm font-bold text-[#14304F] transition-transform active:scale-[0.98]"
              >
                {t('intro.cta')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2.5 font-heading text-sm font-bold text-white transition-colors hover:bg-white/12"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {t('intro.ctaSecondary')}
              </Link>
            </div>
            <p className="text-[10px] text-white/60">{t('about.photoCredits')}: Sswonk · CC BY-SA 3.0</p>
          </div>
        </section>

        {/* ── Greeting ─────────────────────────────────────── */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-xl font-extrabold leading-tight sm:text-2xl">
              {greeting}, {t('dashboard.welcome')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {format.date(now, 'long')} · {t('dashboard.tagline')}
            </p>
          </div>
          <DataRefreshIndicator lastUpdated={lastRefresh} isRefreshing={loading} />
        </header>

        <EmergencyBanner />

        {/* ── Stats, every one computed ───────────────────── */}
        <section aria-labelledby="glance">
          <h2 id="glance" className="mb-3 font-heading text-lg font-bold sm:text-xl">
            {t('dashboard.glance')}
          </h2>
          <motion.div variants={cv} initial="hidden" animate="visible" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
              label={t('stats.medianRent')}
              value={medianRent ?? 0}
              format="currency"
              unavailable={medianRent === null}
              source={market?.acs?.vintage && market.acs.vintage !== 'unavailable' ? `Census ${market.acs.vintage}, B25058` : 'Census ACS 5-year, B25058'}
              sourceDate={market?.acs?.status === 'unavailable' ? undefined : market?.acs?.retrievedAt}
              accent="var(--color-accent-primary)"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              label={t('stats.foodSites')}
              value={foodOpenThisWeek}
              hint={t('resources.count', { count: String(foodListed) })}
              source="DOR101 directory"
              sourceDate={lastReviewedOn()}
              accent="var(--color-accent-green)"
            />
            <StatCard
              icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
              label={t('about.methodology')}
              value={RESOURCES.length - backlog.needsReview}
              hint={t('notifications.reviewBacklog', { count: String(backlog.needsReview) })}
              source="DOR101 verification log"
              sourceDate={lastReviewedOn()}
              accent="var(--color-accent-secondary)"
            />
            <StatCard
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
              label={t('map.transitRoutes')}
              value={TRANSIT_LINES.length}
              hint={t('map.stopCount', { count: String(TRANSIT_LINES.reduce((total, line) => total + line.dorchesterStops.length, 0)) })}
              source="MBTA V3"
              accent="var(--mbta-red)"
            />
          </motion.div>
        </section>

        {/* ── Quick links ─────────────────────────────────── */}
        <section aria-labelledby="quick">
          <h2 id="quick" className="mb-3 font-heading text-lg font-bold sm:text-xl">
            {t('dashboard.quickAccess')}
          </h2>
          <QuickLinks />
        </section>

        {/* ── News + verification log ─────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2" aria-label={t('dashboard.latestNews')}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t('dashboard.latestNews')}</CardTitle>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline"
                >
                  {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent>
                {loading && news.length === 0 ? (
                  <ul className="flex flex-col gap-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <li key={i} className="skeleton h-14 rounded-lg" />
                    ))}
                  </ul>
                ) : news.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] px-3 py-4 text-sm text-[var(--color-text-secondary)]">
                    {t('news.empty')}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {news.map((article) => (
                      <li key={article.id}>
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-heading text-sm font-semibold leading-snug">{article.title}</span>
                            <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                              {article.source} · {format.relative(article.publishedAt)}
                            </span>
                          </span>
                          <Badge variant="blue">{t(`news.category.${article.category}` as TranslationKey)}</Badge>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          <section aria-label={t('dashboard.spotlight')}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
                  {t('dashboard.spotlight')}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-2">
                  {recentlyChecked.map((resource) => (
                    <li key={resource.id}>
                      <Link
                        href={`/resources?place=${resource.id}`}
                        className="group flex items-start gap-2 rounded-lg border border-[var(--color-border)] p-2.5 transition-colors hover:border-[var(--color-accent-primary)]"
                      >
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block truncate font-heading text-sm font-semibold">{resource.name}</span>
                          <span className="mt-0.5 block text-[11px] text-[var(--color-text-muted)]">
                            {t('resources.checkedOn', { date: format.date(resource.verification.checkedOn, 'medium') })}
                            {verificationAge(resource, now) > 0 ? ` · ${format.number(verificationAge(resource, now))} d` : ''}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] leading-snug text-[var(--color-text-muted)]">{t('resources.intro')}</p>
                <Link
                  href="/directory"
                  className="inline-flex items-center gap-1 font-heading text-xs font-bold text-[var(--color-accent-primary)] hover:underline"
                >
                  {t('directory.title')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* ── Map preview ─────────────────────────────────── */}
        <section aria-label={t('dashboard.mapTitle')}>
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
                {t('dashboard.mapTitle')}
              </CardTitle>
              <Link
                href="/map"
                className="inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline"
              >
                {t('dashboard.viewFullMap')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Link href="/map" className="group relative block" aria-label={t('map.clickExplore')}>
                <MapPreview height="17rem" />
                <span className="pointer-events-none absolute inset-0 flex items-end justify-start bg-gradient-to-t from-black/45 via-transparent to-transparent p-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 font-heading text-xs font-bold text-[#17202B] shadow-sm transition-transform group-hover:-translate-y-0.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white">
                    {t('map.clickExplore')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            </CardContent>
          </Card>
        </section>

        <footer className="border-t border-[var(--color-border)] pt-5 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('dashboard.footer.line1')}</p>
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{t('dashboard.footer.line2')}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {t('dashboard.footer.verified')}: {format.date(lastReviewedOn(), 'long')} · {meta.intlLocale}
          </p>
        </footer>
      </motion.div>
    </MainLayout>
  );
}

/**
 * Greeting bucket from the local hour. Three, not four: 'Good night' is a
 * farewell, and a page that says it at 11 PM reads like a template that never
 * thought about the person using it at that hour.
 */
function getTimeOfDayKey(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
