'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Home, 
  Search, 
  Filter, 
  Calculator, 
  FileText, 
  HelpCircle,
  Phone,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge, AMIBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, calculateAMIPercentage, getAMIBand, BOSTON_AMI_2025 } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Sample listings data - in production this would come from the database
const sampleListings = [
  {
    id: 1,
    propertyName: 'Uphams Corner Residences',
    address: '555 Columbia Road, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    unitTypes: [
      { type: '1BR', count: 12, rent: 1450 },
      { type: '2BR', count: 20, rent: 1750 },
      { type: '3BR', count: 8, rent: 2100 },
    ],
    amiRequired: 60,
    waitlistStatus: 'waitlist_open' as const,
    applicationDeadline: null,
    propertyManagerPhone: '(617) 825-4200',
    amenities: 'Laundry, Parking, Playground, Community Room',
    transitAccess: '5 min walk to Uphams Corner (Fairmount Line)',
  },
  {
    id: 2,
    propertyName: 'Fields Corner Family Housing',
    address: '1400 Dorchester Ave, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    unitTypes: [
      { type: '2BR', count: 15, rent: 1600 },
      { type: '3BR', count: 10, rent: 1950 },
    ],
    amiRequired: 50,
    waitlistStatus: 'available' as const,
    applicationDeadline: new Date('2025-02-28'),
    propertyManagerPhone: '(617) 825-9797',
    amenities: 'On-site Laundry, Storage, Security',
    transitAccess: '2 min walk to Fields Corner (Red Line)',
  },
  {
    id: 3,
    propertyName: 'Codman Square Commons',
    address: '600 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    unitTypes: [
      { type: 'Studio', count: 8, rent: 1100 },
      { type: '1BR', count: 16, rent: 1350 },
    ],
    amiRequired: 30,
    waitlistStatus: 'waitlist_closed' as const,
    applicationDeadline: null,
    propertyManagerPhone: '(617) 825-4200',
    amenities: 'Elevator, Community Garden, Computer Lab',
    transitAccess: '10 min walk to Codman Yard (Fairmount Line)',
  },
];

export default function AffordableHousingPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'listings' | 'learn' | 'calculator'>('listings');
  const [householdSize, setHouseholdSize] = useState(2);
  const [annualIncome, setAnnualIncome] = useState(50000);
  const [filterAmi, setFilterAmi] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const amiPercentage = calculateAMIPercentage(householdSize, annualIncome);
  const amiBand = getAMIBand(amiPercentage);

  const filteredListings = sampleListings.filter(listing => {
    if (filterAmi && listing.amiRequired > filterAmi) return false;
    if (filterStatus && listing.waitlistStatus !== filterStatus) return false;
    return true;
  });

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
            {t('housing.title', 'Affordable Housing')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('housing.description', 'Find income-restricted housing in Dorchester. These units have lower rents for people who qualify based on their income.')}
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

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterAmi || ''}
                onChange={(e) => setFilterAmi(e.target.value ? Number(e.target.value) : null)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-heading',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                )}
              >
                <option value="">All Income Levels</option>
                <option value="30">30% AMI or below</option>
                <option value="50">50% AMI or below</option>
                <option value="60">60% AMI or below</option>
                <option value="80">80% AMI or below</option>
              </select>
              
              <select
                value={filterStatus || ''}
                onChange={(e) => setFilterStatus(e.target.value || null)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-heading',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
                )}
              >
                <option value="">All Statuses</option>
                <option value="available">Available Now</option>
                <option value="waitlist_open">Waitlist Open</option>
                <option value="waitlist_closed">Waitlist Closed</option>
              </select>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id} hoverable>
                  <CardHeader>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{listing.propertyName}</CardTitle>
                      <p className="text-sm text-[var(--color-text-muted)] mt-1">{listing.neighborhood}</p>
                    </div>
                    <StatusBadge status={listing.waitlistStatus} />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm">{listing.address}</p>
                    
                    <div className="flex items-center gap-2">
                      <AMIBadge percentage={listing.amiRequired} />
                      <span className="text-xs text-[var(--color-text-muted)]">
                        For households at or below {listing.amiRequired}% AMI
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-heading font-medium text-[var(--color-text-muted)]">AVAILABLE UNITS</p>
                      <div className="flex flex-wrap gap-2">
                        {listing.unitTypes.map((unit, i) => (
                          <div key={i} className="bg-[var(--color-bg-tertiary)] px-2 py-1 rounded text-sm">
                            <span className="font-medium">{unit.type}</span>
                            <span className="text-[var(--color-text-muted)]"> — {formatCurrency(unit.rent)}/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-[var(--color-text-muted)]">
                      <span className="font-medium">Transit:</span> {listing.transitAccess}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <a 
                      href={`tel:${listing.propertyManagerPhone.replace(/\D/g, '')}`}
                      className="text-sm text-[var(--color-accent-primary)] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-4 h-4" />
                      {listing.propertyManagerPhone}
                    </a>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <Card className="text-center py-12">
                <Info className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
                <p className="font-heading font-medium mb-2">No listings match your filters</p>
                <p className="text-sm text-[var(--color-text-muted)]">Try adjusting your search criteria</p>
              </Card>
            )}
          </div>
        )}

        {/* Learn Tab */}
        {activeTab === 'learn' && (
          <div className="space-y-6">
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
                        <th className="text-right py-2 font-heading font-medium">100% AMI (2025)</th>
                        <th className="text-right py-2 font-heading font-medium">80% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">60% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">50% AMI</th>
                        <th className="text-right py-2 font-heading font-medium">30% AMI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4].map((size) => {
                        const ami100 = BOSTON_AMI_2025[size as keyof typeof BOSTON_AMI_2025];
                        return (
                          <tr key={size} className="border-b border-[var(--color-border)]">
                            <td className="py-2">{size} person{size > 1 ? 's' : ''}</td>
                            <td className="text-right font-mono">{formatCurrency(ami100)}</td>
                            <td className="text-right font-mono">{formatCurrency(ami100 * 0.8)}</td>
                            <td className="text-right font-mono">{formatCurrency(ami100 * 0.6)}</td>
                            <td className="text-right font-mono">{formatCurrency(ami100 * 0.5)}</td>
                            <td className="text-right font-mono">{formatCurrency(ami100 * 0.3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <p className="text-xs text-[var(--color-text-muted)]">
                  Source: HUD FY2025 Income Limits for Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area
                </p>
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
                  { step: 3, title: 'Find Open Listings', desc: 'Search MassAccess.org or check our listings above.' },
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
      </motion.div>
    </MainLayout>
  );
}
