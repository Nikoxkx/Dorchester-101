export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { FOOD_SITES } from '@/data/food';
import { isOpenNow } from '@/lib/hours';
import { SNAP_FY2026 } from '@/data/programs';

export async function GET() {
  const now = new Date();
  const sites = FOOD_SITES.map((site) => ({
    ...site,
    openNow: isOpenNow(site.hours, now),
  }));

  return NextResponse.json({
    sites,
    snap: SNAP_FY2026,
    lastUpdated: now.toISOString(),
  });
}
