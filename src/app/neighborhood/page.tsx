'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Info, 
  MapPin, 
  Users, 
  Train, 
  Heart, 
  Scale, 
  Building2,
  Phone,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Image from 'next/image';
import Link from 'next/link';
import { PhotoCredit } from '@/components/sources/PhotoCredit';
import { ExpandableSection, ExpandableCard } from '@/components/ui/ExpandableSection';
import { useI18n } from '@/i18n/hook';
import { neighborhoodCopy } from './neighborhoodTranslations';
import { NEIGHBORHOOD_HEALTH_CENTERS } from './healthcareData';
import { TransitGuide } from './TransitGuide';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const neighborhoods = [
  {
    name: 'Fields Corner',
    photo: { src: '/img/hoods/fields-corner.jpg', caption: 'Inbound Red Line train arriving at Fields Corner station, July 2021', commonsFile: 'Inbound_train_arriving_at_Fields_Corner_station,_July_2021.jpg', author: 'Hutima', license: '4.0' as const },
    description: 'Major commercial hub with Red Line access. Strong Vietnamese community.',
  },
  {
    name: 'Savin Hill',
    photo: { src: '/img/hoods/savin-hill.jpg', caption: 'Dorchester Bay seen from Savin Hill', commonsFile: 'Dorchester_Bay_from_Savin_Hill.jpg', author: 'ButteBag', license: '4.0' as const },
    description: 'Residential area near the beach. Close to UMass Boston.',
  },
  {
    name: 'Uphams Corner',
    photo: { src: '/img/hoods/uphams-corner.jpg', caption: 'The S. B. Pierce Building at Uphams Corner', commonsFile: 'S_B_Pierce_Building,_Uphams_Corner,_Dorchester_MA.jpg', author: 'John Phelan', license: '3.0' as const },
    description: 'Historic village center. Growing arts and culture scene.',
  },
  {
    name: 'Codman Square',
    photo: { src: '/img/hoods/codman-square-church-2019.jpg', caption: 'Second Church in Dorchester at Codman Square, 2019', commonsFile: 'Second_Church_in_Dorchester.jpg', author: 'Staruski1', license: '4.0' as const },
    description: 'Community-focused area with health center and local businesses.',
  },
  {
    name: 'Grove Hall',
    photo: { src: '/img/hoods/intervale-blue-hill-2021.jpg', caption: 'Intervale Street–Blue Hill Avenue historic district, near Grove Hall, 2021', commonsFile: 'BostonMA_IntervaleRoadBlueHillAveHD_2.jpg', author: 'Magicpiano', license: '4.0' as const },
    description: 'Vibrant neighborhood with Caribbean and African influences.',
  },
  {
    name: 'Four Corners',
    photo: { src: '/img/hoods/four-corners.jpg', caption: 'Four Corners/Geneva Avenue station on the Fairmount Line, looking inbound', commonsFile: 'Four_Corners_Geneva_Ave_station,_looking_inbound,_July_2013.JPG', author: 'Pi.1415926535', license: '3.0' as const },
    description: 'Intersection of major streets. Mixed residential and commercial.',
  },
  {
    name: 'Lower Mills',
    photo: { src: '/img/hoods/lower-mills.jpg', caption: 'Ventura Street playground in the Neponset River Reservation, below Lower Mills', commonsFile: 'Ventura_Street_Playground_Neponset_River_Reservation_Dorchester_Massachusetts.jpg', author: 'Swampyank', license: '4.0' as const },
    description: 'Historic mill area on the Neponset River. Local shops and restaurants.',
  },
  {
    name: 'Ashmont',
    photo: { src: '/img/hoods/ashmont.jpg', caption: 'Ashmont station from Peabody Square', commonsFile: 'Ashmont_station_from_Peabody_Square.jpg', author: 'Matthew in Boston', license: '2.0' as const },
    description: 'Red Line terminus. Peabody Square commercial district.',
  },
  {
    name: 'Neponset',
    photo: { src: '/img/hoods/neponset.jpg', caption: 'Neponset River Reservation', commonsFile: 'Neponset_River_Reservation_1_Dorchester_Massachusetts.jpg', author: 'Swampyank', license: '4.0' as const },
    description: 'Waterfront area. Parks and marshlands.',
  },
];

