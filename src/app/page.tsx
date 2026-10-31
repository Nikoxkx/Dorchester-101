'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BadgeCheck, BookOpen, Calendar, Clock, DollarSign, MapPin, Shield } from 'lucide-react';
import { MapPreview } from '@/components/map/DorchesterMapLoader';
import { useI18n } from '@/i18n/hook';
import { useAppStore, type HomeSectionId } from '@/stores/appStore';
import { useLivePolling } from '@/hooks/useLivePolling';
import { useHydratedNow } from '@/hooks/useNow';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { EmergencyBanner } from '@/components/dashboard/EmergencyBanner';
import { WeatherPanel } from '@/components/weather/WeatherPanel';
import { ClothingPreview } from '@/components/clothing/ClothingPreview';
import { BadgeWall } from '@/components/gamification/BadgeWall';
import { FieldNotes } from '@/components/pwa/FieldNotes';
import { PermissionSetup } from '@/components/pwa/PermissionSetup';
import { DownloadAppCard } from '@/components/pwa/DownloadAppCard';
import { PhotoCredit } from '@/components/sources/PhotoCredit';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { RESOURCES, lastReviewedOn, reviewBacklog, verificationAge } from '@/data/resources';
import { TRANSIT_LINES } from '@/data/transit';
import { referenceLineName } from '@/i18n/transitReference';
import { BOSTON_TZ, isOpenNow } from '@/lib/hours';
import { useBadgeStore } from '@/stores/badgeStore';
import type { TranslationKey } from '@/i18n/en';
import { newsLanguageName } from '@/i18n/newsContent';

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
  language: string;
  translation?: { originalTitle: string; originalSummary: string; originalLanguage: string };
}

/** The slice of `/api/market-data` this page reads; see `src/app/api/market-data/route.ts`. */
interface MarketResponse {
  geography?: string;
  acs?: {
    status: 'live' | 'cache' | 'snapshot' | 'unavailable';
    vintage?: string;
    retrievedAt?: string;
    metrics?: {
      medianGrossRent?: number | null;
      medianIncome?: number | null;
      renterShare?: number | null;
      burden30?: number | null;
      burden40?: number | null;
    };
    /** True when the Bureau was unreachable and the committed capture is shown. */
    snapshot?: boolean;
    error?: string;
  };
  derived?: { affordableRentAtWage?: { wageCents: number; monthly: number } | null; gapPercent?: number | null };
}

