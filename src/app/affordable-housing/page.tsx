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
import { AddToCalendar } from '@/components/housing/AddToCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AMIBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, calculateAMIPercentage, getAMIBand } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
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
 * frequently, and copied figures can quickly go out of date. These links point
 * to organizations that provide listings or housing assistance; verify the
 * specific application instructions and current details with the provider.
 */
const LIVE_LISTING_SOURCES = [
  { id: 'metrolist', name: 'Metrolist', operatorKey: 'housing.operator.metrolist', coversKey: 'housing.cover.metrolist', url: 'https://www.boston.gov/metrolist', phone: '(617) 635-3880' },
  { id: 'housing-navigator', name: 'Housing Navigator Massachusetts', operatorKey: 'housing.operator.navigator', coversKey: 'housing.cover.navigator', url: 'https://housingnavigatorma.org', phone: null },
  { id: 'bha', name: 'Boston Housing Authority', operatorKey: 'housing.operator.city', coversKey: 'housing.cover.bha', url: 'https://www.bostonhousing.org', phone: '(617) 988-4000' },
  { id: 'metro-housing', name: 'Metro Housing|Boston', operatorKey: 'housing.operator.regional', coversKey: 'housing.cover.metro', url: 'https://www.metrohousingboston.org', phone: '(617) 425-6700' },
  { id: 'mymasshome', name: 'MyMassHome', operatorKey: 'housing.operator.chapa', coversKey: 'housing.cover.mymasshome', url: 'https://www.mymasshome.org', phone: null },
] as const;

