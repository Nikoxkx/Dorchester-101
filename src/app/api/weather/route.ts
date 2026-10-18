import { NextResponse } from 'next/server';
import { fetchBostonWeather } from '@/lib/weather';
import { cacheHelpers } from '@/lib/cache';
import { formatErrorResponse } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * Live Dorchester weather as JSON.
 *
 * The payload is assembled by `src/lib/weather.ts` from the National Weather
 * Service (points → forecast/hourly/alerts/station observation) with a
 * labelled Open-Meteo backup. This route adds the shared server cache: five
 * minutes in memory plus CDN s-maxage, which is far fresher than the forecast
 * itself changes and keeps a page full of browsers down to a handful of NWS
 * requests. When both publishers are unreachable the route answers 502 and
 * the client shows its last good load with its age — it never invents a
 * temperature to fill the hole.
 */
export async function GET() {
  const hit = cacheHelpers.getWeather();
  if (hit) {
    return NextResponse.json(hit, {
      headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  }
  try {
    const payload = await fetchBostonWeather();
    cacheHelpers.setWeather(payload);
    return NextResponse.json(payload, {
      headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=900' },
    });
  } catch (error) {
    return NextResponse.json(
      { ...formatErrorResponse(error), status: 'unavailable', fetchedAt: new Date().toISOString() },
      { status: 502, headers: { 'cache-control': 'no-store' } }
    );
  }
}
