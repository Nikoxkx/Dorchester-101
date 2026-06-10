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
            Housing Projects
          </h1>
          <p className="text-[var(--color-text-muted)] font-body max-w-2xl">
            BPDA-approved development projects in Dorchester. Track new housing from planning through completion.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search projects, neighborhoods, or addresses..."
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
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="approved">Approved</option>
            <option value="under_construction">Under Construction</option>
            <option value="complete">Complete</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'Total Units', value: projects.reduce((sum, p) => sum + p.totalUnits, 0) },
            { label: 'Affordable Units', value: projects.reduce((sum, p) => sum + p.incomeRestrictedUnits, 0) },
            { label: 'Under Construction', value: projects.filter(p => p.status === 'under_construction').length },
          ].map((stat) => (
            <Card key={stat.label} className="text-center py-4">
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
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">TOTAL UNITS</p>
                    <p className="font-mono font-semibold text-lg">{project.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">AFFORDABLE</p>
                    <p className="font-mono font-semibold text-lg text-[var(--color-accent-green)]">
                      {project.incomeRestrictedUnits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">DEVELOPER</p>
                    <p className="font-medium text-sm">{project.developer}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] font-heading">EXPECTED</p>
                    <p className="font-medium text-sm">
                      {project.expectedCompletion 
                        ? new Date(project.expectedCompletion).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                        : 'TBD'
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] font-heading mb-2">AMI BREAKDOWN</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(project.amiBreakdown).map(([ami, count]) => (
                      <div key={ami} className="flex items-center gap-2">
                        <AMIBadge percentage={Number(ami)} />
                        <span className="text-sm font-mono">{count} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between">
                {project.approvalDate && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Calendar className="w-4 h-4" />
                    Approved {new Date(project.approvalDate).toLocaleDateString()}
                  </div>
                )}
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => window.open(project.bpdaLink, '_blank')}
                  rightIcon={<ExternalLink className="w-3 h-3" />}
                >
                  BPDA Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="text-center py-12">
            <Building2 className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
            <p className="font-heading font-medium mb-2">No projects match your search</p>
            <p className="text-sm text-[var(--color-text-muted)]">Try different search terms or filters</p>
          </Card>
        )}

        {/* Source attribution */}
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          Data sourced from Boston Planning & Development Agency (BPDA). 
          <a href="https://www.bostonplans.org" className="text-[var(--color-accent-primary)] hover:underline ml-1" target="_blank" rel="noopener noreferrer">
            bostonplans.org
          </a>
        </p>
      </motion.div>
    </MainLayout>
  );
}
