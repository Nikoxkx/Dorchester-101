'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, Bot, CircleAlert, Gauge, Languages, ShieldCheck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ReportProblem } from '@/components/a11y/ReportProblem';
import { DownloadAppCard } from '@/components/pwa/DownloadAppCard';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/hook';
import { useHydratedNow } from '@/hooks/useNow';
import { useAppStore } from '@/stores/appStore';
import { LANGUAGES, languageMeta } from '@/i18n/config';
import { TOTAL_KEYS, localeCoverage } from '@/i18n';
import type { PhotoCredit } from './page';
import { CACHE_TTL } from '@/lib/cache';
import { APP_VERSION, CONTACT_EMAIL, REPO_URL, SITE_URL, hasEmailContact } from '@/lib/site';
import { NEWS_FEEDS, TRANSIT_FEEDS } from '@/data/feeds';
import { RESOURCES, lastReviewedOn, reviewBacklog } from '@/data/resources';
import { TRANSIT_DATA_AS_OF } from '@/data/transit';
import { SourceMark } from '@/components/sources/SourceMark';
import { PhotoCredit as CommonsPhotoCredit } from '@/components/sources/PhotoCredit';
import { FEED_SOURCE, SOURCE_CADENCE_KEYS, SOURCE_LICENCE_KEYS, SOURCES, type SourceId } from '@/data/sources';
import { Compass, GitFork as Github, Heart, Target } from 'lucide-react';
import type { TranslationKey } from '@/i18n/en';

/**
 * How this project works, stated in a way a reader can check.
 *
 * Every number on this page is computed from the code that produces it: the feed
 * list is the registry the news route reads, the cadence values are the constants
 * the cache actually uses, the coverage figure counts the real dictionary, and the
 * transit block is fetched from the same metadata endpoint the map falls back to.
 * Nothing here is a promise about future updates.
 */

interface Meta {
  apiKey?: 'configured' | 'anonymous';
  endpoint?: string;
  stops?: number;
  note?: string;
}

interface MarketStatus {
  hudFmr?: { status?: 'available' | 'not-installed' | string };
  source?: string;
}

