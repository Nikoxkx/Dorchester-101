'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  BookOpen, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  ExternalLink,
  Search,
  Home,
  Scale,
  Heart,
  Briefcase,
  GraduationCap,
  Users,
  Baby,
  Accessibility,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const categories = [
  { id: 'all', label: 'All', icon: BookOpen },
  { id: 'housing', label: 'Housing', icon: Home },
  { id: 'legal', label: 'Legal Aid', icon: Scale },
  { id: 'healthcare', label: 'Healthcare', icon: Heart },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'family', label: 'Family Services', icon: Users },
  { id: 'childcare', label: 'Childcare', icon: Baby },
  { id: 'disability', label: 'Disability', icon: Accessibility },
];

// Verified community organizations data from the specification
const organizations = [
  {
    id: 1,
    name: 'Boston Housing Authority (BHA)',
    category: 'housing',
    address: '52 Chauncy Street, Boston, MA 02111',
    phone: '(617) 988-4000',
    tty: '(617) 988-4000',
    website: 'https://www.bostonhousing.org',
    hours: 'Monday–Friday: 8:30 AM – 5:00 PM',
    languages: ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Haitian Creole'],
    services: 'Public housing, Section 8 vouchers, housing waitlists, tenant services',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 2,
    name: "Mayor's Office of Housing (MOH)",
    category: 'housing',
    address: '43 Hawkins St, Boston, MA 02114',
    phone: '(617) 635-3880',
    website: 'https://www.boston.gov/departments/neighborhood-development',
    hours: 'Monday–Friday: 9:00 AM – 5:00 PM',
    languages: ['English', 'Spanish'],
    services: 'Affordable housing programs, homebuyer assistance, rental assistance referrals',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 3,
    name: 'Dorchester Bay Economic Development Corporation (DBEDC)',
    category: 'housing',
    address: '594 Columbia Road, Dorchester, MA 02125',
    phone: '(617) 825-4200',
    website: 'https://www.dbedc.org',
    hours: 'Monday–Friday: 9:00 AM – 5:00 PM',
    languages: ['English', 'Spanish', 'Cape Verdean Creole'],
    services: 'Affordable housing development, homebuyer education, financial coaching, small business support',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 4,
    name: 'Codman Square Neighborhood Development Corporation (CSNDC)',
    category: 'housing',
    address: '587 Washington Street, Dorchester, MA 02124',
    phone: '(617) 825-9797',
    website: 'https://www.csndc.com',
    hours: 'Monday–Friday: 9:00 AM – 5:00 PM',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole'],
    services: 'Affordable housing, homebuyer assistance, foreclosure prevention, financial education',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 5,
    name: 'Greater Boston Legal Services (GBLS)',
    category: 'legal',
    address: '197 Friend Street, Boston, MA 02114',
    phone: '(617) 603-1700',
    website: 'https://www.gbls.org',
    hours: 'Intake: Monday–Friday: 9:00 AM – 12:30 PM',
    languages: ['English', 'Spanish', 'Chinese', 'Vietnamese', 'Haitian Creole', 'Portuguese'],
    services: 'Free legal help for low-income residents: housing, eviction defense, benefits, family law, immigration',
    eligibility: 'Income must be at or below 125% of federal poverty guidelines',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 6,
    name: 'City Life / Vida Urbana',
    category: 'legal',
    address: '284 Amory Street, Jamaica Plain, MA 02130',
    phone: '(617) 524-3541',
    website: 'https://www.clvu.org',
    hours: 'Monday–Friday: 9:00 AM – 5:00 PM',
    languages: ['English', 'Spanish'],
    services: 'Anti-eviction organizing, tenant rights, housing justice advocacy, legal support',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 7,
    name: 'Action for Boston Community Development (ABCD)',
    category: 'family',
    address: '178 Tremont Street, Boston, MA 02111',
    phone: '(617) 357-6000',
    website: 'https://www.bostonabcd.org',
    hours: 'Monday–Friday: 8:30 AM – 5:00 PM',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese', 'Chinese'],
    services: 'Head Start, fuel assistance, housing counseling, job training, senior services, food programs',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 8,
    name: 'VietAID (Vietnamese American Initiative for Development)',
    category: 'family',
    address: '42 Charles Street, Dorchester, MA 02122',
    phone: '(617) 822-3717',
    website: 'https://www.vietaid.org',
    hours: 'Monday–Friday: 9:00 AM – 5:00 PM',
    languages: ['English', 'Vietnamese'],
    services: 'Housing, economic development, community organizing, citizenship assistance, youth programs',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 9,
    name: 'Codman Square Health Center',
    category: 'healthcare',
    address: '637 Washington Street, Dorchester, MA 02124',
    phone: '(617) 825-9660',
    website: 'https://www.codman.org',
    hours: 'Monday–Friday: 8:00 AM – 8:00 PM, Saturday: 9:00 AM – 1:00 PM',
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole', 'Vietnamese'],
    services: 'Primary care, dental, behavioral health, pediatrics, women\'s health, pharmacy',
    isFree: false,
    notes: 'Accepts MassHealth, Medicare, most insurance. Sliding scale available for uninsured.',
    lastVerified: 'January 2025',
  },
  {
    id: 10,
    name: 'DotHouse Health',
    category: 'healthcare',
    address: '1353 Dorchester Avenue, Dorchester, MA 02122',
    phone: '(617) 288-3230',
    website: 'https://www.dthhealth.org',
    hours: 'Monday–Friday: 8:00 AM – 5:00 PM',
    languages: ['English', 'Vietnamese', 'Spanish'],
    services: 'Primary care, pediatrics, dental, OB/GYN, behavioral health, eye care',
    isFree: false,
    notes: 'Accepts MassHealth, Medicare, most insurance. Sliding scale for uninsured.',
    lastVerified: 'January 2025',
  },
  {
    id: 11,
    name: 'Project Bread',
    category: 'family',
    address: '145 Border Street, East Boston, MA 02128',
    phone: '1-800-645-8333',
    website: 'https://www.projectbread.org',
    hours: 'Hotline: Monday–Friday: 8:00 AM – 5:00 PM',
    languages: ['English', 'Spanish', 'Portuguese', 'Vietnamese', 'Haitian Creole', 'Mandarin', 'Cantonese'],
    services: 'Food hotline, SNAP application assistance, food resource referrals',
    isFree: true,
    lastVerified: 'January 2025',
  },
  {
    id: 12,
    name: '211 Massachusetts',
    category: 'family',
    phone: '2-1-1',
    website: 'https://www.mass211.org',
    hours: '24/7',
    languages: ['English', 'Spanish', '170+ languages via interpreter'],
    services: 'Free, confidential referrals to social services: housing, food, healthcare, utilities, childcare',
    isFree: true,
    lastVerified: 'January 2025',
  },
];

