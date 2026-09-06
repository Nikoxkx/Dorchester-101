'use client';

import { useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useToast } from '@/stores/toastStore';
import { useShare } from '@/lib/share';
import { GlassButton, GlassSegmented } from '@/components/glass/GlassControls';
import { calculateAMIPercentage, getAMIBand, telHref } from '@/lib/utils';
import { HUD_AMI_FY2026, BHA_STATUS, HOTLINES } from '@/data/programs';
import { HOUSING_LISTINGS, type HousingListing } from '@/data/housing';
import { formatFor } from '@/lib/i18n';
import {
  Heart, ExternalLink, Phone, CheckCircle2, ListChecks, Share2, Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const WAITLIST_ORDER: Record<HousingListing['waitlistStatus'], number> = {
  available: 0,
  waitlist_open: 1,
  lottery: 2,
  check_source: 3,
  waitlist_closed: 4,
};

export default function AffordableHousingPage() {
  return (
    <MainLayout>
      <AffordableHousingView />
    </MainLayout>
  );
}

function AffordableHousingView() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [tab, setTab] = useState<'listings' | 'ami' | 'guide'>('listings');

  const listings = useMemo(
    () =>
      [...HOUSING_LISTINGS].sort(
        (a, b) =>
          WAITLIST_ORDER[a.waitlistStatus] - WAITLIST_ORDER[b.waitlistStatus] ||
          a.amiRequired - b.amiRequired,
      ),
    [],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-large font-bold tracking-tight text-1">{t('housing.title')}</h1>
        <p className="text-title3 text-text-2 mt-1.5 max-w-2xl leading-snug">{t('housing.description')}</p>
      </header>

      <GlassSegmented
        ariaLabel={t('housing.title')}
        value={tab}
        onChange={setTab}
        options={[
          { value: 'listings', label: t('housing.findHousing') },
          { value: 'ami', label: t('housing.amiCalculator') },
          { value: 'guide', label: t('housing.guide.title') },
        ]}
        className="no-print"
      />

      {tab === 'listings' && <Listings listings={listings} />}
      {tab === 'ami' && <AmiSection />}
      {tab === 'guide' && <Guide />}

      <section aria-label={t('housing.needHelp')} className="content-card squircle p-5">
        <p className="kicker">{t('housing.needHelp')}</p>
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          {HOTLINES.slice(0, 3).map((h) => (
            <a
              key={h.id}
              href={telHref(h.phone)}
              className="inline-flex items-center gap-2 rounded-full glass glass-clear glass-edge px-4 h-10 text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
            >
              <Phone className="w-4 h-4" strokeWidth={2} aria-hidden />
              {h.name}: <span className="num">{h.phone}</span>
            </a>
          ))}
        </div>
        <p className="text-caption2 text-text-3 mt-3">
          {t('common.source')}: BHA · {t('common.asOf')} {formatFor.date(BHA_STATUS.asOf)} — {BHA_STATUS.section8TenantBased === 'closed' ? t('housing.waitlist.waitlist_closed') : BHA_STATUS.section8TenantBased}
        </p>
      </section>
    </div>
  );
}

