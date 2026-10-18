import { NextResponse } from 'next/server';
import { WINTER_CLOTHING, clothingCheckedAge, clothingCheckLevel, inSeason } from '@/data/winterClothing';
import { BOSTON_TZ, statusFor } from '@/lib/hours';
import { globalCache, CACHE_TTL } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * Free winter-clothing listings with everything time-dependent computed at
 * request time: open now (from each record's own hours, in Boston time),
 * in season (from each program's published dates), the age of the last hand
 * check — and a live reachability test of every record's official page.
 *
 * The reachability result is a signal, never a verdict: an organisation
 * whose site is having a bad afternoon still has coats. An HTTP answer is
 * reported as true/false with its status code; a network failure is
 * reported as `unchecked`, because this server failing to reach a page is
 * not evidence about the page. Checks are cached for six hours so a busy
 * page does not become an accidental load test on a church website.
 */

interface SourceCheck {
  reachable: boolean | 'unchecked';
  status: number | null;
  checkedAt: string;
}

const CHECK_CACHE_KEY = 'clothing:source-checks';
const UA = 'DOR101/4.0 (https://github.com/Nikoxkx/Dorchester-101)';

async function checkOne(url: string): Promise<SourceCheck> {
  const checkedAt = new Date().toISOString();
  const attempt = async (method: 'HEAD' | 'GET'): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6_000);
    try {
      return await fetch(url, { method, redirect: 'follow', signal: controller.signal, headers: { 'user-agent': UA } });
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let res = await attempt('HEAD');
    if (res.status === 405 || res.status === 501) res = await attempt('GET');
    // 401/403 mean the page exists behind a bot wall; that is not a dead link.
    const reachable = res.status < 400 || res.status === 401 || res.status === 403;
    return { reachable, status: res.status, checkedAt };
  } catch {
    return { reachable: 'unchecked', status: null, checkedAt };
  }
}

async function sourceChecks(): Promise<Record<string, SourceCheck>> {
  const cached = globalCache.get<Record<string, SourceCheck>>(CHECK_CACHE_KEY);
  if (cached) return cached;
  const entries = await Promise.all(
    WINTER_CLOTHING.map(async (place) => [place.id, await checkOne(place.website)] as const)
  );
  const checks = Object.fromEntries(entries);
  globalCache.set(CHECK_CACHE_KEY, checks, CACHE_TTL.SOURCE_CHECKS);
  return checks;
}

export async function GET() {
  const now = new Date();
  const checks = await sourceChecks();
  const places = WINTER_CLOTHING.map((place) => ({
    ...place,
    computed: {
      openNow: place.hours ? statusFor(place.hours, now, BOSTON_TZ).state !== 'closed' : null,
      inSeason: inSeason(place, now),
      checkedAgeDays: clothingCheckedAge(place, now),
      checkLevel: clothingCheckLevel(place, now),
    },
    sourceCheck: checks[place.id] ?? { reachable: 'unchecked', status: null, checkedAt: now.toISOString() },
  }));
  return NextResponse.json(
    { fetchedAt: now.toISOString(), places },
    { headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=3600' } }
  );
}
