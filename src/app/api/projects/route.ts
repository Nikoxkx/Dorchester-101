export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DEVELOPMENT_PROJECTS } from '@/data/housing';

export async function GET() {
  return NextResponse.json({
    projects: DEVELOPMENT_PROJECTS,
    totals: {
      count: DEVELOPMENT_PROJECTS.length,
      units: DEVELOPMENT_PROJECTS.reduce((sum, p) => sum + (p.totalUnits || 0), 0),
      affordable: DEVELOPMENT_PROJECTS.reduce((sum, p) => sum + (p.incomeRestrictedUnits || 0), 0),
      underConstruction: DEVELOPMENT_PROJECTS.filter((p) => p.status === 'under_construction').length,
    },
    lastUpdated: new Date().toISOString(),
    source: 'BPDA project pages — unit counts are from public filings and may lag construction.',
  });
}