function Listings({ listings }: { listings: HousingListing[] }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const toast = useToast();
  const share = useShare();
  const { favorites, toggleFavorite } = useAppStore();

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {listings.map((l) => {
          const saved = favorites.some((f) => f.id === `listing-${l.id}`);
          return (
            <li key={l.id}>
              <article className="content-card squircle p-5 print-block">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-body font-bold text-1 leading-snug">{l.propertyName}</h2>
                    <p className="text-caption text-text-2 mt-0.5">{l.address}</p>
                  </div>
                  <WaitlistBadge status={l.waitlistStatus} />
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3.5 text-footnote text-text-2">
                  <span>
                    <span className="font-semibold text-1">≤ {l.amiRequired}% AMI</span>
                  </span>
                  {l.applicationDeadline && (
                    <span>
                      {t('housing.applyBy')}{' '}
                      <span className="font-semibold text-1 num">{formatFor.date(l.applicationDeadline)}</span>
                    </span>
                  )}
                  <span>{l.unitTypes.map((u) => u.type).join(' · ')}</span>
                </div>

                <p className="text-footnote text-text-1 mt-3 leading-relaxed">{l.notes}</p>

                <div className="flex flex-wrap items-center gap-2 mt-4 no-print">
                  <a
                    href={l.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink text-canvas text-subhead font-semibold hover:opacity-85 transition-opacity"
                  >
                    {t('common.apply')}
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                  </a>
                  <a
                    href={telHref(l.propertyManagerPhone)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full glass glass-clear glass-edge text-subhead font-semibold text-1 hover:bg-[var(--glass-clear-hover)]"
                  >
                    <Phone className="w-4 h-4" strokeWidth={2} aria-hidden />
                    <span className="num">{l.propertyManagerPhone}</span>
                  </a>
                  <button
                    onClick={() => {
                      const added = toggleFavorite({
                        id: `listing-${l.id}`,
                        kind: 'listing',
                        title: l.propertyName,
                        href: '/affordable-housing',
                      });
                      toast(added ? t('housing.listingSaved') : t('saved.removed'), 'success');
                    }}
                    className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]"
                    aria-label={`${saved ? t('saved.remove') : t('common.save')} — ${l.propertyName}`}
                    aria-pressed={saved}
                  >
                    <Heart className={cn('w-4 h-4', saved && 'fill-danger text-danger')} strokeWidth={2} aria-hidden />
                  </button>
                  <button
                    onClick={() => void share({ title: l.propertyName, url: l.applyUrl })}
                    className="p-2.5 rounded-full glass glass-clear glass-edge text-1 hover:bg-[var(--glass-clear-hover)]"
                    aria-label={`${t('common.share')} — ${l.propertyName}`}
                  >
                    <Share2 className="w-4 h-4" strokeWidth={2} aria-hidden />
                  </button>
                </div>

                <p className="text-caption2 text-text-3 mt-3">
                  {t('common.lastVerified')}: {formatFor.date(l.lastVerified)}
                </p>
              </article>
            </li>
          );
        })}
      </ul>
      <p className="text-caption text-text-3">{t('resources.verifyNote')}</p>
    </div>
  );
}

function WaitlistBadge({ status }: { status: HousingListing['waitlistStatus'] }) {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const label = t(`housing.waitlist.${status}` as const);
  const tone =
    status === 'available' || status === 'waitlist_open' || status === 'lottery'
      ? 'text-success'
      : status === 'waitlist_closed'
        ? 'text-danger'
        : 'text-warning';
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider shrink-0', tone)}>
      <span
        aria-hidden
        className={cn(
          'dot',
          tone === 'text-success' ? 'dot-open' : tone === 'text-danger' ? 'dot-urgent' : 'dot-pending',
        )}
      />
      {label}
    </span>
  );
}

