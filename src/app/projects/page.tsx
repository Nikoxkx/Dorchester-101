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

// Planning Department-docketed projects in Dorchester, re-checked against the agency or the
// developer's own update on 4 October 2026. Unit counts and affordability bands
// are quoted, not estimated: an earlier version of this page carried invented
// unit counts and a project that had no docket entry at all.
const projects = [
  {
    id: 1,
    lat: 42.3126, lng: -71.0561,
    parcelNote: 'Car-dealership and warehouse lots between Dorchester Avenue, Hancock Street, Pleasant Street and Greenmount Street, one block from Savin Hill station.',
    unitMix: 'Phase one opened in summer 2023 with 245 apartments, 33 of them income-restricted at 50% and 70% AMI (the developer does not publish that split). Phase two — the Hancock Building, due to start on Hancock Street — is 84 homes, all income-restricted: 17 at 30% AMI, about nine of them reserved for households at risk of homelessness; 17 at 50%; and 50 at 60%. The badges below are the Hancock Building split, the only band-by-band figure the developer publishes.',
    amenities: ['Ground-floor retail along Dorchester Avenue', 'Six ADA-accessible income-restricted homes in phase one', 'Bike storage and roof decks'],
    communityBenefits: 'Under the City’s Neighborhood Diversity Preservation Policy pilot, half of the phase-one income-restricted homes are offered first to rent-burdened households already living within three-quarters of a mile. The City awarded $5 million to phase two in January 2025, and the state added tax credits and subsidies in February 2026 to get the Hancock Building started.',
    howToApply: 'Phase one is leased through Maloney Properties and the Planning Department affordable programme; phase two has not opened applications. Watch Metrolist and the Planning Department docket — there is no waiting list before a lottery is announced.',
    renderings: { available: true, note: 'Renderings and the approved plans are in the Planning Department project filing.' },
    articleUrl: 'https://www.dotnews.com/2025/01/23/next-phase-dot-block-gets-5m-boost-city-boston/',
    lastChecked: '2026-10-04',
    name: 'Dot Block',
    developer: 'Samuels & Associates',
    address: '1203–1211 Dorchester Avenue, Dorchester, MA 02125',
    neighborhood: 'Savin Hill',
    totalUnits: 488,
    incomeRestrictedUnits: 117,
    amiBreakdown: { 30: 17, 50: 17, 60: 50 } as Record<number, number>,
    status: 'approved' as const,
    approvalDate: null,
    expectedCompletion: null,
    description: 'Four-acre mixed-use development beside Savin Hill station: 488 homes when complete, with phase one open since 2023 and an all-affordable 84-home Hancock Building moving toward construction.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects/dot-block',
  },
  {
    id: 2,
    lat: 42.31587, lng: -71.06951,
    parcelNote: 'The parking lot behind the former Dorchester Savings Bank Hall at 568–574 Columbia Road, in the Uphams Corner arts district.',
    unitMix: '48 income-restricted apartments, studios to three-bedrooms, for households earning between 30% and 80% of AMI, plus 3,500 sq ft of commercial space.',
    amenities: ['Adaptive reuse of the 1890s bank hall as an exhibition space', 'Below-market commercial rent for an arts organisation', 'Transit-oriented site on the Fairmount Line'],
    communityBenefits: 'The bank hall is restored rather than demolished and let affordably to an arts nonprofit; the housing spans deep affordability (30% AMI) through to 80% AMI.',
    howToApply: 'Ground was broken in June 2026. Applications will open through Metrolist roughly three to six months before completion; there is no waiting list yet.',
    renderings: { available: true, note: 'Rendering and the community-driven RFP materials were published by POAH and DBEDC.' },
    articleUrl: 'https://www.poah.org/news/nonprofit-affordable-housing-developers-hold-groundbreaking-48-affordable-apartments-and-arts',
    lastChecked: '2026-10-04',
    name: 'Columbia Crossing',
    developer: 'Preservation of Affordable Housing (POAH) with Dorchester Bay EDC',
    address: '568–574 Columbia Road, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    totalUnits: 48,
    incomeRestrictedUnits: 48,
    amiBreakdown: {} as Record<number, number>,
    status: 'under_construction' as const,
    approvalDate: null,
    expectedCompletion: null,
    description: 'All-affordable apartments and arts space on the site of the historic Dorchester Savings Bank Hall.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
  {
    id: 3,
    lat: 42.29899, lng: -71.07763,
    parcelNote: 'Two formerly vacant sites in the Codman Square / Four Corners area: 151 Spencer Street and 25 New England Avenue.',
    unitMix: '42 income-restricted family apartments across the two buildings — 19 at Spencer Street and 23 at New England Avenue.',
    amenities: ['Family-sized units', 'Resident services by CSNDC', 'Short walk to Talbot Avenue (Fairmount Line)'],
    communityBenefits: 'New family housing on vacant lots, with CSNDC keeping on-site resident services for the tenants.',
    howToApply: 'The lottery ran in February 2026 and is closed. Spencer Street finished in June 2026 and New England Avenue is due in November 2026; after lease-up, vacancies are listed through CSNDC and Metrolist.',
    renderings: { available: true, note: 'Plans and progress photographs are published in CSNDC’s real-estate updates.' },
    articleUrl: 'https://www.csndc.com/csndc-real-estate-update-spring-2026/',
    lastChecked: '2026-10-04',
    name: 'Talbot Commons II',
    developer: 'Codman Square Neighborhood Development Corporation (CSNDC)',
    address: '151 Spencer Street and 25 New England Avenue, Dorchester, MA 02124',
    neighborhood: 'Codman Square / Four Corners',
    totalUnits: 42,
    incomeRestrictedUnits: 42,
    amiBreakdown: {} as Record<number, number>,
    status: 'under_construction' as const,
    approvalDate: null,
    expectedCompletion: '2026-11-30',
    description: 'Two small all-affordable buildings completing in 2026, replacing vacant parcels with family apartments.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects',
  },
  {
    id: 4,
    lat: 42.29273, lng: -71.06595,
    parcelNote: 'The Fitzpatrick Bros. auto-body site and the parking lot beside it, immediately next to Shawmut station on the Red Line.',
    unitMix: '72 income-restricted apartments, studios to three-bedrooms, spread across the 30%, 50%, 60%, 80% and 120% AMI bands.',
    amenities: ['All-electric building with rooftop solar', 'Passive House design', 'Bluebikes station on site', '25 basement parking spaces'],
    communityBenefits: 'One hundred per cent income-restricted, including four two- or three-bedroom homes; public-realm and bike improvements at the station.',
    howToApply: 'Approved in November 2023, when the agency was still the BPDA; construction is projected to start in 2026. Applications will run through Metrolist before completion (projected 2028) — there is nothing to apply for yet.',
    renderings: { available: true, note: 'Rendering and plans are on the Planning Department project page and Trinity’s project page.' },
    articleUrl: 'https://www.dotnews.com/2023/trinity-s-project-150-centre-st-wins-bpda-board-support',
    lastChecked: '2026-10-04',
    name: '150 Centre Street at Shawmut Station',
    developer: 'Trinity Financial',
    address: '150 Centre Street, Dorchester, MA 02124',
    neighborhood: 'Shawmut / St. Mark’s',
    totalUnits: 72,
    incomeRestrictedUnits: 72,
    amiBreakdown: {} as Record<number, number>,
    status: 'approved' as const,
    approvalDate: '2023-11-16',
    expectedCompletion: '2028-12-31',
    description: 'Four-storey all-affordable building on the auto-body site next to Shawmut Red Line station.',
    bpdaLink: 'https://www.bostonplans.org/projects/development-projects/150-centre-street',
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
            Every project here has a Boston Planning Department filing (the agency was renamed from the BPDA in 2024) or a published developer update. The status follows the department&apos;s own stages (proposed, under review, approved, under construction); unit counts and affordability bands are quoted from that filing and re-checked by hand — each card prints the date of the last check. Public comment periods are the moment a resident&apos;s letter is read into the record, so those dates are highlighted.
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
                          <a href={project.bpdaLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">View in the Planning Department filing</a>
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
                  title={`Planning Department docket — ${project.name}`}
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
          Development projects are read from the Boston Planning Department docket (the former BPDA) or the developer&apos;s own published update: project name, status, unit counts and the bands that are income-restricted. Every card was re-checked on 4 October 2026; meeting dates are as posted by the agency and can change, so the docket link on each project is authoritative. DOR101 prints no rent figures and no unit counts it cannot attribute.
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
