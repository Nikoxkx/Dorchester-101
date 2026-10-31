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
import { STATION_PHOTOS } from '@/data/stationPhotos';
import { SourcePreview } from '@/components/sources/SourcePreview';
import { AddToCalendar } from '@/components/housing/AddToCalendar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge, AMIBadge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { PROJECT_TRANSLATIONS } from './projectTranslations';
import { PROJECTS as projects } from './projectsData';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ProjectsPage() {
  const { t, lang, meta, format } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const localizedProjects = projects.map((project) => {
    const translation = lang === 'en' ? undefined : PROJECT_TRANSLATIONS[lang]?.[project.id];
    return {
      ...project,
      ...translation,
      renderings: { ...project.renderings, note: translation?.renderingNote ?? project.renderings.note },
      textLanguage: translation ? lang : 'en',
      fellBack: lang !== 'en' && !translation,
    };
  });
  const normalize = (text: string) => text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
  const query = normalize(searchQuery.trim());
  const filteredProjects = localizedProjects.filter(project => {
    const original = projects.find((item) => item.id === project.id);
    // A translated search and an English search should find the same record.
    const searchable = [project.name, project.neighborhood, project.address, project.developer, project.description,
      project.parcelNote, project.unitMix, project.communityBenefits, project.howToApply, project.renderings.note, ...project.amenities,
      original?.description ?? '', original?.developer ?? '', original?.parcelNote ?? '', original?.unitMix ?? '',
      original?.communityBenefits ?? '', original?.howToApply ?? '', original?.renderings.note ?? '', ...(original?.amenities ?? [])].join(' ');
    const matchesSearch = normalize(searchable).includes(query);
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
            {t('projects.introDetail')}
          </p>
          {lang !== 'en' && (
            <p className="max-w-2xl text-sm text-[var(--color-text-secondary)]">{t('clothing.translationDraft')}</p>
          )}
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              aria-label={t('projects.search')}
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
            aria-label={t('projects.allStatuses')}
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
                {format.number(stat.value)}
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
                {project.fellBack && <p className="text-xs text-[var(--color-text-muted)]">{t('lang.untranslated', { language: meta.nativeName })}</p>}
                <p lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="text-[var(--color-text-secondary)]">{project.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.totalUnits')}</p>
                    <p className="font-mono font-semibold text-lg">{format.number(project.totalUnits)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">{t('projects.affordable')}</p>
                    <p className="font-mono font-semibold text-lg text-[var(--color-accent-green)]">
                      {format.number(project.incomeRestrictedUnits)}
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
                        ? format.monthYear(project.expectedCompletion)
                        : t('projects.tbd')
                      }
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SiteImagery
                    lat={project.lat}
                    lng={project.lng}
                    label={project.address.split(',')[0]}
                    sourceUrl={project.id === 3 ? project.articleUrl : project.applicationSourceUrl}
                    contextPhoto={project.id === 4 ? { ...STATION_PHOTOS['place-smmnl'], caption: t('map.photo.shawmutContext') } : undefined}
                  />
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">{t('projects.site')}</p>
                      <p lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="text-[var(--color-text-secondary)]">{project.parcelNote}</p>
                    </div>
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">{t('projects.unitMix')}</p>
                      <p lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="text-[var(--color-text-secondary)]">{project.unitMix}</p>
                    </div>
                    <div>
                      <p className="text-xs font-heading text-[var(--color-text-muted)]">{t('projects.amenities')}</p>
                      <ul lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="list-inside list-disc text-[var(--color-text-secondary)]">
                        {project.amenities.map((a) => <li key={a}>{a}</li>)}
                      </ul>
                    </div>
                    <div className={cn('rounded-lg border p-2.5 text-xs', project.renderings.available ? 'border-[var(--color-border)]' : 'border-dashed border-[var(--color-border-strong)]')}>
                      <p className="font-heading font-semibold">{project.renderings.available ? t('projects.renderings') : t('projects.noRenderings')}</p>
                      <p className="mt-0.5 text-[var(--color-text-secondary)]">
                        <span lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'}>{project.renderings.note}</span>{' '}
                        {project.renderings.available && (
                          <a href={project.bpdaLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">{t('projects.viewFiling')}</a>
                        )}
                        {' '}{t('projects.artwork')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-[var(--color-bg-tertiary)] p-3 text-sm">
                    <p className="font-heading font-semibold">{t('projects.benefits')}</p>
                    <p lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="mt-1 text-[var(--color-text-secondary)]">{project.communityBenefits}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--color-accent-green)]/40 bg-[var(--color-accent-green)]/8 p-3 text-sm">
                    <p className="font-heading font-semibold text-[var(--color-accent-green)]">{t('projects.applyUnits')}</p>
                    <p lang={project.textLanguage} dir={project.textLanguage === 'ar' ? 'rtl' : 'ltr'} className="mt-1 text-[var(--color-text-secondary)]">{project.howToApply}</p>
                    <a href={project.applicationSourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 font-semibold text-[var(--color-accent-primary)] underline underline-offset-2">
                      {t('ui.sourceNamed', { name: project.applicationSourceName })} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                <SourcePreview
                  title={t('projects.docketTitle', { project: project.name })}
                  url={project.bpdaLink}
                  sourceId="bpda"
                  description={t('projects.docketDescription')}
                  secondary={{ label: t(project.id === 1 || project.id === 4 ? 'projects.coverage' : 'projects.developerUpdate'), url: project.articleUrl, sourceId: project.id === 1 || project.id === 4 ? 'dotnews' : undefined }}
                  lastChecked={project.lastChecked}
                />

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-heading mb-2">{t('projects.amiBreakdown')}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.amiBreakdown).map(([ami, count]) => (
                      <div key={ami} className="flex items-center gap-2">
                        <AMIBadge percentage={Number(ami)} />
                        <span className="text-sm font-mono">{t('projects.units', { count })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                {project.approvalDate && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="w-4 h-4" />
                    {t('projects.approved')} {format.date(`${project.approvalDate}T12:00:00`, 'medium')}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <AddToCalendar
                    label={t('projects.calendarLabel')}
                    event={{
                      title: t('projects.calendarTitle', { project: project.name }),
                      description: `${project.howToApply}\n\n${t('projects.addressLabel')}: ${project.address}`,
                      location: project.address,
                      url: project.bpdaLink,
                    }}
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(project.bpdaLink, '_blank')}
                    rightIcon={<ExternalLink className="w-3 h-3" />}
                  >
                    {t('projects.bpdaDetails')}
                  </Button>
                </div>
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
          {t('note.projects')}
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
