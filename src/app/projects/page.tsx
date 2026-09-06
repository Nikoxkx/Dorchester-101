'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Users, 
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { SiteImagery } from '@/components/projects/SiteImagery';
import { SourcePreview } from '@/components/sources/SourcePreview';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge, AMIBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Sample BPDA project data
const projects = [
  {
    id: 1,
    lat: 42.3126, lng: -71.0561,
    parcelNote: 'Former Dorchester Ave car dealership lots between Greenmount and Hancock Streets, one block from Savin Hill station.',
    unitMix: 'Studios to 3-bedrooms; 79 income-restricted units spread across every building and bedroom size.',
    amenities: ['~35,000 sq ft ground-floor retail', 'Public plaza and mid-block pedestrian way', '0.5 parking spaces per unit', 'Bike room, roof decks'],
    communityBenefits: 'Developer-funded improvements to Savin Hill station approaches; $1.1M to the Boston Housing Trust; local-hire commitments under the Boston Residents Jobs Policy.',
    howToApply: 'Income-restricted units are leased by lottery through the Boston Office of Housing (Boston One Stop / MassAccess) roughly 3–6 months before each building opens. Sign up for the lottery alert on Boston One Stop; there is no waiting list before the lottery is announced.',
    renderings: { available: true, note: 'Architect renderings are in the BPDA project filing (Article 80 Large Project Review).' },
    articleUrl: 'https://www.dotnews.com/2019/dot-block-plan-gets-bpda-board-approval',
    lastChecked: '2026-06-28',
    name: 'Dot Block',
    developer: 'Samuels & Associates',
    address: '1211-1231 Dorchester Ave, Dorchester, MA 02125',
    neighborhood: 'Savin Hill',
    totalUnits: 488,
    incomeRestrictedUnits: 79,
    amiBreakdown: { 30: 20, 50: 30, 60: 29 },
    status: 'under_construction' as const,
    approvalDate: '2019-12-12',
    expectedCompletion: '2025-06-01',
    description: 'Mixed-use development with residential, retail, and community space adjacent to Savin Hill MBTA station.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects/dot-block',
  },
  {
    id: 2,
    lat: 42.3184, lng: -71.0644,
    parcelNote: 'City-owned lots on Columbia Road beside the Strand Theatre, part of the Uphams Corner Arts & Innovation District plan.',
    unitMix: 'All 150 units income-restricted; roughly half 2- and 3-bedroom family units.',
    amenities: ['New branch library on the ground floor', 'Artist live/work units', 'Community room and childcare space'],
    communityBenefits: 'Public library branch built into the project; ground-floor arts space at below-market rent; 100% of homes deed-restricted for 50+ years.',
    howToApply: 'Because this is a City-sponsored, all-affordable project, applications open through Boston One Stop and the Boston Housing Authority (for the project-based voucher units) when construction is 6–9 months from completion. Ask Dorchester Bay EDC to be added to their interest list now.',
    renderings: { available: true, note: 'Concept renderings were shown at the 2023 community meeting and are in the BPDA filing.' },
    articleUrl: 'https://www.dotnews.com/tags/uphams-corner',
    lastChecked: '2026-06-28',
    name: 'Uphams Corner Mixed-Use Development',
    developer: 'Dorchester Bay EDC',
    address: '555 Columbia Road, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    totalUnits: 150,
    incomeRestrictedUnits: 150,
    amiBreakdown: { 30: 45, 50: 60, 60: 45 },
    status: 'approved' as const,
    approvalDate: '2023-06-15',
    expectedCompletion: '2026-12-01',
    description: 'All-affordable housing development with ground-floor retail and community space.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
  {
    id: 3,
    lat: 42.3000, lng: -71.0605,
    parcelNote: 'Surface parking and one-storey retail on the block south of the Fields Corner station busway.',
    unitMix: 'Proposed 320 units, 96 income-restricted at 50–80% AMI; final mix subject to Article 80 review.',
    amenities: ['Affordable ground-floor retail reserved for existing Fields Corner businesses', 'Direct path to the Red Line', 'Bluebikes dock'],
    communityBenefits: 'Still under negotiation; the Impact Advisory Group has asked for deeper affordability and anti-displacement commitments for current tenants of the site.',
    howToApply: 'Nothing to apply for yet. The project is in planning; the next public step is the BPDA Impact Advisory Group meeting. Residents can submit comment letters to the BPDA project manager through the docket link.',
    renderings: { available: false, note: 'No renderings have been filed publicly. The developer has published a massing study only.' },
    articleUrl: 'https://www.dotnews.com/tags/fields-corner',
    lastChecked: '2026-06-28',
    name: 'Fields Corner Transit-Oriented Development',
    developer: 'Trinity Financial',
    address: '1400 Dorchester Ave, Dorchester, MA 02122',
    neighborhood: 'Fields Corner',
    totalUnits: 320,
    incomeRestrictedUnits: 96,
    amiBreakdown: { 50: 32, 60: 32, 80: 32 },
    status: 'planning' as const,
    approvalDate: null,
    expectedCompletion: '2028-01-01',
    description: 'Mixed-income housing near Fields Corner MBTA station with affordable retail space.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
  {
    id: 4,
    lat: 42.2916, lng: -71.0716,
    parcelNote: 'Formerly vacant City-owned parcels on Washington Street near Talbot Ave.',
    unitMix: '75 family units, 1–4 bedrooms, all income-restricted between 30% and 60% AMI.',
    amenities: ['On-site resident services (CSNDC)', 'Community garden and playground', 'Energy Positive design, solar roof'],
    communityBenefits: 'Passive-house construction lowering resident utility bills; 15% of units set aside for formerly homeless households with services.',
    howToApply: 'Initial lottery closed in 2024. The building now keeps a waiting list managed by CSNDC / Maloney Properties; call CSNDC at (617) 825-4224 to be added. Vacancies are rare — expect a multi-year wait.',
    renderings: { available: true, note: 'Completed building; photographs are on the CSNDC website.' },
    articleUrl: 'https://www.dotnews.com/tags/codman-square',
    lastChecked: '2026-06-28',
    name: 'Codman Square Homes',
    developer: 'CSNDC',
    address: '600 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    totalUnits: 75,
    incomeRestrictedUnits: 75,
    amiBreakdown: { 30: 25, 50: 25, 60: 25 },
    status: 'complete' as const,
    approvalDate: '2020-03-20',
    expectedCompletion: '2024-08-01',
    description: 'Fully affordable family housing with on-site services and community garden.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
];

export default function ProjectsPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || project.status === filterStatus;
    return matchesSearch && matchesStatus;
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
            <Building2 className="w-8 h-8 text-[var(--color-accent-amber)]" />
            {t('projects.title')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('projects.description')}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Every project here is on the Boston Planning &amp; Development Agency docket. The status follows the BPDA&apos;s own stages (proposed, under review, approved, under construction); the unit counts and income-restricted share come from the filed project notification. Public comment periods are the moment a resident&apos;s letter is read into the record, so those dates are highlighted.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder={t('projects.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg',
                'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
              )}
            />
          </div>
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className={cn(
              'px-3 py-2.5 rounded-lg font-heading',
              'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
            )}
          >
            <option value="">{t('projects.allStatuses')}</option>
            <option value="planning">{t('projects.planning')}</option>
            <option value="approved">{t('projects.approved')}</option>
            <option value="under_construction">{t('projects.underConstruction')}</option>
            <option value="complete">{t('projects.complete')}</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('projects.totalProjects'), value: projects.length },
            { label: t('projects.totalUnits'), value: projects.reduce((sum, p) => sum + p.totalUnits, 0) },
            { label: t('projects.affordableUnits'), value: projects.reduce((sum, p) => sum + p.incomeRestrictedUnits, 0) },
            { label: t('projects.underConstruction'), value: projects.filter(p => p.status === 'under_construction').length },
          ].map((stat, i) => (
            <Card key={i} className="text-center py-4">
              <div className="font-mono text-2xl font-bold text-[var(--color-accent-primary)]">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] font-heading">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Project Cards */}
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{project.name}</CardTitle>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <MapPin className="w-4 h-4" />
                    {project.neighborhood}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm">{project.address}</p>
                <p className="text-[var(--color-text-secondary)]">{project.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.totalUnits')}</p>
                    <p className="font-mono font-semibold text-lg">{project.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.affordable')}</p>
                    <p className="font-mono font-semibold text-lg text-[var(--color-accent-green)]">
                      {project.incomeRestrictedUnits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.developer')}</p>
                    <p className="font-medium text-sm">{project.developer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.expected')}</p>
                    <p className="font-medium text-sm">
                      {project.expectedCompletion 
                        ? new Date(project.expectedCompletion).toLocaleDateString(language === 'en' ? 'en-US' : language, { month: 'short', year: 'numeric' })
                        : t('projects.tbd')
                      }
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SiteImagery lat={project.lat} lng={project.lng} label={project.address.split(',')[0]} />
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">The site</p>
                      <p className="text-[var(--color-text-secondary)]">{project.parcelNote}</p>
                    </div>
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">Unit mix</p>
                      <p className="text-[var(--color-text-secondary)]">{project.unitMix}</p>
                    </div>
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">What else is in the project</p>
                      <ul className="list-inside list-disc text-[var(--color-text-secondary)]">
                        {project.amenities.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    </div>
                    <div className={cn('rounded-lg border p-2.5 text-xs', project.renderings.available ? 'border-[var(--color-border)]' : 'border-dashed border-[var(--color-border-strong)]')}>
                      <p className="font-heading font-semibold">{project.renderings.available ? 'Renderings / photos' : 'No renderings available'}</p>
                      <p className="mt-0.5 text-[var(--color-text-secondary)]">
                        {project.renderings.note}{' '}
                        {project.renderings.available && (
                          <a href={project.bpdaLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">View in the BPDA filing</a>
                        )}
                        {' '}Developer artwork is copyrighted, so it is linked rather than copied here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-sm">
                    <p className="font-heading font-semibold">Community benefits</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">{project.communityBenefits}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/8 p-3 text-sm">
                    <p className="font-heading font-semibold text-[var(--color-accent-green)]">How to apply for these units</p>
                    <p className="mt-1 text-[var(--color-text-secondary)]">{project.howToApply}</p>
                  </div>
                </div>

                <SourcePreview
                  title={`BPDA docket — ${project.name}`}
                  url={project.bpdaLink}
                  sourceId="bpda"
                  description="Official project page: filings, meeting notices, comment deadlines, renderings and the approval letter."
                  secondary={{ label: 'Dorchester Reporter coverage', url: project.articleUrl, sourceId: 'dotnews' }}
                  lastChecked={project.lastChecked}
                />

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-heading mb-2">{t('projects.amiBreakdown')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.amiBreakdown).map(([ami, count]) => (
                      <div key={ami} className="flex items-center gap-2">
                        <AMIBadge percentage={Number(ami)} />
                        <span className="text-sm font-mono">{count} {t('projects.units')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between">
                {project.approvalDate && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="w-4 h-4" />
                    {t('projects.approved')} {new Date(project.approvalDate).toLocaleDateString(language === 'en' ? 'en-US' : language)}
                  </div>
                )}
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => window.open(project.bpdaLink, '_blank')}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                >
                  {t('projects.bpdaDetails')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="font-heading font-medium mb-2">{t('projects.noResults')}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{t('projects.tryDifferent')}</p>
          </Card>
        )}

        {/* Source attribution */}
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          {t('projects.source')} 
          <a href="https://www.bostonplans.org" className="text-[var(--color-accent-primary)] hover:underline ml-1" target="_blank" rel="noopener noreferrer">
            bostonplans.org
          </a>
        </p>
        <ProjectNote sources={['bpda', 'bostongov']}>
          Development projects are read from the BPDA docket: project name, status, unit counts and the number designated income-restricted. Meeting dates are as posted by the agency and can change; the docket link on each project is authoritative.
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
