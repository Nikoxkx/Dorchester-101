'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Home,
  Search,
  Calculator,
  HelpCircle,
  Phone,
  ExternalLink,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { HousingStartHere, HowToApply } from '@/components/housing/HousingPrimer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AMIBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, calculateAMIPercentage, getAMIBand } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useIncomeLimits } from '@/hooks/useIncomeLimits';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/**
 * Where live listings actually live.
 *
 * An earlier version of this page carried three invented "sample" listings,
 * complete with rents and property-manager phone numbers. That is exactly the
 * kind of figure this project promises never to print: rents on deed-restricted
 * units depend on household size and income band, lotteries open and close
 * weekly, and a copied number is wrong before anyone can act on it. Every card
 * below is a link to the authority that owns the listing, each of which prints
 * its own last-updated date.
 */
const LIVE_LISTING_SOURCES = [
  {
    id: 'metrolist',
    name: 'Metrolist',
    operator: 'City of Boston, Mayor\u2019s Office of Housing',
    covers: 'Every City of Boston income-restricted lottery and waitlist, with an AMI eligibility estimator and a weekly digest.',
    url: 'https://www.boston.gov/metrolist',
    phone: '(617) 635-3880',
  },
  {
    id: 'housing-navigator',
    name: 'Housing Navigator Massachusetts',
    operator: 'Housing Navigator Massachusetts (nonprofit)',
    covers: 'Statewide income-restricted rentals, filterable by town, household size, rent and accessibility. Replaced the retired MassAccess registry.',
    url: 'https://housingnavigatorma.org',
    phone: '2-1-1',
  },
  {
    id: 'bha',
    name: 'Boston Housing Authority',
    operator: 'City of Boston',
    covers: 'Public housing applications and project-based vouchers are open. The Section 8 Housing Choice Voucher waiting list is closed until further notice.',
    url: 'https://www.bostonhousing.org',
    phone: '(617) 988-4000',
  },
  {
    id: 'metro-housing',
    name: 'Metro Housing|Boston',
    operator: 'Regional housing agency',
    covers: 'RAFT emergency rental assistance, voucher administration and one-to-one housing search help. Start with a phone call.',
    url: 'https://www.metrohousingboston.org',
    phone: '(617) 425-6700',
  },
  {
    id: 'mymasshome',
    name: 'MyMassHome',
    operator: 'Commonwealth of Massachusetts',
    covers: 'The homeownership counterpart to Housing Navigator: affordable homes for sale, down-payment help and first-time-buyer courses.',
    url: 'https://www.mymasshome.org',
    phone: '2-1-1',
  },
];

