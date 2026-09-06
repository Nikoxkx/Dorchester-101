export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { DORCHESTER_OVERVIEW, NEIGHBORHOODS, TENANT_RIGHTS, TRANSIT_GUIDE } from '@/data/neighborhoods';
import { MBTA_FARES } from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    overview: DORCHESTER_OVERVIEW,
    neighborhoods: NEIGHBORHOODS,
    transit: TRANSIT_GUIDE,
    fares: MBTA_FARES,
    rights: TENANT_RIGHTS,
    lastUpdated: new Date().toISOString(),
  });
}