export function AboutView({ credits }: { credits: PhotoCredit[] }) {
  const { t, format, lang } = useI18n();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [market, setMarket] = useState<MarketStatus | null>(null);
  // Refetch when the app-wide refresh signal fires (permission granted,
  // connection restored, Settings → Refresh now), so the live-source statuses
  // on this page never sit on a stale reading.
  const dataEpoch = useAppStore((s) => s.dataEpoch);
  const now = useHydratedNow(60_000);

  useEffect(() => {
    let cancelled = false;
    void Promise.allSettled([fetch('/api/mbta?type=meta').then((r) => r.json()), fetch('/api/market-data').then((r) => r.json())]).then(
      ([metaResult, marketResult]) => {
        if (cancelled) return;
        if (metaResult.status === 'fulfilled') setMeta(metaResult.value as Meta);
        if (marketResult.status === 'fulfilled') setMarket(marketResult.value as MarketStatus);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [dataEpoch]);

  const backlog = now === null ? null : reviewBacklog(new Date(now));
  const freshCount = backlog ? RESOURCES.length - backlog.needsReview : null;
  const minutes = (ms: number) => Math.round(ms / 60_000);

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 pb-12">
        <header className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <Image
              src="/img/dorchester-bay-sunset.jpg"
              alt={t('about.photo.bay')}
              width={1600}
              height={900}
              priority
              className="h-44 w-full object-cover sm:h-56"
              sizes="100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-2.5">
              <p className="font-heading text-[11px] text-white/85">
                {t('about.photo.bay')} · <CommonsPhotoCredit className="text-white/90" commonsFile="Dorchester_Bay_Boston_Harbor_sunset.jpg" author="Sswonk" license="3.0" />
              </p>
            </div>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('about.title')}</h1>
            <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.intro')}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="blue">
              <ShieldCheck className="me-1 h-3 w-3" aria-hidden="true" />
              {t('about.builtBy')}
            </Badge>
            <Badge variant="default">
              <Gauge className="me-1 h-3 w-3" aria-hidden="true" />
              {t('about.buildVersion', { version: APP_VERSION })}
            </Badge>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="m-0 overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <Image
              src="/img/hoods/fields-corner.jpg"
              alt={t('about.photo.train')}
              width={1200}
              height={800}
              className="h-40 w-full object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
            <figcaption className="px-3 py-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
              <p>{t('about.photo.train')}</p>
              <CommonsPhotoCredit commonsFile="Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg" author="Hutima" license="4.0" />
            </figcaption>
          </figure>
          <figure className="m-0 overflow-hidden rounded-2xl border border-[var(--color-border)]">
            <Image
              src="/img/hoods/codman-square-church-2019.jpg"
              alt={t('about.photo.square')}
              width={1200}
              height={800}
              className="h-40 w-full object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
            />
            <figcaption className="px-3 py-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
              <p>{t('about.photo.square')}</p>
              <CommonsPhotoCredit commonsFile="Second_Church_in_Dorchester.jpg" author="Staruski1" license="4.0" />
            </figcaption>
          </figure>
        </div>

        {/* ── What this is, who made it, what it is for ─────────────── */}
        <section aria-labelledby="mission" className="dor101-glass rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-5">
          <h2 id="mission" className="flex items-center gap-2 font-heading text-lg font-bold">
            <Compass className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
            {t('about.mission.title')}
          </h2>
          <div className="mt-3 grid gap-5 md:grid-cols-3">
            <div>
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold">
                <Target className="h-4 w-4 text-[var(--color-accent-secondary)]" aria-hidden="true" /> {t('about.mission.goal')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {t('about.mission.goalBody')}
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold">
                <Heart className="h-4 w-4 text-[var(--color-accent-secondary)]" aria-hidden="true" /> {t('about.mission.maker')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {t('about.mission.makerBody')}
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 font-heading text-sm font-bold">
                <Github className="h-4 w-4" aria-hidden="true" /> {t('about.mission.run')}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {t('about.mission.runBody')}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <p className="font-heading font-bold text-[var(--color-text-primary)]">{t('about.mission.promises')}</p>
            <ol className="mt-1.5 list-decimal space-y-1 ps-5">
              <li>{t('about.mission.accuracy')}</li>
              <li>{t('about.mission.transparency')}</li>
              <li>{t('about.mission.funding')}</li>
            </ol>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a href={REPO_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-2 font-heading text-xs font-bold text-white">
              <Github className="h-3.5 w-3.5" aria-hidden="true" /> {t('about.sourceCode')}
            </a>
            <a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]">
              {t('about.reportIssue')}
            </a>
            <a href={`${REPO_URL}/blob/main/README.md`} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]">
              {t('about.contribute')}
            </a>
          </div>

          {/* The actual .exe files, resolved from the latest GitHub release. */}
          <DownloadAppCard className="mt-4" />
        </section>

        {/* ── Where AI was used, and where it was not ───────────────── */}
        <section aria-labelledby="ai-use" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 id="ai-use" className="flex items-center gap-2 font-heading text-base font-bold">
            <Bot className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
            {t('about.aiUse')}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.aiUseBody')}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.aiUseRuntime')}</p>
          <a
            href={`${REPO_URL}/blob/main/docs/AI-USAGE.md`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
          >
            {t('about.aiUseDoc')}
          </a>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.maintained')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.maintainedBody')}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.freshnessNote')}</p>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.methodology')}</h2>
          <ol className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            <li>{t('about.method1')}</li>
            <li>{t('about.method2')}</li>
            <li>{t('about.method3')}</li>
          </ol>
          <dl className="mt-3 grid gap-2 sm:grid-cols-3">
            <Stat label={t('dashboard.footer.verified')} value={format.date(lastReviewedOn(), 'medium')} icon={<BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />} />
            <Stat label={t('resources.count', { count: format.number(RESOURCES.length) })} value={freshCount === null ? t('common.loading') : `${format.number(freshCount)} / ${format.number(RESOURCES.length)}`} icon={<ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />} />
            {backlog ? (
              <Stat
                label={t('notifications.reviewBacklog', { count: format.number(backlog.needsReview) })}
                value={backlog.needsReview > 0 ? t('directory.staleWarning') : t('map.alertsNone')}
                icon={<CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />}
                warn={backlog.needsReview > 0}
              />
            ) : (
              <Stat label={t('directory.needsReview')} value={t('common.loading')} icon={<CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />} />
            )}
          </dl>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.sources')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.sourcesBody')}</p>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-xs">
              <caption className="sr-only">{t('common.sources')}</caption>
              <thead>
                <tr className="border-b border-[var(--color-border)] text-start">
                  <th scope="col" className="py-1.5 pe-3 text-start font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {t('common.sources')}
                  </th>
                  <th scope="col" className="py-1.5 pe-3 text-start font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {t('about.whatItGives')}
                  </th>
                  <th scope="col" className="py-1.5 text-start font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                    {t('about.howOften')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {NEWS_FEEDS.map((feed) => (
                  <tr key={feed.id} className="border-b border-[var(--color-border)]/60 align-top">
                    <th scope="row" className="py-1.5 pe-3 text-start font-heading font-semibold">
                      {FEED_SOURCE[feed.id] ? (
                        <SourceMark id={FEED_SOURCE[feed.id]} size="xs" withName href={feed.homepage} />
                      ) : (
                        <a href={feed.homepage} target="_blank" rel="noreferrer noopener" className="hover:underline">
                          {feed.name}
                        </a>
                      )}
                    </th>
                    <td className="py-1.5 pe-3 leading-snug text-[var(--color-text-secondary)]">{t(`feed.news.${feed.id}` as TranslationKey)}</td>
                    <td className="py-1.5 tabular-nums text-[var(--color-text-muted)]">
                      {t('map.updatedEvery', { seconds: String(minutes(CACHE_TTL.NEWS) * 60) })}
                    </td>
                  </tr>
                ))}
                {TRANSIT_FEEDS.map((feed) => (
                  <tr key={feed.id} className="border-b border-[var(--color-border)]/60 align-top">
                    <th scope="row" className="py-1.5 pe-3 text-start font-heading font-semibold">
                      <SourceMark id="mbta" size="xs" withName href={`https://api-v3.mbta.com/docs/swagger/index.html#/${feed.endpoint.replace(/^\//, '')}`} />
                      <span className="ms-1 font-mono text-[10px] text-[var(--color-text-muted)]">{feed.endpoint}</span>
                    </th>
                    <td className="py-1.5 pe-3 leading-snug text-[var(--color-text-secondary)]">{t(`feed.transit.${feed.id}` as TranslationKey)}</td>
                    <td className="py-1.5 tabular-nums text-[var(--color-text-muted)]">{t('map.updatedEvery', { seconds: String(feed.cadenceSeconds) })}</td>
                  </tr>
                ))}
                <tr className="border-b border-[var(--color-border)]/60 align-top">
                  <th scope="row" className="py-1.5 pe-3 text-start font-heading font-semibold"><SourceMark id="census" size="xs" withName /></th>
                  <td className="py-1.5 pe-3 leading-snug text-[var(--color-text-secondary)]">
                    {t('stats.medianRent')} · {t('stats.medianSale')}
                  </td>
                  <td className="py-1.5 tabular-nums text-[var(--color-text-muted)]">{t('about.referenceAsOf', { date: format.date(TRANSIT_DATA_AS_OF, 'medium') })}</td>
                </tr>
                <tr className="align-top">
                  <th scope="row" className="py-1.5 pe-3 text-start font-heading font-semibold"><SourceMark id="hud" size="xs" withName /></th>
                  <td className="py-1.5 pe-3 leading-snug text-[var(--color-text-secondary)]">
                    {market?.hudFmr?.status === 'available' ? t('market.currentSnapshot') : t('error.dataUnavailable')}
                  </td>
                  <td className="py-1.5 tabular-nums text-[var(--color-text-muted)]">{t('map.updatedEvery', { seconds: String(minutes(CACHE_TTL.MARKET_DATA) * 60) })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] leading-snug text-[var(--color-text-muted)]">
            {meta ? (meta.apiKey === 'configured' ? t('about.keyConfigured') : t('about.keyAnonymous')) : t('map.predictionsLoading')}
            {meta?.endpoint ? ` · ${meta.endpoint}` : ''} · {t('map.stopCount', { count: String(meta?.stops ?? 0) })}
          </p>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.publisherTitle')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t('about.publisherBody')}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(SOURCES) as SourceId[]).map((id) => (
              <li key={id} className="flex items-start gap-2.5 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-2.5">
                <SourceMark id={id} size="md" />
                <div className="min-w-0 text-xs leading-snug">
                  <p className="font-heading font-bold">{SOURCES[id].name}</p>
                  <p className="mt-0.5 text-[var(--color-text-secondary)]">{t(`sources.info.${id}`)}</p>
                  <p className="mt-0.5 text-[var(--color-text-muted)]">{SOURCE_CADENCE_KEYS[id] ? t(SOURCE_CADENCE_KEYS[id]!) : SOURCES[id].cadence}{SOURCES[id].licence ? ` · ${SOURCE_LICENCE_KEYS[id] ? t(SOURCE_LICENCE_KEYS[id]!) : SOURCES[id].licence}` : ''}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="flex items-center gap-1.5 font-heading text-base font-bold">
            <Languages className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
            {t('lang.coverage')}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('lang.note')}</p>
          <ul className="mt-2.5 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {LANGUAGES.map((language) => {
              const coverage = localeCoverage(language.code);
              return (
                <li key={language.code} className="flex items-baseline justify-between gap-2 rounded-lg border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/80 px-2.5 py-1.5">
                  <span className="min-w-0 truncate">
                    {/* Previewing a locale from here would strand a reader with no
                        obvious way back, so this hands over to the control that
                        owns the change and states its own destination. */}
                    <Link href="/settings#language" className="font-heading text-xs font-bold hover:underline" title={t('lang.change')}>
                      <span lang={language.contentLocale} dir={language.dir}>{language.nativeName}</span>
                    </Link>
                    <span className="ms-1.5 text-[10px] uppercase text-[var(--color-text-muted)]">{language.code2}</span>
                  </span>
                  <span className="shrink-0 font-heading text-xs font-bold tabular-nums">
                    <span className="font-normal text-[var(--color-text-muted)]">{t('lang.coverageValue', { percent: coverage.percent, total: TOTAL_KEYS })}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.corrections')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('about.correctionsBody')}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <ReportProblem />
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-2 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
            >
              {t('about.openSource')}
            </a>
            {hasEmailContact && (
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 p-4">
          <h2 className="font-heading text-base font-bold">{t('about.license')}</h2>
          <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
            {credits.map((credit) => (
              <li key={credit.file} className="rounded-lg border border-[var(--color-border)]/70 px-2.5 py-2">
                <span className="font-mono text-[11px]">{credit.file}</span>
                <span className="mx-1.5 text-[var(--color-text-muted)]">·</span>
                {credit.licence ? <span dir="auto">{credit.licence}</span> : <span className="text-[var(--color-accent-amber)]">{credit.note}</span>}
                {credit.licence && credit.note && <span className="mt-1 block text-[var(--color-text-muted)]" dir="auto">{credit.note}</span>}
                {credit.commons && (
                  <a
                    href={credit.commons}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-0.5 block text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2"
                  >
                    {t('about.commonsPage')}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-[11px] leading-snug text-[var(--color-text-muted)]">
            {t('map.dataCredits')} ·{' '}
            <Link href={REPO_URL} className="underline decoration-dotted underline-offset-2 hover:text-[var(--color-accent-primary)]">
              IMAGE-CREDITS.md
            </Link>
          </p>
          <p className="mt-2 text-[11px] leading-snug text-[var(--color-text-muted)]" dir="auto">
            {SITE_URL.replace(/^https?:\/\//, '')} · {languageMeta(lang).contentLocale}
          </p>
        </section>
      </div>
    </MainLayout>
  );
}

function Stat({ label, value, icon, warn }: { label: string; value: string; icon: React.ReactNode; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]/80 p-2.5">
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
        <span className={warn ? 'text-[var(--color-accent-amber)]' : 'text-[var(--color-accent-green)]'}>{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)]">{value}</dd>
    </div>
  );
}
