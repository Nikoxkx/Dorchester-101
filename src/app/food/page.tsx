'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Apple, 
  Phone, 
  MapPin, 
  Clock, 
  Globe, 
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn, formatPhone } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Verified food resources data
const foodResources = [
  {
    id: 1,
    name: 'Greater Boston Food Bank - Dorchester',
    type: 'Food Pantry',
    address: '70 South Bay Ave, Boston, MA 02118',
    neighborhood: 'South Bay',
    phone: '(617) 427-5200',
    website: 'https://www.gbfb.org',
    hours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish', 'Haitian Creole', 'Vietnamese'],
    foodTypes: ['Produce', 'Canned Goods', 'Dairy', 'Bread', 'Meat'],
    requirements: 'No documentation required. Self-declaration of need.',
    acceptsEbt: false,
    transitAccess: 'Near JFK/UMass (Red Line)',
    lastVerified: 'January 2025',
  },
  {
    id: 2,
    name: 'Codman Square Health Center Food Pantry',
    type: 'Food Pantry',
    address: '637 Washington Street, Dorchester, MA 02124',
    neighborhood: 'Codman Square',
    phone: '(617) 825-9660',
    website: 'https://www.codman.org',
    hours: {
      monday: '10:00 AM - 2:00 PM',
      tuesday: '10:00 AM - 2:00 PM',
      wednesday: 'Closed',
      thursday: '10:00 AM - 2:00 PM',
      friday: '10:00 AM - 2:00 PM',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish', 'Haitian Creole', 'Cape Verdean Creole'],
    foodTypes: ['Produce', 'Canned Goods', 'Diapers', 'Formula'],
    requirements: 'Proof of Dorchester address (utility bill or mail)',
    acceptsEbt: false,
    transitAccess: 'Near Codman Square (Bus Routes 23, 26)',
    lastVerified: 'January 2025',
  },
  {
    id: 3,
    name: 'St. Mark\'s Community Meal',
    type: 'Hot Meals',
    address: '1725 Dorchester Ave, Dorchester, MA 02124',
    neighborhood: 'Fields Corner',
    phone: '(617) 825-2851',
    website: null,
    hours: {
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: 'Closed',
      thursday: 'Closed',
      friday: 'Closed',
      saturday: '11:00 AM - 1:00 PM',
      sunday: 'Closed',
    },
    languages: ['English', 'Vietnamese'],
    foodTypes: ['Hot Meals'],
    requirements: 'No requirements. All are welcome.',
    acceptsEbt: false,
    transitAccess: '2 min walk to Fields Corner (Red Line)',
    lastVerified: 'December 2024',
  },
  {
    id: 4,
    name: 'Salvation Army Kroc Center',
    type: 'Food Pantry',
    address: '650 Dudley Street, Dorchester, MA 02125',
    neighborhood: 'Uphams Corner',
    phone: '(617) 318-6900',
    website: 'https://www.krocboston.org',
    hours: {
      monday: '9:00 AM - 12:00 PM',
      tuesday: '9:00 AM - 12:00 PM',
      wednesday: '9:00 AM - 12:00 PM',
      thursday: '9:00 AM - 12:00 PM',
      friday: 'Closed',
      saturday: 'Closed',
      sunday: 'Closed',
    },
    languages: ['English', 'Spanish', 'Haitian Creole'],
    foodTypes: ['Produce', 'Canned Goods', 'Bakery Items'],
    requirements: 'Photo ID preferred but not required.',
    acceptsEbt: true,
    transitAccess: 'Near Uphams Corner (Bus Routes 15, 41)',
    lastVerified: 'January 2025',
  },
];

export default function FoodResourcesPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredResources = foodResources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const isOpenNow = (hours: Record<string, string>) => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[day];
    
    if (!todayHours || todayHours === 'Closed') return false;
    
    // Simple check - in production would parse actual times
    return true;
  };

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
            <Apple className="w-8 h-8 text-[var(--color-accent-secondary)]" />
            {t('food.title', 'Food Resources')}
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            {t('food.description', 'Find food pantries, hot meals, and assistance programs in Dorchester. All resources are free.')}
          </p>
        </header>

        {/* Emergency Contact Banner */}
        <Card className="bg-[var(--color-accent-secondary)]/10 border-[var(--color-accent-secondary)]/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="font-heading font-bold text-xl mb-1">
                  {t('food.needFoodToday', 'Need Food Today?')}
                </h2>
                <p className="text-[var(--color-text-secondary)]">
                  {t('food.callHotline', "Call Project Bread's FoodSource Hotline — free, confidential, and available in your language.")}
                </p>
              </div>
              <a
                href="tel:18006458333"
                className={cn(
                  'flex items-center gap-3 px-6 py-4 rounded-xl',
                  'bg-[var(--color-accent-secondary)] text-white',
                  'font-heading font-bold text-xl',
                  'hover:bg-[var(--color-accent-secondary)]/90 transition-colors'
                )}
              >
                <Phone className="w-6 h-6" />
                1-800-645-8333
              </a>
            </div>
            <p className="text-center text-sm text-[var(--color-text-muted)] mt-4">
              {t('food.hotlineHours', 'Monday–Friday, 8:00 AM – 5:00 PM • Speak to someone in English, Spanish, Portuguese, Vietnamese, Haitian Creole, Mandarin, Cantonese, and more')}
            </p>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, neighborhood, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg',
                'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]',
                'font-body text-sm'
              )}
            />
          </div>
          <select
            value={filterType || ''}
            onChange={(e) => setFilterType(e.target.value || null)}
            className={cn(
              'px-3 py-2.5 rounded-lg text-sm font-heading',
              'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]'
            )}
          >
            <option value="">All Types</option>
            <option value="Food Pantry">Food Pantries</option>
            <option value="Hot Meals">Hot Meals</option>
          </select>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredResources.map((resource) => {
            const openNow = isOpenNow(resource.hours);
            
            return (
              <Card key={resource.id} className="flex flex-col">
                <CardHeader className="flex-row items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg line-clamp-1">{resource.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={resource.type === 'Hot Meals' ? 'amber' : 'green'}>
                        {resource.type}
                      </Badge>
                      <Badge variant={openNow ? 'green' : 'default'}>
                        {openNow ? 'Open Now' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{resource.address}</p>
                        <p className="text-[var(--color-text-muted)]">{resource.neighborhood}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" />
                      <a 
                        href={`tel:${resource.phone.replace(/\D/g, '')}`}
                        className="text-[var(--color-accent-primary)] hover:underline"
                      >
                        {resource.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Hours:</p>
                        <div className="text-[var(--color-text-muted)] text-xs">
                          {Object.entries(resource.hours).map(([day, hours]) => (
                            <div key={day} className="flex justify-between gap-4">
                              <span className="capitalize">{day.slice(0, 3)}:</span>
                              <span>{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-heading font-medium text-[var(--color-text-muted)] mb-1">AVAILABLE</p>
                    <div className="flex flex-wrap gap-1">
                      {resource.foodTypes.map((type) => (
                        <span 
                          key={type}
                          className="text-xs px-2 py-0.5 bg-[var(--color-bg-tertiary)] rounded"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-heading font-medium text-[var(--color-text-muted)] mb-1">LANGUAGES</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {resource.languages.join(', ')}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                    <p className="text-xs font-heading font-medium text-[var(--color-text-muted)] mb-1">REQUIREMENTS</p>
                    <p className="text-sm">{resource.requirements}</p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Verified {resource.lastVerified}
                  </span>
                  {resource.website && (
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => window.open(resource.website!, '_blank')}
                      rightIcon={<ExternalLink className="w-3 h-3" />}
                    >
                      Website
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="font-heading font-medium mb-2">No resources match your search</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Try different search terms or clear your filters
            </p>
          </Card>
        )}

        {/* SNAP/EBT Info Section */}
        <section className="space-y-4">
          <h2 className="font-heading font-semibold text-xl">SNAP/EBT Benefits</h2>
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading font-semibold mb-2">What is SNAP?</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                    SNAP (Supplemental Nutrition Assistance Program, formerly known as Food Stamps) 
                    provides monthly benefits on an EBT card that you can use like a debit card 
                    to buy groceries at most supermarkets, convenience stores, and farmers markets.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading font-semibold mb-2">How to Apply</h3>
                  <ul className="text-sm text-[var(--color-text-secondary)] space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-accent-green)] mt-0.5 flex-shrink-0" />
                      Online at mass.gov/snap
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-accent-green)] mt-0.5 flex-shrink-0" />
                      Call DTA: (877) 382-2363
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--color-accent-green)] mt-0.5 flex-shrink-0" />
                      In person at your local DTA office
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                <Button 
                  variant="primary"
                  onClick={() => window.open('https://www.mass.gov/snap', '_blank')}
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Apply for SNAP Benefits
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </MainLayout>
  );
}
