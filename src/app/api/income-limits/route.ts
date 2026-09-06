import { NextResponse } from 'next/server';
import { fetchHudIncomeLimits } from '@/lib/hud';

export const dynamic = 'force-dynamic';

/**
 * The current HUD income-limit ladder, live from huduser.gov.
 *
 * The tools and housing pages used to read a baked-in ladder; this endpoint is
 * the same workbook the app's market page reads, exposed so the calculators can
 * use the published figures without shipping a copy of them.
 */
export async function GET() {
  try {
    const limits = await fetchHudIncomeLimits();
    const min = (key: string) => limits.limits50[key];
    return NextResponse.json(
      {
        status: 'available' as const,
        fiscalYear: limits.fiscalYear,
        effectiveDate: limits.effectiveDate,
        area: limits.area,
        sourceUrl: limits.sourceUrl,
        retrievedAt: limits.retrievedAt,
        // 100% of the size-adjusted median family income = 2 × the 50% limit.
        table: Object.fromEntries(
          ['1', '2', '3', '4', '5', '6', '7', '8']
            .filter((size) => min(size) != null)
            .map((size) => [size, Math.round((min(size) as number) * 2)])
        ),
        bands: {
          '30': limits.limits30,
          '50': limits.limits50,
          '80': limits.limits80,
        },
        median: limits.median,
      },
      { headers: { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unavailable' as const,
        error: 'HUD income limits could not be read right now.',
        sourceUrl: 'https://www.huduser.gov/portal/datasets/il.html',
        table: {},
        bands: {},
      },
      { status: 502, headers: { 'cache-control': 'no-store' } }
    );
  }
}
