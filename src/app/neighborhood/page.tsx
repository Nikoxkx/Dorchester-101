'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Info, 
  MapPin, 
  Users, 
  Train, 
  GraduationCap, 
  Heart, 
  Scale, 
  Building2,
  Home,
  Phone,
  Clock,
  ExternalLink,
  Bus,
  Bike,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ExpandableSection, ExpandableCard } from '@/components/ui/ExpandableSection';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const neighborhoods = [
  {
    name: 'Fields Corner',
    description: 'Major commercial hub with Red Line access. Strong Vietnamese community.',
    population: '~18,000',
    medianRent: '$2,650/mo',
    transitAccess: 'Red Line (Fields Corner), Bus 17, 18, 210',
    landmarks: ['Fields Corner MBTA', 'Vietnamese restaurants on Dorchester Ave', 'Town Field'],
    demographics: 'Vietnamese (35%), Black (30%), Hispanic (20%), White (10%), Other (5%)',
    schools: ['Mildred Avenue K-8', 'Boston Latin Academy', 'Jeremiah E. Burke High'],
    history: 'Named for the Fields family who owned farmland here in the 1800s. Became a commercial center with the arrival of the elevated railway in 1927.',
    currentDevelopments: '2 affordable housing projects under construction (280 units total)',
  },
  {
    name: 'Savin Hill',
    description: 'Residential area near the beach. Close to UMass Boston.',
    population: '~8,500',
    medianRent: '$2,850/mo',
    transitAccess: 'Red Line (Savin Hill), Bus 17, 18',
    landmarks: ['Malibu Beach', 'Savin Hill Park', 'Boston Nature Center'],
    demographics: 'White (45%), Black (25%), Hispanic (15%), Asian (10%), Other (5%)',
    schools: ['Lee Academy Pilot School', 'Boston Collegiate Charter'],
    history: 'Originally called Old Hill, renamed for a local sea captain. Historic neighborhood with many Victorian homes.',
    currentDevelopments: 'Dot Block mixed-use (488 units, 79 affordable) under construction',
  },
  {
    name: 'Uphams Corner',
    description: 'Historic village center. Growing arts and culture scene.',
    population: '~12,000',
    medianRent: '$2,450/mo',
    transitAccess: 'Fairmount Line (Uphams Corner), Bus 15, 41',
    landmarks: ['Strand Theatre', 'Uphams Corner Library', 'The Fairmount Innovation Lab'],
    demographics: 'Black (50%), Hispanic (25%), Cape Verdean (15%), Other (10%)',
    schools: ['Orchard Gardens K-8', 'UP Academy Dorchester'],
    history: 'Village center since the 1700s, named after postmaster Amos Upham. Home to one of Boston\'s oldest theaters.',
    currentDevelopments: 'Uphams Corner Arts District redevelopment in planning',
  },
  {
    name: 'Codman Square',
    description: 'Community-focused area with health center and local businesses.',
    population: '~15,000',
    medianRent: '$2,400/mo',
    transitAccess: 'Fairmount Line (Codman Yard - coming), Bus 23, 26, 28',
    landmarks: ['Codman Square Health Center', 'Second Church in Dorchester', 'Codman Square Library'],
    demographics: 'Black (55%), Hispanic (25%), Cape Verdean (10%), Haitian (8%), Other (2%)',
    schools: ['Codman Academy', 'Young Achievers Science and Math Pilot'],
    history: 'Named for John Codman, a prominent 18th-century merchant. Center of community organizing and development.',
    currentDevelopments: 'CSNDC affordable housing expansion (75 units)',
  },
  {
    name: 'Grove Hall',
    description: 'Vibrant neighborhood with Caribbean and African influences.',
    population: '~14,000',
    medianRent: '$2,350/mo',
    transitAccess: 'Bus 23, 28, 45, 66',
    landmarks: ['Grove Hall Library', 'Franklin Park Zoo entrance', 'Lee School'],
    demographics: 'Black (65%), Hispanic (20%), Haitian (10%), Other (5%)',
    schools: ['Frederick Pilot Middle', 'Lee K-8'],
    history: 'Once an affluent Victorian suburb, now a diverse working-class neighborhood. Named for a local tavern.',
    currentDevelopments: 'Blue Hill Ave corridor improvements in progress',
  },
  {
    name: 'Four Corners',
    description: 'Intersection of major streets. Mixed residential and commercial.',
    population: '~10,000',
    medianRent: '$2,300/mo',
    transitAccess: 'Fairmount Line (Four Corners/Geneva), Bus 19, 23, 28',
    landmarks: ['Four Corners Main Streets', 'Geneva Cliffs Urban Wild'],
    demographics: 'Black (55%), Hispanic (30%), Cape Verdean (10%), Other (5%)',
    schools: ['Dever-McCormack K-8', 'Boston Day and Evening Academy'],
    history: 'Named for the intersection of Washington, Bowdoin, Harvard, and Geneva. Historic commercial node.',
    currentDevelopments: 'Transit-oriented development planned at Fairmount station',
  },
  {
    name: 'Lower Mills',
    description: 'Historic mill area on the Neponset River. Local shops and restaurants.',
    population: '~7,000',
    medianRent: '$2,700/mo',
    transitAccess: 'Mattapan Trolley (Milton), Bus 27, 240',
    landmarks: ['Walter Baker Chocolate Factory', 'Neponset River Trail', 'Lower Mills Library'],
    demographics: 'White (50%), Black (25%), Hispanic (15%), Asian (5%), Other (5%)',
    schools: ['Holmes Elementary', 'Lower Mills Early Education'],
    history: 'Site of the first chocolate factory in America (Walter Baker Company, 1780). The historic mill buildings are now condos.',
    currentDevelopments: 'Neponset riverfront trail extension',
  },
  {
    name: 'Ashmont',
    description: 'Red Line terminus. Peabody Square commercial district.',
    population: '~11,000',
    medianRent: '$2,600/mo',
    transitAccess: 'Red Line & Mattapan Trolley (Ashmont), Bus 22, 23, 26, 27, 215, 217, 240',
    landmarks: ['Ashmont Station', 'Peabody Square', 'All Saints Church', 'Ashmont Hill'],
    demographics: 'Black (40%), White (30%), Hispanic (15%), Haitian (10%), Other (5%)',
    schools: ['Mather Elementary', 'Henderson K-12 Inclusion School'],
    history: 'Named for Ashmont, a 19th-century estate. Ashmont Hill has some of Dorchester\'s finest Victorian architecture.',
    currentDevelopments: 'Peabody Square streetscape improvements',
  },
  {
    name: 'Neponset',
    description: 'Waterfront area. Parks and marshlands.',
    population: '~5,000',
    medianRent: '$2,800/mo',
    transitAccess: 'Bus 201, 202 to Ashmont',
    landmarks: ['Neponset River Reservation', 'Pope John Paul II Park', 'Tenean Beach'],
    demographics: 'White (60%), Black (20%), Hispanic (12%), Asian (5%), Other (3%)',
    schools: ['Neighborhood House Charter'],
    history: 'Neponset is named after the Neponset tribe who lived along the river. The area was industrialized in the 19th century.',
    currentDevelopments: 'Harbor Point redevelopment continuing',
  },
];