/** AMI calculator — computes against current HUD FY2026 limits, live. */
function AmiSection() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const [size, setSize] = useState(3);
  const [income, setIncome] = useState(65000);

  const pct = calculateAMIPercentage(size, income);
  const band = getAMIBand(pct);
  const limits = HUD_AMI_FY2026.byHouseholdSize[Math.min(Math.max(size, 1), 8)];

  return (
    <section className="content-card squircle p-5 md:p-7">
      <div className="grid md:grid-cols-2 gap-7">
        <div className="space-y-5">
          <div>
            <label htmlFor="hh-size" className="text-subhead font-semibold text-1 block mb-2">
              {t('tools.householdSize')}
            </label>
            <input
              id="hh-size"
              type="range"
              min={1}
              max={8}
              step={1}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-black dark:accent-white"
              aria-valuetext={t('common.household', { n: size })}
            />
            <p className="text-caption text-text-2 mt-1 num">{t('common.household', { n: size })}</p>
          </div>
          <div>
            <label htmlFor="hh-income" className="text-subhead font-semibold text-1 block mb-2">
              {t('tools.annualIncome')}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-subhead font-bold text-text-2 num">$</span>
              <input
                id="hh-income"
                type="number"
                min={0}
                step={500}
                value={income || ''}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                className="w-full bg-[var(--surface)] rounded-[var(--radius-sm)] px-4 h-12 text-body font-bold text-1 num outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current"
              />
            </div>
          </div>
          <p className="text-caption2 text-text-3">
            {HUD_AMI_FY2026.source} · {HUD_AMI_FY2026.area} · {t('common.asOf')}{' '}
            {formatFor.date(HUD_AMI_FY2026.effectiveDate)}
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-subhead text-text-2">{t('tools.amiVar.label')}</p>
          <p className="text-[3.4rem] leading-none font-bold text-1 num mt-1">{pct}%</p>
          <p className="text-body font-bold text-1 mt-1">{band}</p>
          <div className="mt-5 space-y-1.5" aria-hidden>
            {([30, 50, 60, 80, 100] as const).map((bandPct) => (
              <div key={bandPct} className="flex items-center gap-2.5">
                <span className={cn('text-caption2 font-bold w-14 num', pct <= bandPct ? 'text-1' : 'text-text-3')}>
                  {bandPct}%
                </span>
                <span className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <span
                    className={cn('block h-full rounded-full', pct <= bandPct ? 'bg-ink' : 'bg-[var(--separator-strong)]')}
                    style={{ width: `${Math.min(100, (pct / bandPct) * 100)}%` }}
                  />
                </span>
                <span className="text-caption text-text-2 w-24 text-end num">
                  {formatFor.currency(
                    bandPct === 30 ? limits.ami30 : bandPct === 50 ? limits.ami50 : bandPct === 60 ? limits.ami60 : bandPct === 80 ? limits.ami80 : limits.ami100,
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="text-caption text-text-2 mt-4 leading-relaxed">{t('tools.amivar.bandsHint')}</p>
        </div>
      </div>
    </section>
  );
}

/** Step-by-step application guide — printable. */
function Guide() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const toast = useToast();
  const print = () => window.print();

  const steps: string[] = [
    t('housing.guide.step1'),
    t('housing.guide.step2'),
    t('housing.guide.step3'),
    t('housing.guide.step4'),
    t('housing.guide.step5'),
  ];

  return (
    <section className="content-card squircle p-5 md:p-7 print-block">
      <h2 className="text-title2 font-bold text-1">{t('housing.guide.title')}</h2>
      <ol className="mt-5 space-y-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span
              className="squircle shrink-0 w-9 h-9 grid place-items-center bg-ink text-canvas text-subhead font-bold"
              style={{ borderRadius: 12 }}
              aria-hidden
            >
              {i + 1}
            </span>
            <p className="text-subhead text-text-1 leading-relaxed pt-1.5">{step}</p>
          </li>
        ))}
      </ol>
      <div className="flex gap-2 mt-6 no-print">
        <GlassButton size="sm" onClick={print} icon={<Printer className="w-4 h-4" aria-hidden />}>
          {t('common.print')}
        </GlassButton>
        <GlassButton
          size="sm"
          onClick={() => toast(t('saved.localOnly'), 'neutral')}
          icon={<ListChecks className="w-4 h-4" aria-hidden />}
        >
          {t('tools.documents')}
        </GlassButton>
      </div>
      <div className="print-only mt-6">
        <p className="text-footnote">
          BHA: {telHref(HOTLINES[0]?.phone ?? '')} · MassAccess: massaccesshousingregistry.org ·
          {' '}{t('footer.disclaimer')}
        </p>
      </div>
      <p className="text-caption2 text-text-3 mt-4 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden />
        {t('common.source')}: BHA, MassAccess, Metro Housing|Boston
      </p>
    </section>
  );
}