export default function ResourcesPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = 
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.services.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || org.category === selectedCategory;
    return matchesSearch && matchesCategory;
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
            <BookOpen className="w-8 h-8 text-[var(--color-accent-primary)]" />
            {t('resources.title', 'Resource Directory')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('resources.description', 'Verified organizations and services for Dorchester residents. All contact information has been verified.')}
          </p>
        </header>

        {/* Quick Help */}
        <Card className="bg-gradient-to-r from-[var(--color-accent-primary)]/10 to-[var(--color-accent-green)]/10">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-semibold text-lg mb-1">
                  {t('resources.notSure', 'Not sure where to start?')}
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {t('resources.call211', 'Call 2-1-1 anytime (24/7) for free, confidential help finding services.')}
                </p>
              </div>
              <a
                href="tel:211"
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-lg',
                  'bg-[var(--color-accent-primary)] text-white',
                  'font-heading font-semibold',
                  'hover:bg-[var(--color-accent-primary)]/90 transition-colors'
                )}
              >
                <Phone className="w-5 h-5" />
                {t('resources.call211', 'Call 2-1-1')}
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t('resources.search', 'Search organizations or services...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg',
                'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]',
                'font-body'
              )}
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg',
                    'font-heading font-medium text-sm transition-colors',
                    selectedCategory === category.id
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--color-text-muted)]">
          Showing {filteredOrganizations.length} organization{filteredOrganizations.length !== 1 ? 's' : ''}
        </p>

        {/* Organization Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrganizations.map((org) => (
            <Card key={org.id} className="flex flex-col">
              <CardHeader>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="blue">
                      {categories.find(c => c.id === org.category)?.label}
                    </Badge>
                    {org.isFree && (
                      <Badge variant="green">FREE</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {org.services}
                </p>

                <div className="space-y-2 text-sm">
                  {org.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                      <span>{org.address}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                    <a 
                      href={`tel:${org.phone.replace(/\D/g, '')}`}
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      {org.phone}
                    </a>
                    {org.tty && (
                      <span className="text-[var(--color-text-muted)]">| TTY: {org.tty}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                    <span>{org.hours}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                    <span className="text-[var(--color-text-muted)]">
                      {org.languages.join(', ')}
                    </span>
                  </div>
                </div>

                {org.eligibility && (
                  <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-sm">
                    <p className="font-medium mb-1">Eligibility:</p>
                    <p className="text-[var(--color-text-muted)]">{org.eligibility}</p>
                  </div>
                )}

                {org.notes && (
                  <p className="text-xs text-[var(--color-text-muted)] italic">
                    {org.notes}
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-text-muted)]">
                  Verified {org.lastVerified}
                </span>
                {org.website && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(org.website, '_blank')}
                    rightIcon={<ExternalLink className="w-3 h-3" />}
                  >
                    Website
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredOrganizations.length === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="font-heading font-medium mb-2">No organizations match your search</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Try different search terms or select a different category
            </p>
          </Card>
        )}
      </motion.div>
    </MainLayout>
  );
}