const transitInfo = {
  redLine: {
    stations: [
      { name: 'JFK/UMass', transfers: ['Commuter Rail', 'Bus 8, 16'] },
      { name: 'Savin Hill', transfers: ['Bus 17, 18'] },
      { name: 'Fields Corner', transfers: ['Bus 17, 18, 210'] },
      { name: 'Shawmut', transfers: ['Bus 22, 23'] },
      { name: 'Ashmont', transfers: ['Mattapan Trolley', 'Bus 22, 23, 26, 27, 215, 217, 240'] },
    ],
    frequency: 'Every 4-6 minutes (rush hour), 8-12 minutes (off-peak)',
    fare: '$2.40 (CharlieCard) / $2.90 (cash)',
    accessibleStations: 'All stations accessible',
  },
  fairmountLine: {
    stations: [
      { name: 'Uphams Corner', transfers: ['Bus 15, 41'] },
      { name: 'Four Corners/Geneva', transfers: ['Bus 19, 23, 28'] },
      { name: 'Talbot Avenue', transfers: ['Bus 23, 26, 28'] },
    ],
    frequency: 'Every 20-30 minutes',
    fare: 'Free Zone 1A ($2.40 w/ CharlieCard from South Station)',
    note: 'Commuter rail serving Dorchester with subway-like frequency',
  },
  mattapanTrolley: {
    stations: ['Ashmont', 'Cedar Grove', 'Butler', 'Milton', 'Central Avenue', 'Valley Road', 'Capen Street', 'Mattapan'],
    frequency: 'Every 5-8 minutes',
    fare: 'Same as subway ($2.40)',
    note: 'Historic PCC streetcars dating to 1946',
  },
  busRoutes: [
    { route: '16', destination: 'Andrew via Columbia Rd', frequency: '10-15 min' },
    { route: '17', destination: 'Andrew via Fields Corner', frequency: '15-20 min' },
    { route: '18', destination: 'Andrew via Savin Hill', frequency: '15-20 min' },
    { route: '23', destination: 'Ruggles via Blue Hill Ave', frequency: '6-10 min' },
    { route: '26', destination: 'Ashmont via Talbot Ave', frequency: '15-20 min' },
    { route: '28', destination: 'Ruggles via Blue Hill Ave', frequency: '6-10 min' },
  ],
  farePrograms: [
    { name: 'CharlieCard', description: 'Reloadable fare card with discounted fares' },
    { name: 'Youth Pass', description: 'Free for BPS students grades 7-12' },
    { name: 'Reduced Fare', description: '50% off for seniors 65+, people with disabilities' },
    { name: 'Low-Income Fare', description: '$10/month unlimited for income-eligible residents' },
  ],
};