export default function AffordableHousingPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'listings' | 'learn' | 'calculator'>('listings');
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);
  const { data: incomeLimits, loading: amiLoading, error: amiError } = useIncomeLimits();

  const amiTable = incomeLimits?.table ?? {};
  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome, amiTable);
  const amiBand = getAMIBand(amiPercentage);

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Home className="w-8 h-8 text-[var(--color-accent-primary)]" />
            {t('housing.title')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('housing.description')}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Each card shows whether the waitlist is <strong>open</strong>, <strong>closed</strong> or run by <strong>lottery</strong>, the income band it serves as a share of area median income (AMI), and the date the listing was last confirmed with the housing office. Use the Tools page to find your AMI band first; most Boston listings are for households at or below 80% AMI. Applications are only ever made through the official link on each card.
          </p>
        </header>

        {/* Emergency Contact */}
        <Card className="bg-[var(--color-accent-primary)]/5 border-[var(--color-accent-primary)]/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <div>
                <p className="font-heading font-medium">Need help finding housing?</p>
                <p className="text-sm text-[var(--color-text-muted)]">Call Boston Housing Authority: (617) 988-4000</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => window.open('https://www.bostonhousing.org', '_blank')}
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              Visit BHA Website
            </Button>
          </CardContent>
        </Card>

        <HousingStartHere onLearnMore={() => setActiveTab('learn')} />

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--color-border)]">
          {[
            { id: 'listings', label: 'Find Housing', icon: Search },
            { id: 'learn', label: 'How It Works', icon: HelpCircle },
            { id: 'calculator', label: 'AMI Calculator', icon: Calculator },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 font-heading font-medium text-sm',
                'border-b-2 -mb-px transition-colors',
                activeTab === tab.id
                  ? 'border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Where live listings are published */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Where the live listings are</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  DOR101 does not re-publish rents, unit counts or lottery dates. A deed-restricted rent depends on the
                  household&apos;s size and income band, lotteries open and close within weeks, and a figure copied onto
                  this page would be wrong before anyone could act on it. The four sites below are the ones that own the
                  listings, and each prints the date it was last updated. Apply only through the property manager link on
                  the listing itself — nobody can charge you to apply.
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {LIVE_LISTING_SOURCES.map((source) => (
                    <li key={source.id} className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-bold">{source.name}</p>
                          <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{source.operator}</p>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 font-heading text-[11px] font-bold transition-colors hover:border-[var(--color-accent-primary)]"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{source.covers}</p>
                      <a href={`tel:${source.phone.replace(/[^0-9]/g, '')}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-primary)] hover:underline">
                        <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                        {source.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/5">
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-3">
                <Info className="h-5 w-5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
                <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  <p className="font-heading font-bold text-[var(--color-text-primary)]">Waitlist status, checked 4 October 2026</p>
                  <p className="mt-1">
                    The BHA Section 8 Housing Choice Voucher waiting list is <strong>closed until further notice</strong>;
                    BHA has said it will give about two weeks&apos; public notice before reopening. BHA public housing and
                    project-based vouchers are <strong>open</strong> to new applicants. If you are behind on rent or have a
                    notice to quit, RAFT can pay up to $7,000 per 12-month period — call 2-1-1 or Metro Housing|Boston at
                    (617) 425-6700. If you are at immediate risk of losing your home, the City&apos;s Office of Housing
                    Stability answers at (617) 635-4200, Monday–Friday 9–5.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
            <HowToApply />
            <Card>
              <CardHeader>
                <CardTitle>What is Income-Restricted Housing?</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  Income-restricted housing (sometimes called &quot;affordable housing&quot;) means apartments or homes with 
                  rents that are set lower than market rate. To qualify, your household income must be at or below 
                  a certain percentage of the Area Median Income (AMI) for Boston.
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mt-4">
                  These units exist because the government gives tax breaks or funding to developers who agree to 
                  rent some of their apartments at reduced rates. This helps ensure that lower-income families can 
                  afford to live in Boston.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What is AMI (Area Median Income)?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  AMI is the middle income for the Boston area. Every year, HUD (the U.S. Department of Housing and 
                  Urban Development) calculates this number. Housing programs use percentages of AMI to determine 
                  who qualifies.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 font-heading font-medium">Household Size</th>
                        <th className="text-right py-2 font-heading font-medium">100% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">80% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">60% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">50% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">30% AMI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((size) => {
                        const ami100 = amiTable[size] ?? amiTable[String(size)];
                        return (
                          <tr key={size} className="border-b border-[var(--color-border)]">
                            <td className="py-2">{size} person{size > 1 ? 's' : ''}</td>
                            <td className="text-right font-mono">{ami100 ? formatCurrency(ami100) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? formatCurrency(Math.round(ami100 * 0.8)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? formatCurrency(Math.round(ami100 * 0.6)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? formatCurrency(Math.round(ami100 * 0.5)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? formatCurrency(Math.round(ami100 * 0.3)) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {amiLoading && <p className="text-xs text-[var(--color-text-muted)]">Loading the current HUD income limits…</p>}
                {amiError && <p className="text-xs text-[var(--color-text-muted)]">HUD income limits are unavailable right now — no figures are shown rather than stale ones.</p>}
                {!amiLoading && !amiError && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Source: HUD FY{incomeLimits?.fiscalYear} Income Limits for {incomeLimits?.area} (effective {incomeLimits?.effectiveDate}).
                    100% AMI is twice HUD&apos;s published 50% limit for the household size; other bands are the same ladder at the published breakpoints.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to Apply — Step by Step</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { step: 1, title: 'Check Your Income', desc: 'Use our calculator to see what AMI band you fall into.' },
                  { step: 2, title: 'Gather Documents', desc: 'You\'ll need: ID, proof of income (pay stubs, tax returns), proof of household size.' },
                  { step: 3, title: 'Find Open Listings', desc: 'Search Metrolist (Boston) or Housing Navigator Massachusetts (statewide) — the open-listings tab above links both.' },
                  { step: 4, title: 'Submit Application', desc: 'Apply online or pick up a paper application at the property office.' },
                  { step: 5, title: 'Wait for Lottery', desc: 'If there are more applicants than units, a lottery selects who moves forward.' },
                  { step: 6, title: 'Interview & Verification', desc: 'If selected, you\'ll verify your income and household.' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--color-accent-primary)] text-white flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <h4 className="font-heading font-medium">{title}</h4>
                      <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[var(--color-accent-primary)]" />
                  AMI Income Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    Household Size
                  </label>
                  <select
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg text-sm',
                      'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                      'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                    )}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                      <option key={size} value={size}>
                        {size} person{size > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    Annual Household Income (before taxes)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      className={cn(
                        'w-full pl-8 pr-3 py-2.5 rounded-lg text-sm font-mono',
                        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                      )}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Include all household members&apos; income combined
                  </p>
                </div>

                <Button variant="primary" className="w-full">
                  Calculate My AMI
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-[var(--color-accent-primary)]/10">
              <CardHeader>
                <CardTitle>Your Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-5xl font-mono font-bold text-[var(--color-accent-primary)]">
                    {amiPercentage}%
                  </div>
                  <div className="text-lg font-heading font-medium mt-2">
                    of Area Median Income
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                  <p className="text-center font-heading font-medium">
                    You qualify for housing marked:
                  </p>
                  <div className="flex justify-center mt-3">
                    <AMIBadge percentage={amiPercentage <= 30 ? 30 : amiPercentage <= 50 ? 50 : amiPercentage <= 60 ? 60 : amiPercentage <= 80 ? 80 : 100} />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="text-[var(--color-text-secondary)]">
                    <strong>What this means:</strong> Based on a household of {householdSize} with an annual income 
                    of {formatCurrency(annualIncome)}, you fall into the <strong>{amiBand}</strong> category.
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    You can apply for housing listed at your AMI level or higher. For example, if you qualify 
                    at 50% AMI, you can apply for 50%, 60%, and 80% AMI units.
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <Button variant="secondary" className="w-full" onClick={() => setActiveTab('listings')}>
                    View Available Housing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <ProjectNote sources={['bha', 'bostongov', 'bpda', 'hud']}>
          Waitlist status and lottery dates are read from the Boston Housing Authority, Metrolist and Housing Navigator Massachusetts, and re-checked by hand; the date of the last check is printed on this page. DOR101 publishes no rents and no unit counts of its own — that would be a figure out of date within the week. Income limits are HUD&apos;s published figures for the Boston metro, fetched live. Apply only through the official portals linked here; DOR101 never takes an application.
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
