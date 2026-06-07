'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Calculator, DollarSign, Home, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, calculateRentBurden, calculateAMIPercentage, getAMIBand, BOSTON_AMI_2025 } from '@/lib/utils';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<'rent' | 'ami' | 'documents'>('rent');
  
  // Rent burden calculator state
  const [monthlyIncome, setMonthlyIncome] = useState(4500);
  const [monthlyRent, setMonthlyRent] = useState(2000);
  
  // AMI calculator state
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);

  const rentBurden = calculateRentBurden(monthlyIncome, monthlyRent);
  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome);
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
            Financial Tools
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            Free calculators to help you understand your housing options and eligibility.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[var(--color-border)]">
          {[
            { id: 'rent', label: 'Rent Burden', icon: DollarSign },
            { id: 'ami', label: 'AMI Calculator', icon: Home },
            { id: 'documents', label: 'Document Checklist', icon: FileText },
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

        {/* Rent Burden Calculator */}
        {activeTab === 'rent' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rent Burden Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-heading font-medium mb-2">
                    Monthly Gross Income (before taxes)
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
                    Monthly Rent
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
                <CardTitle>Your Results</CardTitle>
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
                    of income goes to rent
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
                        ? 'Your rent is at or below 30% of income—HUD\'s affordability standard.'
                        : rentBurden.status === 'cost-burdened'
                        ? 'You pay 30-50% of income on rent. Consider exploring assistance programs.'
                        : 'You pay over 50% of income on rent. You may qualify for emergency assistance.'
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
                    Explore Affordable Housing Options
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
                <CardTitle>AMI Income Calculator</CardTitle>
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
                    Annual Household Income
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
                  <p>2025 Boston AMI for {householdSize} person{householdSize > 1 ? 's' : ''}:</p>
                  <p className="font-mono font-medium text-[var(--color-text-primary)]">
                    {formatCurrency(BOSTON_AMI_2025[householdSize as keyof typeof BOSTON_AMI_2025])}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[var(--color-accent-primary)]/5">
              <CardHeader>
                <CardTitle>Your AMI Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <div className="text-5xl font-mono font-bold text-[var(--color-accent-primary)]">
                    {amiPercentage}%
                  </div>
                  <div className="text-lg font-heading font-medium mt-2">
                    of Area Median Income
                  </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg text-center">
                  <p className="text-sm text-[var(--color-text-muted)] mb-2">You qualify for:</p>
                  <p className="font-heading font-bold text-lg text-[var(--color-accent-primary)]">
                    {amiBand}
                  </p>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)]">
                  You can apply for housing listed at {amiBand} or higher. The lower your AMI percentage, 
                  the more housing options you may qualify for.
                </p>

                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => window.location.href = '/affordable-housing'}
                >
                  Find Housing I Qualify For
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Document Checklist */}
        {activeTab === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Common Documents for Housing Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">
                Most affordable housing applications require these documents. Gather them before applying.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    category: 'Identity',
                    items: [
                      'Government-issued photo ID (driver\'s license, state ID, passport)',
                      'Social Security cards for all household members',
                      'Birth certificates for all household members',
                    ],
                  },
                  {
                    category: 'Income',
                    items: [
                      'Pay stubs from last 4-8 weeks for all working adults',
                      'Most recent federal tax return (1040)',
                      'W-2 forms from past year',
                      'Social Security/SSI award letters',
                      'Unemployment benefit statements',
                      'Child support documentation',
                    ],
                  },
                  {
                    category: 'Household',
                    items: [
                      'Current lease or proof of address (utility bill, bank statement)',
                      'Landlord reference letter',
                      'Custody documents (if applicable)',
                    ],
                  },
                  {
                    category: 'Assets',
                    items: [
                      'Bank statements (last 3 months)',
                      'Retirement account statements',
                      'Vehicle registration',
                    ],
                  },
                ].map((section) => (
                  <div key={section.category}>
                    <h3 className="font-heading font-semibold mb-3">{section.category}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded border-[var(--color-border)]"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </MainLayout>
  );
}