export default function NeighborhoodPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
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
            Dorchester Guide
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            Everything you need to know about Boston&apos;s largest and most diverse neighborhood. Click any section to expand.
          </p>
        </header>

        {/* Overview */}
        <ExpandableSection
          title="About Dorchester"
          icon={<MapPin className="w-5 h-5" />}
          preview="Boston's largest neighborhood — 150,000+ residents, 6 square miles"
          defaultExpanded={true}
          sourceUrl="https://www.census.gov"
          sourceName="U.S. Census Bureau"
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              Dorchester is the largest neighborhood in Boston, with a rich history dating back to 1630—making it 
              older than Boston itself. Annexed to Boston in 1870, Dorchester spans approximately 6 square miles 
              and is home to over 150,000 residents representing dozens of cultures and languages.
            </p>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              The neighborhood is known for its iconic <strong>triple-decker homes</strong>, vibrant commercial districts, 
              excellent transit access (5 Red Line stations), and strong community organizations. Dorchester includes 
              diverse sub-neighborhoods, each with its own character and history.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { icon: Users, label: 'Population', value: '~150,000' },
                { icon: MapPin, label: 'Area', value: '6 sq miles' },
                { icon: Train, label: 'Red Line Stops', value: '5 stations' },
                { icon: Building2, label: 'ZIP Codes', value: '02121-02125' },
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
          <h2 className="font-heading font-semibold text-xl mb-4">Sub-Neighborhoods</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            Click any neighborhood to see detailed information about demographics, housing, transit, and current developments.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {neighborhoods.map((hood) => (
              <ExpandableCard
                key={hood.name}
                title={hood.name}
                subtitle={hood.description}
                icon={<MapPin className="w-5 h-5" />}
                stats={[
                  { label: 'Population', value: hood.population },
                  { label: 'Median Rent', value: hood.medianRent },
                ]}
              >
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Demographics</h4>
                    <p className="text-[var(--color-text-muted)]">{hood.demographics}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Transit Access</h4>
                    <p className="text-[var(--color-text-muted)]">{hood.transitAccess}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Landmarks</h4>
                    <ul className="text-[var(--color-text-muted)] list-disc list-inside">
                      {hood.landmarks.map((landmark) => (
                        <li key={landmark}>{landmark}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-heading font-semibold mb-1">Schools</h4>
                    <ul className="text-[var(--color-text-muted)] list-disc list-inside">
                      {hood.schools.map((school) => (
                        <li key={school}>{school}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-heading font-semibold mb-1">History</h4>
                    <p className="text-[var(--color-text-muted)]">{hood.history}</p>
                  </div>
                  
                  <div className="p-3 bg-[var(--color-accent-primary)]/10 rounded-lg">
                    <h4 className="font-heading font-semibold mb-1 text-[var(--color-accent-primary)]">Current Development</h4>
                    <p className="text-[var(--color-text-secondary)]">{hood.currentDevelopments}</p>
                  </div>
                </div>
              </ExpandableCard>
            ))}
          </div>
        </section>

        {/* Transportation */}
        <section>
          <h2 className="font-heading font-semibold text-xl mb-4">Transportation</h2>
          <div className="space-y-4">
            <ExpandableSection
              title="MBTA Red Line"
              icon={<Train className="w-5 h-5" />}
              preview="5 stations in Dorchester • Every 4-6 min rush hour"
              badge="Primary"
              sourceUrl="https://www.mbta.com"
              sourceName="MBTA"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {transitInfo.redLine.stations.map((station) => (
                    <div key={station.name} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="font-heading font-semibold">{station.name}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Transfers: {station.transfers.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--color-text-muted)]">Frequency</p>
                    <p className="font-medium">{transitInfo.redLine.frequency}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">Fare</p>
                    <p className="font-medium">{transitInfo.redLine.fare}</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-muted)]">Accessibility</p>
                    <p className="font-medium">{transitInfo.redLine.accessibleStations}</p>
                  </div>
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection
              title="Fairmount Line (Commuter Rail)"
              icon={<Train className="w-5 h-5" />}
              preview="3 stations in Dorchester • Free Zone 1A fare"
              badge="Growing"
              sourceUrl="https://www.mbta.com/schedules/CR-Fairmount"
              sourceName="MBTA"
            >
              <div className="space-y-4">
                <div className="p-3 bg-[var(--color-accent-green)]/10 rounded-lg">
                  <p className="text-sm text-[var(--color-accent-green)] font-medium">
                    {transitInfo.fairmountLine.note}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {transitInfo.fairmountLine.stations.map((station) => (
                    <div key={station.name} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-600" />
                        <span className="font-heading font-semibold">{station.name}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        Transfers: {station.transfers.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ExpandableSection>

            <ExpandableSection
              title="Bus Routes"
              icon={<Bus className="w-5 h-5" />}
              preview="12+ bus routes serving Dorchester"
              sourceUrl="https://www.mbta.com/schedules/bus"
              sourceName="MBTA"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {transitInfo.busRoutes.map((bus) => (
                  <div key={bus.route} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">
                        {bus.route}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{bus.frequency}</span>
                    </div>
                    <p className="text-xs mt-1">{bus.destination}</p>
                  </div>
                ))}
              </div>
            </ExpandableSection>

            <ExpandableSection
              title="Fare Programs & Discounts"
              icon={<DollarSign className="w-5 h-5" />}
              preview="Discounted and free fare options available"
              sourceUrl="https://www.mbta.com/fares"
              sourceName="MBTA"
            >
              <div className="space-y-3">
                {transitInfo.farePrograms.map((program) => (
                  <div key={program.name} className="flex items-start gap-3 p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] mt-1.5" />
                    <div>
                      <p className="font-heading font-semibold text-sm">{program.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{program.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ExpandableSection>
          </div>
        </section>

        {/* Healthcare */}
        <ExpandableSection
          title="Healthcare"
          icon={<Heart className="w-5 h-5" />}
          preview="Community health centers accepting MassHealth"
        >
          <div className="space-y-4">
            {[
              {
                name: 'Codman Square Health Center',
                address: '637 Washington St, Dorchester, MA 02124',
                phone: '(617) 825-9660',
                hours: 'Mon-Thu 8am-8pm, Fri 8am-5pm, Sat 9am-1pm',
                services: 'Primary care, dental, behavioral health, OB/GYN, pediatrics, pharmacy, WIC',
                languages: 'English, Spanish, Haitian Creole, Cape Verdean, Vietnamese',
                insurance: 'MassHealth, Medicare, most commercial, sliding scale',
              },
              {
                name: 'DotHouse Health',
                address: '1353 Dorchester Ave, Dorchester, MA 02122',
                phone: '(617) 288-3230',
                hours: 'Mon-Fri 8am-5pm',
                services: 'Primary care, pediatrics, dental, eye care, behavioral health',
                languages: 'English, Vietnamese, Spanish',
                insurance: 'MassHealth, Medicare, most commercial, sliding scale',
              },
              {
                name: 'Carney Hospital',
                address: '2100 Dorchester Ave, Dorchester, MA 02124',
                phone: '(617) 296-4000',
                hours: '24/7 Emergency Room',
                services: 'Emergency care, inpatient, surgery, cardiology, orthopedics',
                languages: 'All languages via interpreter',
                insurance: 'All major insurance accepted',
              },
            ].map((facility) => (
              <div key={facility.name} className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg space-y-2">
                <h4 className="font-heading font-semibold">{facility.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                    {facility.address}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <a href={`tel:${facility.phone.replace(/\D/g, '')}`} className="text-[var(--color-accent-primary)] hover:underline">
                      {facility.phone}
                    </a>
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                    {facility.hours}
                  </p>
                </div>
                <div className="pt-2 border-t border-[var(--color-border)] text-sm">
                  <p><strong>Services:</strong> {facility.services}</p>
                  <p><strong>Languages:</strong> {facility.languages}</p>
                  <p><strong>Insurance:</strong> {facility.insurance}</p>
                </div>
              </div>
            ))}
          </div>
        </ExpandableSection>

        {/* Legal Rights */}
        <ExpandableSection
          title="Know Your Rights"
          icon={<Scale className="w-5 h-5" />}
          preview="Tenant rights, eviction protections, and free legal help"
          sourceUrl="https://www.masslegalhelp.org/housing"
          sourceName="Massachusetts Legal Help"
        >
          <div className="space-y-4">
            <div className="p-4 bg-[var(--color-accent-secondary)]/10 rounded-lg">
              <h4 className="font-heading font-semibold text-[var(--color-accent-secondary)] mb-2">
                Facing Eviction? Know This:
              </h4>
              <ul className="text-sm space-y-2">
                <li>• You have the right to a court hearing before any eviction</li>
                <li>• You have the right to request a jury trial</li>
                <li>• Your landlord CANNOT lock you out or remove your belongings without a court order</li>
                <li>• Free legal help is available — call GBLS: (617) 603-1700</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold mb-2">Key Tenant Protections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: 'Security Deposit Limits', desc: 'Max: First month, last month, one month security, lock change fee' },
                  { title: 'Heat Requirements', desc: '68°F daytime, 64°F nighttime (Sept 15 - June 15)' },
                  { title: 'Eviction Notice', desc: '14 days for non-payment, 30 days for other reasons' },
                  { title: 'Retaliation Protection', desc: 'Landlord cannot evict for reporting violations or organizing' },
                ].map((item) => (
                  <div key={item.title} className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <p className="font-heading font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading font-semibold mb-2">Free Legal Resources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div>
                    <p className="font-heading font-semibold text-sm">Greater Boston Legal Services</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Free eviction defense for low-income residents</p>
                  </div>
                  <a href="tel:6176031700" className="text-[var(--color-accent-primary)] font-mono text-sm">
                    (617) 603-1700
                  </a>
                </div>
                <div className="flex items-center justify-between p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                  <div>
                    <p className="font-heading font-semibold text-sm">City Life / Vida Urbana</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Tenant organizing and eviction defense</p>
                  </div>
                  <a href="tel:6175243541" className="text-[var(--color-accent-primary)] font-mono text-sm">
                    (617) 524-3541
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </motion.div>
    </MainLayout>
  );
}