export default function AffordableHousingPage() {
  const { t, format, lang } = useI18n();
  const [activeTab, setActiveTab] = useState<'listings' | 'learn' | 'calculator'>('listings');
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState('50000');
  const { data: incomeLimits, loading: amiLoading, error: amiError } = useIncomeLimits();

  const amiTable = incomeLimits?.table ?? {};
  const annualIncomeNumber = annualIncome.trim() ? Number(annualIncome) : NaN;
  const hasValidAnnualIncome = Number.isFinite(annualIncomeNumber) && annualIncomeNumber >= 0;
  const hasIncomeLimit = Number.isFinite(amiTable[householdSize]) && amiTable[householdSize] > 0;
  const amiPercentage = hasIncomeLimit && hasValidAnnualIncome ? calculateAMIPercentage(householdSize, annualIncomeNumber, amiTable) : 0;
  const amiBand = amiPercentage > 100
    ? t('housing.marketRate')
    : t('badge.ami', { percent: format.number(parseInt(getAMIBand(amiPercentage), 10)) });

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
            {t('housing.pageIntro')}
          </p>
        </header>
        {lang !== 'en' && (
          <p role="note" className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {t('clothing.translationDraft')}
          </p>
        )}

        {/* Housing Contact */}
        <Card className="bg-[var(--color-accent-primary)]/5 border-[var(--color-accent-primary)]/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[var(--color-accent-primary)]" />
              <div>
                <p className="font-heading font-medium">{t('housing.needHelp')}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{t('housing.callBHA')}: (617) 988-4000</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open('https://www.bostonhousing.org', '_blank')}
              rightIcon={<ExternalLink className="w-4 h-4" />}
            >
              {t('housing.visitBha')}
            </Button>
          </CardContent>
        </Card>

        <HousingStartHere onLearnMore={() => setActiveTab('learn')} />

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--color-border)]">
          {[
            { id: 'listings', label: t('housing.tabListings'), icon: Search },
            { id: 'learn', label: t('housing.tabLearn'), icon: HelpCircle },
            { id: 'calculator', label: t('tools.tabAmi'), icon: Calculator },
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
                <CardTitle>{t('housing.sourcesHeading')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {t('housing.sourcesIntro')}
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {LIVE_LISTING_SOURCES.map((source) => (
                    <li key={source.id} className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-bold">{source.name}</p>
                          <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">{t(source.operatorKey)}</p>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-border)] px-2.5 py-1 font-heading text-[11px] font-bold transition-colors hover:border-[var(--color-accent-primary)]"
                        >
                          {t('common.openShort')}
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">{t(source.coversKey)}</p>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        {source.phone && (
                          <a href={`tel:${source.phone.replace(/[^0-9]/g, '')}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-accent-primary)] hover:underline">
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            {source.phone}
                          </a>
                        )}
                        <AddToCalendar
                          label={t('housing.reminder')}
                          event={{
                            title: t('housing.reminderTitle', { source: source.name }),
                            description: source.phone
                              ? `${t(source.coversKey)} · ${t('common.call')}: ${source.phone}`
                              : t(source.coversKey),
                            url: source.url,
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-[var(--color-accent-amber)]/40 bg-[var(--color-accent-amber)]/5">
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:gap-3">
                <Info className="h-5 w-5 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
                <div className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  <p className="font-heading font-bold text-[var(--color-text-primary)]">{t('housing.statusChecked', { date: format.date(new Date(2026, 9, 31), 'long') })}</p>
                  <p className="mt-1">
                    {t('housing.statusBody')}
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
                <CardTitle>{t('housing.learnTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('primer.capBody')}
                </p>
                <p className="text-[var(--color-text-secondary)] leading-relaxed mt-4">
                  {t('primer.bandBody')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('housing.amiHeading')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-[var(--color-text-secondary)] leading-relaxed">
                  {t('housing.amiBody')}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('market.amiExplanation')}</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)]">
                        <th className="text-left py-2 font-heading font-medium">{t('tools.householdSize')}</th>
                        <th className="text-right py-2 font-heading font-medium">{t('badge.ami', { percent: format.number(100) })}</th>
                        <th className="text-right py-2 font-heading font-medium">{t('badge.ami', { percent: format.number(80) })}</th>
                        <th className="text-right py-2 font-heading font-medium">{t('badge.ami', { percent: format.number(60) })}</th>
                        <th className="text-right py-2 font-heading font-medium">{t('badge.ami', { percent: format.number(50) })}</th>
                        <th className="text-right py-2 font-heading font-medium">{t('badge.ami', { percent: format.number(30) })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((size) => {
                        const rawLimit = amiTable[size] ?? amiTable[String(size)];
                        const ami100 = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : null;
                        return (
                          <tr key={size} className="border-b border-[var(--color-border)]">
                            <td className="py-2">{t('housing.people', { count: size })}</td>
                            <td className="text-right font-mono">{ami100 ? format.currency(ami100) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? format.currency(Math.round(ami100 * 0.8)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? format.currency(Math.round(ami100 * 0.6)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? format.currency(Math.round(ami100 * 0.5)) : '—'}</td>
                            <td className="text-right font-mono">{ami100 ? format.currency(Math.round(ami100 * 0.3)) : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {amiLoading && <p className="text-xs text-[var(--color-text-muted)]">{t('tools.loadingLimits')}</p>}
                {amiError && <p className="text-xs text-[var(--color-text-muted)]">{t('tools.limitsUnavailable')}</p>}
                {incomeLimits?.snapshot && <p role="status" className="text-xs text-[var(--color-text-muted)]">{t('tools.cachedNote', { fy: incomeLimits.fiscalYear ? format.year(incomeLimits.fiscalYear) : '' })}</p>}
                {!amiLoading && !amiError && incomeLimits && (
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {t('housing.limitsSource', { fy: incomeLimits?.fiscalYear ? format.year(incomeLimits.fiscalYear) : '', area: incomeLimits?.area ?? '', date: incomeLimits?.effectiveDate ? format.date(`${incomeLimits.effectiveDate}T12:00:00`, 'long') : '' })}
                  </p>
                )}
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
                  {t('tools.amiTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="housing-household-size" className="block text-sm font-heading font-medium mb-2">
                    {t('tools.householdSize')}
                  </label>
                  <select
                    id="housing-household-size"
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
                        {t('housing.people', { count: size })}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="housing-annual-income" className="block text-sm font-heading font-medium mb-2">
                    {t('tools.annualIncome')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      id="housing-annual-income"
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      min="0"
                      aria-invalid={!hasValidAnnualIncome}
                      className={cn(
                        'w-full pl-8 pr-3 py-2.5 rounded-lg text-sm font-mono',
                        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                      )}
                    />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {t('primer.step1.body')}
                  </p>
                </div>

                <Button variant="primary" className="w-full">
                  {t('housing.calculate')}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[var(--color-accent-primary)]/5 to-[var(--color-accent-primary)]/10">
              <CardHeader>
                <CardTitle>{t('tools.results')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!hasIncomeLimit ? (
                  <p role="status" className="text-sm text-[var(--color-text-secondary)]">
                    {amiLoading ? t('tools.loadingLimits') : t('tools.limitsUnavailable')}
                  </p>
                ) : !hasValidAnnualIncome ? (
                  <p role="status" className="text-sm text-[var(--color-text-secondary)]">{t('tools.enterValidAnnual')}</p>
                ) : (
                  <>
                    <div className="text-center py-4">
                      <div className="text-5xl font-mono font-bold text-[var(--color-accent-primary)]">{format.percent(amiPercentage / 100)}</div>
                      <div className="text-lg font-heading font-medium mt-2">{t('tools.ofAmi')}</div>
                    </div>
                    <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                      <p className="text-center font-heading font-medium">{t('tools.qualifyFor')}</p>
                      <div className="flex justify-center mt-3">
                        {amiPercentage > 100 ? amiBand : <AMIBadge percentage={amiPercentage <= 30 ? 30 : amiPercentage <= 50 ? 50 : amiPercentage <= 60 ? 60 : amiPercentage <= 80 ? 80 : 100} />}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-[var(--color-text-secondary)]">{t('market.amiExplanation')}</p>
                      {incomeLimits?.snapshot && <p role="status" className="text-[var(--color-text-secondary)]">{t('tools.cachedNote', { fy: incomeLimits.fiscalYear ? format.year(incomeLimits.fiscalYear) : '' })}</p>}
                      <p className="text-[var(--color-text-secondary)]">{t('housing.resultDetail', { size: format.number(householdSize), income: format.currency(annualIncomeNumber), band: amiBand })}</p>
                      <p className="text-[var(--color-text-secondary)]">{t('housing.resultExample')}</p>
                    </div>
                    <div className="pt-4 border-t border-[var(--color-border)]">
                      <Button variant="secondary" className="w-full" onClick={() => setActiveTab('listings')}>
                        {t('housing.tabListings')}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        <ProjectNote sources={['bha', 'bostongov', 'bpda', 'hud']}>
          {t('note.housing')}
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