export default function DashboardPage() {
  const { t, format, meta, lang } = useI18n();
  const nowMs = useHydratedNow(60_000);
  const latestLanguage = useRef(lang);
  useEffect(() => { latestLanguage.current = lang; }, [lang]);
  const setLastUpdated = useAppStore((s) => s.setLastUpdated);
  const dataEpoch = useAppStore((s) => s.dataEpoch);
  const earnBadge = useBadgeStore((s) => s.earn);

  // Resident-arranged homepage (Settings → Homepage): every block below is
  // wrapped in a slot whose flex `order` and visibility come from the
  // stored layout, so sections can be rearranged or removed entirely
  // without touching this file's data wiring. The emergency banner is not
  // a slot: it always rides just ahead of the weather, hidden or not.
  const homeLayout = useAppStore((s) => s.homeLayout);
  const weatherEnabled = useAppStore((s) => s.weatherEnabled);
  const show = (id: HomeSectionId) => (id !== 'weather' || weatherEnabled) && !homeLayout.hidden.includes(id);
  const slot = (id: HomeSectionId): CSSProperties => ({ order: Math.max(0, homeLayout.order.indexOf(id)) * 10 });
  const emergencySlot: CSSProperties = { order: Math.max(0, homeLayout.order.indexOf('weather')) * 10 - 1 };
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsSnapshot, setNewsSnapshot] = useState<{ asOf: string; note: string } | null>(null);
  const [market, setMarket] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [newsRes, marketRes] = await Promise.allSettled([
        fetch(`/api/news?limit=20&sinceHours=168&lang=${encodeURIComponent(lang)}`).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/market-data').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (latestLanguage.current !== lang) return;
      if (newsRes.status === 'fulfilled' && newsRes.value) {
        setNews((newsRes.value.articles ?? []).slice(0, 3) as NewsItem[]);
        setNewsSnapshot(newsRes.value.snapshot ?? null);
      }
      if (marketRes.status === 'fulfilled' && marketRes.value) setMarket(marketRes.value as MarketResponse);
      // A failed request is not a data update. Keep the previous timestamp
      // when neither panel returned a payload.
      if ((newsRes.status === 'fulfilled' && newsRes.value) || (marketRes.status === 'fulfilled' && marketRes.value)) {
        const stamp = new Date().toISOString();
        setLastRefresh(stamp);
        setLastUpdated(stamp);
      }
    } finally {
      if (latestLanguage.current === lang) setLoading(false);
    }
  }, [setLastUpdated, lang]);

  // Mount, auto-refresh and Settings' "refresh now" all run through one rule, so
  // the dashboard cannot hammer the feeds while it sits in a background tab.
  useLivePolling(load, { minMs: 5 * 60_000, requestKey: lang });

  useEffect(() => {
    earnBadge('first-visit');
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) earnBadge('offline-ready');
      });
    }
  }, [earnBadge]);

  useEffect(() => {
    const handler = () => void load();
    window.addEventListener('refreshData', handler);
    return () => window.removeEventListener('refreshData', handler);
  }, [load]);
  void dataEpoch;

  const now = nowMs === null ? null : new Date(nowMs);
  const greeting = now ? t(`dashboard.greeting.${getTimeOfDayKey(now.getHours())}` as TranslationKey) : null;
  const foodOpenNow = now ? RESOURCES.filter(
    (resource) => resource.category === 'food' && resource.hours && isOpenNow(resource.hours, now, BOSTON_TZ)
  ).length : 0;
  const foodListed = RESOURCES.filter((resource) => resource.category === 'food').length;
  const backlog = now ? reviewBacklog(now) : null;
  const recentlyChecked = [...RESOURCES]
    .sort((a, b) => new Date(b.verification.checkedOn).getTime() - new Date(a.verification.checkedOn).getTime())
    .slice(0, 3);
  const medianRent = market?.acs?.metrics?.medianGrossRent ?? null;
  const metrics = market?.acs?.metrics;

  // ── Expandable detail for each "at a glance" card, all computed from the same
  // data the headline number comes from, so the two can never disagree.
  const pct = (v: number | null | undefined) => (v === null || v === undefined ? null : format.percent(v / 100, 1));
  const rentDetails = {
    summary: t('glance.rent.summary'),
    points: [
      metrics?.medianIncome ? t('glance.rent.income', { value: format.currency(metrics.medianIncome) }) : null,
      metrics?.renterShare !== null && metrics?.renterShare !== undefined ? t('glance.rent.renters', { value: pct(metrics.renterShare) ?? '' }) : null,
      metrics?.burden30 !== null && metrics?.burden30 !== undefined ? t('glance.rent.burden', { value: pct(metrics.burden30) ?? '' }) : null,
      market?.derived?.affordableRentAtWage
        ? t('glance.rent.wage', { value: format.currency(market.derived.affordableRentAtWage.monthly) })
        : null,
      t('glance.rent.geography'),
    ].filter((x): x is string => Boolean(x)),
    link: { href: '/market-trends', label: t('nav.market') },
  };
  const foodByKind = RESOURCES.filter((r) => r.category === 'food');
  const foodOpenNowRows = now ? foodByKind.filter((r) => r.hours && isOpenNow(r.hours, now, BOSTON_TZ)) : [];
  const foodDetails = {
    summary: t('glance.food.summary'),
    points: [
      t('glance.food.listed', { count: format.number(foodListed) }),
      now ? t('glance.food.openNow', { count: format.number(foodOpenNowRows.length) }) : null,
      t('glance.food.noId'),
      t('glance.food.snap'),
    ].filter((point): point is string => Boolean(point)),
    link: { href: '/food', label: t('nav.food') },
  };
  const verifyDetails = {
    summary: t('glance.verify.summary'),
    points: [
      t('glance.verify.total', { count: format.number(RESOURCES.length) }),
      backlog ? t('glance.verify.fresh', { count: format.number(RESOURCES.length - backlog.needsReview) }) : null,
      backlog ? t('glance.verify.backlog', { count: format.number(backlog.needsReview) }) : null,
      t('glance.verify.how'),
    ].filter((point): point is string => Boolean(point)),
    link: { href: '/about', label: t('nav.about') },
  };
  const transitDetails = {
    summary: t('glance.transit.summary'),
    points: [
      ...TRANSIT_LINES.map((line) => {
        const name = referenceLineName(line, lang);
        return `${name.value} · ${t('map.stopCount', { count: format.number(line.dorchesterStops.length) })}${name.fellBack ? ` — ${t('lang.someEnglish')}` : ''}`;
      }),
      t('glance.transit.live'),
    ],
    link: { href: '/map', label: t('nav.map') },
  };

  return (
    <MainLayout>
      <motion.div variants={pv} initial="initial" animate="enter" className="dor101-home flex flex-col gap-7 pb-10" data-cards={homeLayout.cardStyle === 'match' ? undefined : homeLayout.cardStyle}>
{show('hero') && (
          <div style={slot('hero')}>
        {/* ── Photo hero: Dorchester Bay at sunset, not a gradient ── */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-[var(--color-border)]">
          <Image
            src="/img/dorchester-bay-sunset.jpg"
            alt={t('home.heroAlt')}
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
              {/* The desktop app, downloadable as the actual .exe straight from
                  the latest GitHub release. */}
              <DownloadAppCard variant="hero" />
            </div>
            <p><PhotoCredit className="text-white/90" commonsFile="Dorchester_Bay_Boston_Harbor_sunset.jpg" author="Sswonk" license="3.0" /></p>
          </div>
        </section>

          </div>
        )}
{show('greeting') && (
          <div style={slot('greeting')}>
        {/* ── Greeting ─────────────────────────────────────── */}
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-xl font-extrabold leading-tight sm:text-2xl">
              {greeting && <>{greeting}, </>}{t('dashboard.welcome')}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {now && <>{format.date(now, 'long')} · </>}{t('dashboard.tagline')}
            </p>
          </div>
          <DataRefreshIndicator lastUpdated={lastRefresh} isRefreshing={loading} />
        </header>

          </div>
        )}
        <div style={emergencySlot}>
        <EmergencyBanner />

        </div>
{show('weather') && (
          <div style={slot('weather')}>
        {/* Live weather with what-to-wear advice, from the same NWS payload
            that drives the storm banner above every page. */}
        <WeatherPanel />

          </div>
        )}
{show('permissions') && (
          <div style={slot('permissions')}>
        {/* The optional asks: alerts, location, offline storage — one explicit
            card instead of surprise browser prompts. Dismissible. */}
        <PermissionSetup variant="banner" />

          </div>
        )}
{show('glance') && (
          <div style={slot('glance')}>
        {/* ── Stats, every one computed ───────────────────── */}
        <section aria-labelledby="glance">
          <h2 id="glance" className="mb-3 font-heading text-lg font-bold sm:text-xl">
            {t('dashboard.glance')}
          </h2>
          <motion.div variants={cv} initial="hidden" animate="visible" className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<DollarSign className="h-5 w-5" aria-hidden="true" />}
              label={t('stats.medianRent')}
              value={medianRent ?? 0}
              format="currency"
              hint={t('glance.rent.geography')}
              unavailable={medianRent === null}
              source={
                market?.acs?.vintage && market.acs.vintage !== 'unavailable'
                  ? `Census · ${t('market.vintage', { years: market.acs.vintage })}, B25064${market.acs.snapshot ? ` (${t('market.verifiedCapture')})` : ''}`
                  : 'Census · ACS · B25064'
              }
              sourceDate={market?.acs?.status === 'unavailable' ? undefined : market?.acs?.retrievedAt}
              accent="var(--color-accent-primary)"
              details={rentDetails}
            />
            <StatCard
              icon={<Clock className="h-5 w-5" aria-hidden="true" />}
              label={t('stats.foodSites')}
              value={foodOpenNow}
              unavailable={!now}
              hint={t('resources.count', { count: format.number(foodListed) })}
              source="DOR101"
              sourceDate={lastReviewedOn()}
              accent="var(--color-accent-green)"
              details={foodDetails}
            />
            <StatCard
              icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />}
              label={t('about.methodology')}
              value={backlog ? RESOURCES.length - backlog.needsReview : 0}
              unavailable={!backlog}
              hint={backlog ? t('glance.verify.backlog', { count: format.number(backlog.needsReview) }) : t('common.loading')}
              source="DOR101"
              sourceDate={lastReviewedOn()}
              accent="var(--color-accent-secondary)"
              details={verifyDetails}
            />
            <StatCard
              icon={<MapPin className="h-5 w-5" aria-hidden="true" />}
              label={t('map.transitRoutes')}
              value={TRANSIT_LINES.length}
              hint={t('map.stopCount', { count: format.number(TRANSIT_LINES.reduce((total, line) => total + line.dorchesterStops.length, 0)) })}
              source="MBTA V3"
              accent="var(--mbta-red)"
              details={transitDetails}
            />
          </motion.div>
        </section>

          </div>
        )}
{show('quick') && (
          <div style={slot('quick')}>
        {/* ── Quick links ─────────────────────────────────── */}
        <section aria-labelledby="quick">
          <h2 id="quick" className="mb-3 font-heading text-lg font-bold sm:text-xl">
            {t('dashboard.quickAccess')}
          </h2>
          <QuickLinks />
        </section>

          </div>
        )}
{show('clothing') && (
          <div style={slot('clothing')}>
        {/* Free winter clothing; the heading turns urgent when the live
            weather says a warm coat matters today. */}
        <ClothingPreview />

          </div>
        )}
{show('news') && (
          <div style={slot('news')}>
        {/* ── News + verification log ─────────────────────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <section className="min-w-0 lg:col-span-2" aria-label={t('dashboard.latestNews')}>
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
              {newsSnapshot && (
                <p role="status" className="mx-5 mb-1 flex items-start gap-1.5 text-xs text-[var(--color-text-secondary)]">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-amber)]" aria-hidden="true" />
                  {t('news.snapshotNotice', { date: format.date(newsSnapshot.asOf, 'medium') })}
                </p>
              )}
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
                            <span lang={article.language} dir="auto" className="block font-heading text-sm font-semibold leading-snug">{article.title}</span>
                            <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                              {article.source} · {format.relative(article.publishedAt)}
                            </span>
                            {article.translation ? (
                              <span className="block text-xs text-[var(--color-text-muted)]">{t('news.machineNotice')}</span>
                            ) : article.language !== lang ? (
                              <span className="block text-xs text-[var(--color-text-muted)]">
                                {newsLanguageName(article.language, t)
                                  ? t('news.originalLanguage', { language: newsLanguageName(article.language, t)! })
                                  : t('news.originalUnknown')}
                              </span>
                            ) : null}
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

          <section className="min-w-0" aria-label={t('dashboard.spotlight')}>
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
                            {now && verificationAge(resource, now) > 0 ? ` · ${t('time.daysAgo', { count: format.number(verificationAge(resource, now)) })}` : ''}
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

          </div>
        )}
{show('map') && (
          <div style={slot('map')}>
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

          </div>
        )}
{show('extras') && (
          <div style={slot('extras')}>
        {/* ── Explorer Badges + Offline Field Notes ───────── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <BadgeWall />
          </div>
          <div>
            <FieldNotes scope="dashboard" title={t('notes.title')} />
          </div>
        </div>

          </div>
        )}
        <footer style={{ order: 900 }} className="border-t border-[var(--color-border)] pt-5 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('dashboard.footer.line1')}</p>
          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{t('dashboard.footer.line2')}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {t('dashboard.footer.verified')}: {format.date(lastReviewedOn(), 'long')} · {meta.contentLocale}
          </p>
        </footer>

        <div style={{ order: 901 }}>
        <ProjectNote sources={['dor101', 'census', 'mbta', 'dotnews']} className="mt-10">
          {t('note.home')}
        </ProjectNote>
        </div>
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