export default function NeighborhoodPage() {
  const { lang: language, t, format } = useI18n();
  const [selectedHood, setSelectedHood] = useState<string | null>(null);

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
            <Info className="w-8 h-8 text-[var(--color-accent-primary)]" />
            {t('neighborhood.guide')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('neighborhood.guideIntro')}
          </p>
        </header>

        {/* Overview */}
        <ExpandableSection
          title={t('neighborhood.aboutTitle')}
          icon={<MapPin className="w-5 h-5" />}
          preview={t('neighborhood.aboutPreview', { population: format.number(122191) })}
          defaultExpanded={true}
          sourceUrl="https://www.bostonplans.org/getattachment/c55502f3-3a70-4772-a894-0c51c325b216"
          sourceName="Boston Planning Department · 2020 Census"
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t('neighborhood.overviewOne', { population: format.number(122191) })}
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              {t('neighborhood.overviewTwo')}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { icon: Users, label: t('neighborhood.populationLabel'), value: `${format.number(122191)} (${format.year(2020)})` },
                { icon: MapPin, label: t('neighborhood.areaLabel'), value: t('neighborhood.areaValue') },
                { icon: Train, label: t('neighborhood.redStops'), value: t('neighborhood.fiveStations') },
                { icon: Building2, label: t('neighborhood.zipLabel'), value: '02121, 02122, 02124, 02125' },
              ].map((stat) => (
                <div key={stat.label} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg text-center">
                  <stat.icon className="w-5 h-5 text-[var(--color-accent-primary)] mx-auto mb-1" />
                  <p className="font-mono font-bold">{stat.value}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ExpandableSection>

        {/* Sub-neighborhoods */}
        <section>
          <h2 className="font-heading font-semibold text-xl mb-4">{t('neighborhood.subTitle')}</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {t('neighborhood.subIntro')}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mb-4">{t('neighborhood.localFiguresNote')}</p>
          {language !== 'en' && <p role="note" className="text-xs text-[var(--color-text-muted)] mb-4">{t('neighborhood.translationDraft')}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {neighborhoods.map((hood) => {
              const copy = neighborhoodCopy(hood.name, language);
              return <ExpandableCard
                key={hood.name}
                expanded={selectedHood === hood.name}
                onToggle={(open) => setSelectedHood(open ? hood.name : null)}
                title={hood.name}
                subtitle={copy?.summary ?? hood.description}
                subtitleLanguage={copy ? language : 'en'}
                icon={<MapPin className="w-5 h-5" />}
              >
                <div className="space-y-4 text-sm">
                  <figure className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={hood.photo.src}
                        alt={copy?.caption ?? hood.photo.caption}
                        lang={copy ? language : 'en'}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="space-y-1 px-3 py-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
                      <p lang={copy ? language : 'en'} dir={copy && language === 'ar' ? 'rtl' : 'ltr'}>{copy?.caption ?? hood.photo.caption}</p>
                      <PhotoCredit {...hood.photo} />
                    </figcaption>
                  </figure>
                  <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--color-accent-primary)]">
                    <a href="#neighborhood-transit" className="hover:underline">{t('neighborhood.transportation')}</a>
                    <Link href="/projects" className="hover:underline">{t('nav.projects')}</Link>
                    <a href="https://www.boston.gov/neighborhood/dorchester" target="_blank" rel="noreferrer noopener" className="hover:underline">
                      {t('ui.sourceNamed', { name: 'City of Boston' })}
                    </a>
                  </div>
                </div>
              </ExpandableCard>;
            })}
          </div>
        </section>

        {/* Transportation */}
        <section id="neighborhood-transit">
          <h2 className="font-heading font-semibold text-xl mb-4">{t('neighborhood.transportation')}</h2>
          <TransitGuide />
        </section>

        {/* Healthcare */}
        <ExpandableSection
          title={t('neighborhood.healthcare')}
          icon={<Heart className="w-5 h-5" />}
          preview={t('neighborhood.healthcarePreview')}
        >
          <div className="space-y-4">
            <p role="note" className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
              {t('neighborhood.carneyClosed')}{' '}
              <a href="https://www.mass.gov/resources-for-patients-and-employees-of-carney-hospital-and-nashoba-valley-medical-center" target="_blank" rel="noreferrer noopener" className="underline">Mass.gov</a>
            </p>
            {language !== 'en' && <p className="text-xs text-[var(--color-text-muted)]" role="note">{t('neighborhood.healthDraft')}</p>}
            {NEIGHBORHOOD_HEALTH_CENTERS.map((facility) => (
              <div key={facility.name} className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg space-y-2">
                <h4 className="font-heading font-semibold">{facility.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <bdi>{facility.address}</bdi>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={`tel:${facility.phone.replace(/\D/g, '')}`} dir="ltr" className="text-[var(--color-accent-primary)] hover:underline">
                      {facility.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span>{t('neighborhood.healthHours')}</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--color-border)] text-sm">
                  <p><strong>{t('common.services')}:</strong> {t(facility.servicesKey)}</p>
                  <p><strong>{t('common.spokenLanguages')}:</strong> {t('neighborhood.healthLanguages')}</p>
                  <p><strong>{t('neighborhood.insurance')}:</strong> {t('neighborhood.healthInsurance')}</p>
                </div>
                <a href={facility.website} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-primary)] hover:underline">
                  {t('ui.sourceNamed', { name: facility.name })} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Legal Rights */}
        <ExpandableSection
          title={t('neighborhood.rightsTitle')}
          icon={<Scale className="w-5 h-5" />}
          preview={t('neighborhood.rightsPreview')}
          sourceUrl="https://www.masslegalhelp.org/housing"
          sourceName="Massachusetts Legal Help"
        >
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-accent-secondary)]/10 rounded-lg">
              <h4 className="font-heading font-semibold text-[var(--color-accent-secondary)] mb-2">{t('neighborhood.evictionHeading')}</h4>
              <p className="text-sm">{t('neighborhood.evictionBody')}</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-2">{t('neighborhood.protectionsHeading')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: t('neighborhood.depositTitle'), desc: t('neighborhood.depositBody') },
                  { title: t('neighborhood.heatTitle'), desc: t('neighborhood.heatBody') },
                  { title: t('neighborhood.noticeTitle'), desc: t('neighborhood.noticeBody') },
                  { title: t('neighborhood.retaliationTitle'), desc: t('neighborhood.retaliationBody') },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <p className="font-heading font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-2">{t('neighborhood.helpHeading')}</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div>
                    <p className="font-heading font-semibold text-sm">Greater Boston Legal Services</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('neighborhood.gblsBody')}</p>
                  </div>
                  <a href="tel:6176031807" dir="ltr" className="text-[var(--color-accent-primary)] font-mono text-sm">(617) 603-1807</a>
                </div>
                <div className="flex items-center justify-between gap-3 p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div>
                    <p className="font-heading font-semibold text-sm">City Life / Vida Urbana</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{t('neighborhood.cityLifeBody')}</p>
                  </div>
                  <a href="tel:6175243541" dir="ltr" className="text-[var(--color-accent-primary)] font-mono text-sm">(617) 524-3541</a>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>
        <ProjectNote sources={['census', 'mbta', 'bostongov', 'wikimedia']}>
          {t('neighborhood.sourceCaution')}
        </ProjectNote>
      </motion.div>
    </MainLayout>
  );
}
