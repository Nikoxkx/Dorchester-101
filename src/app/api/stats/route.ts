export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DEVELOPMENT_PROJECTS } from '@/data/housing';
import { FOOD_SITES } from '@/data/food';
import { BHA_STATUS, DORCHESTER_RENT_ESTIMATES, DORCHESTER_SALE_ESTIMATES } from '@/data/programs';
import { isOpenNow } from '@/lib/hours';

export async function GET() {
  const now = new Date();
  const foodOpen = FOOD_SITES.filter((s) => isOpenNow(s.hours, now)).length;

  return NextResponse.json({
    stats: [
      {
        id: 'rent',
        label: 'Published 2BR rent',
        value: DORCHESTER_RENT_ESTIMATES.twoBed,
        format: 'currency',
        trend: DORCHESTER_RENT_ESTIMATES.yoyChangePercent,
        source: 'RentCafe / Redfin neighborhood reports',
        sourceDate: DORCHESTER_RENT_ESTIMATES.asOf,
      },
      {
        id: 'sale',
        label: 'Median sale (est.)',
        value: DORCHESTER_SALE_ESTIMATES.medianSale,
        format: 'currency',
        trend: DORCHESTER_SALE_ESTIMATES.yoyChangePercent,
        source: DORCHESTER_SALE_ESTIMATES.source,
        sourceDate: DORCHESTER_SALE_ESTIMATES.asOf,
      },
      {
        id: 'projects',
        label: 'BPDA projects tracked',
        value: DEVELOPMENT_PROJECTS.length,
        format: 'number',
        source: 'bostonplans.org filings in this directory',
        sourceDate: '2026-09-06',
      },
      {
        id: 'food',
        label: 'Pantries in directory',
        value: FOOD_SITES.length,
        format: 'number',
        note: `${foodOpen} showing open right now`,
        source: 'Project Bread / site pages',
        sourceDate: '2026-06-01',
      },
      {
        id: 'section8',
        label: 'BHA Section 8 (tenant-based)',
        value: BHA_STATUS.section8TenantBased === 'closed' ? 0 : 1,
        format: 'status',
        status: BHA_STATUS.section8TenantBased,
        source: BHA_STATUS.source,
        sourceDate: BHA_STATUS.asOf,
      },
      {
        id: 'public-housing',
        label: 'BHA public housing waitlist',
        value: BHA_STATUS.publicHousing === 'open' ? 1 : 0,
        format: 'status',
        status: BHA_STATUS.publicHousing,
        source: BHA_STATUS.source,
        sourceDate: BHA_STATUS.asOf,
      },
    ],
    lastUpdated: now.toISOString(),
  });
}
