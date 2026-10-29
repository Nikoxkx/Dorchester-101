'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Calculator, DollarSign, Home, FileText, AlertTriangle, CheckCircle, KeyRound, ListChecks, CalendarClock } from 'lucide-react';
import { BenefitsScreener, EvictionTimeline, MoveInCostTool } from '@/components/tools/ExtraTools';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, calculateRentBurden, calculateAMIPercentage, getAMIBand } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useIncomeLimits } from '@/hooks/useIncomeLimits';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ToolsPage() {
  const { t, format } = useI18n();
  const [activeTab, setActiveTab] = useState<'rent' | 'ami' | 'movein' | 'benefits' | 'eviction' | 'documents'>('rent');
  
  // Rent burden calculator state
  const [monthlyIncome, setMonthlyIncome] = useState(4500);
  const [monthlyRent, setMonthlyRent] = useState(2000);
  
  // AMI calculator state
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);
  const { data: incomeLimits, loading: amiLoading, error: amiError } = useIncomeLimits();

  const amiTable = incomeLimits?.table ?? {};
  const rentBurden = calculateRentBurden(monthlyIncome, monthlyRent);
  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome, amiTable);
  const amiBand = getAMIBand(amiPercentage);

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Calculator className="w-8 h-8 text-[var(--color-accent-primary)]" />
            {t('tools.heading')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('tools.intro')}
          </p>
        </header>

        {/* Tab Navigation */}
        <div role="tablist" aria-label={t('tools.tabAria')} className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] [scrollbar-width:thin]">
          {[
            { id: 'rent', label: t('tools.tabRent'), icon: DollarSign },
            { id: 'ami', label: t('tools.tabAmi'), icon: Home },
            { id: 'movein', label: t('tools.tabMoveIn'), icon: KeyRound },
            { id: 'benefits', label: t('tools.tabBenefits'), icon: ListChecks },
            { id: 'eviction', label: t('tools.tabEviction'), icon: CalendarClock },
            { id: 'documents', label: t('tools.tabDocs'), icon: FileText },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex shrink-0 items-center gap-2 px-3 py-3 font-heading font-medium text-sm whitespace-nowrap',
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

        {/* Rent Burden Calculator */}
        {activeTab === 'rent' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.rentTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    {t('tools.monthlyGross')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className={cn(
                        'w-full pl-8 pr-3 py-2.5 rounded-lg font-mono',
                        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    {t('tool.moveIn.rent')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      className={cn(
                        'w-full pl-8 pr-3 py-2.5 rounded-lg font-mono',
                        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              rentBurden.status === 'affordable' && 'bg-[var(--color-accent-green)]/5',
              rentBurden.status === 'cost-burdened' && 'bg-[var(--color-accent-amber)]/5',
              rentBurden.status === 'severely-burdened' && 'bg-[var(--color-accent-secondary)]/5',
            )}>
              <CardHeader>
                <CardTitle>{t('tools.results')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className={cn(
                    'text-5xl font-mono font-bold',
                    rentBurden.status === 'affordable' && 'text-[var(--color-accent-green)]',
                    rentBurden.status === 'cost-burdened' && 'text-[var(--color-accent-amber)]',
                    rentBurden.status === 'severely-burdened' && 'text-[var(--color-accent-secondary)]',
                  )}>
                    {rentBurden.percentage}%
                  </div>
                  <div className="text-lg font-heading font-medium mt-2">
                    {t('tools.incomeToRent')}
                  </div>
                </div>

                <div className={cn(
                  'p-4 rounded-lg flex items-center gap-3',
                  rentBurden.status === 'affordable' && 'bg-[var(--color-accent-green)]/10',
                  rentBurden.status === 'cost-burdened' && 'bg-[var(--color-accent-amber)]/10',
                  rentBurden.status === 'severely-burdened' && 'bg-[var(--color-accent-secondary)]/10',
                )}>
                  {rentBurden.status === 'affordable' ? (
                    <CheckCircle className="w-6 h-6 text-[var(--color-accent-green)]" />
                  ) : (
                    <AlertTriangle className={cn(
                      'w-6 h-6',
                      rentBurden.status === 'cost-burdened' && 'text-[var(--color-accent-amber)]',
                      rentBurden.status === 'severely-burdened' && 'text-[var(--color-accent-secondary)]',
                    )} />
                  )}
                  <div>
                    <p className="font-heading font-semibold">{rentBurden.label}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {rentBurden.status === 'affordable'
                        ? t('tools.burdenOk')
                        : rentBurden.status === 'cost-burdened'
                        ? t('tools.burdenMid')
                        : t('tools.burdenHigh')
                      }
                    </p>
                  </div>
                </div>

                {rentBurden.status !== 'affordable' && (
                  <Button 
                    variant="primary" 
                    className="w-full"
                    onClick={() => window.location.href = '/affordable-housing'}
                  >
                    {t('tools.explore')}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* AMI Calculator */}
        {activeTab === 'ami' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('tools.amiTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    {t('tools.householdSize')}
                  </label>
                  <select
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Number(e.target.value))}
                    className={cn(
                      'w-full px-3 py-2.5 rounded-lg',
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
                    {t('tools.annualIncome')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">$</span>
                    <input
                      type="number"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(Number(e.target.value))}
                      className={cn(
                        'w-full pl-8 pr-3 py-2.5 rounded-lg font-mono',
                        'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                      )}
                    />
                  </div>
                </div>

                <div className="text-sm text-[var(--color-text-muted)]">
                  {amiLoading && <p>{t('tools.loadingLimits')}</p>}
                  {amiError && <p>{t('tools.limitsUnavailable')}</p>}
                  {!amiLoading && !amiError && (
                    <>
                      <p>
                        {t('tools.fyLine', { fy: incomeLimits?.fiscalYear ?? '', date: incomeLimits?.effectiveDate ?? '', size: householdSize ?? 0 })}
                      </p>
                      <p className="font-mono font-medium text-[var(--color-text-primary)]">
                        {format.currency(amiTable[householdSize] ?? amiTable[String(householdSize)] ?? 0, { cents: true })}
                      </p>
                      {incomeLimits?.snapshot && (
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                          {t('tools.cachedNote', { fy: incomeLimits.fiscalYear ?? '' })}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-accent-primary)]/5">
              <CardHeader>
                <CardTitle>{t('tools.amiLevel')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-5xl font-mono font-bold text-[var(--color-accent-primary)]">
                    {amiPercentage}%
                  </div>
                  <div className="text-lg font-heading font-medium mt-2">
                    {t('tools.ofAmi')}
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">{t('tools.qualifyFor')}</p>
                  <p className="font-heading font-bold text-lg text-[var(--color-accent-primary)]">
                    {amiBand}
                  </p>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t('tools.canApply', { band: amiBand })}
                </p>

                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => window.location.href = '/affordable-housing'}
                >
                  {t('tools.findHousing')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Checklist */}
        {activeTab === 'movein' && <MoveInCostTool />}
        {activeTab === 'benefits' && <BenefitsScreener />}
        {activeTab === 'eviction' && <EvictionTimeline />}

        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('tools.docsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                {t('tools.docsIntro')}
              </p>
              
              <div className="space-y-6">
                {[
                  { category: 'tools.docsIdentity', items: ['tools.doc.id1', 'tools.doc.id2', 'tools.doc.id3'] },
                  {
                    category: 'tools.docsIncome',
                    items: ['tools.doc.inc1', 'tools.doc.inc0', 'tools.doc.inc2', 'tools.doc.inc3', 'tools.doc.inc4', 'tools.doc.inc5'],
                  },
                  { category: 'tools.docsHousehold', items: ['tools.doc.hh1', 'tools.doc.hh2', 'tools.doc.hh3'] },
                  { category: 'tools.docsAssets', items: ['tools.doc.as1', 'tools.doc.as2', 'tools.doc.as3'] },
                ].map((section) => (
                  <div key={section.category}>
                    <h3 className="font-heading font-semibold mb-3">{t(section.category as 'tools.docsIdentity')}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded border-[var(--color-border)]"
                          />
                          <span className="text-sm">{t(item as 'tools.doc.id1')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        <ProjectNote sources={['hud', 'massgov', 'census']}>
          {t('tools.footnote')}
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
