import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { NEWS_FEEDS } from '@/data/feeds';
import { TRANSIT_DATA_AS_OF } from '@/data/transit';
import { reviewBacklog, lastReviewedOn, RESOURCES } from '@/data/resources';
import { mbtaKeyStatus } from '@/lib/mbta';
import { APP_VERSION, SITE_NAME } from '@/lib/site';

/**
 * Deployment health, not a marketing endpoint.
 *
 * Each subsystem reports what can actually be observed from the process:
 * whether a database is configured and answering, how many feeds and listings
 * are wired up, how old the hand-checked transit table is, and how much of the
 * directory has gone past its review window. A deploy that is up but stale is
 * the failure mode this site can actually have, so it is the one worth surfacing.
 */

export const dynamic = 'force-dynamic';

interface Check {
  name: string;
  status: 'ok' | 'degraded' | 'error';
  detail: string;
}

const startedAt = Date.now();

function daysSince(iso: string, now: number): number {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return -1;
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

export async function GET() {
  const now = Date.now();
  const checks: Check[] = [];

  if (!db) {
    checks.push({
      name: 'database',
      status: 'degraded',
      detail: 'No DATABASE_URL configured. Postgres-backed features are off; everything this build serves is file-backed data.',
    });
  } else {
    try {
      await db.execute(sql`select 1`);
      checks.push({ name: 'database', status: 'ok', detail: 'Connected, SELECT 1 returned.' });
    } catch {
      checks.push({ name: 'database', status: 'error', detail: 'DATABASE_URL is set but the query failed.' });
    }
  }

  const review = reviewBacklog(new Date(now));
  const backlogShare = review.total ? review.needsReview / review.total : 1;
  checks.push({
    name: 'data-quality',
    status: backlogShare > 0.5 ? 'degraded' : 'ok',
    detail: `${review.total - review.needsReview} of ${review.total} listings re-checked inside the window; last review ${lastReviewedOn()}.`,
  });

  const transitAge = daysSince(TRANSIT_DATA_AS_OF, now);
  checks.push({
    name: 'transit-reference',
    status: transitAge > 120 ? 'degraded' : 'ok',
    detail: `Timetables and colours checked ${TRANSIT_DATA_AS_OF} (${transitAge} days ago). Live arrivals come from api-v3.mbta.com.`,
  });

  checks.push({
    name: 'transit-feed',
    status: mbtaKeyStatus() === 'configured' ? 'ok' : 'degraded',
    detail:
      mbtaKeyStatus() === 'configured'
        ? 'MBTA_API_KEY is set; requests are made with a key.'
        : 'No MBTA_API_KEY, so arrivals run on the shared anonymous pool and fall back to the published timetable when it throttles.',
  });

  checks.push({
    name: 'news',
    status: NEWS_FEEDS.length >= 3 ? 'ok' : 'degraded',
    detail: `${NEWS_FEEDS.length} publishers configured. Fetch failures are reported per feed by /api/news, not hidden.`,
  });

  checks.push({
    name: 'directory',
    status: RESOURCES.length >= 20 ? 'ok' : 'degraded',
    detail: `${RESOURCES.length} organisations across ${new Set(RESOURCES.map((r) => r.category)).size} categories.`,
  });

  const status: Check['status'] = checks.some((c) => c.status === 'error')
    ? 'error'
    : checks.some((c) => c.status === 'degraded')
      ? 'degraded'
      : 'ok';

  return Response.json(
    {
      status,
      checkedAt: new Date(now).toISOString(),
      uptimeSeconds: Math.round((now - startedAt) / 1000),
      service: SITE_NAME,
      version: APP_VERSION,
      checks,
    },
    {
      headers: {
        'cache-control': 'no-store',
        'x-robots-tag': 'noindex',
      },
    },
  );
}
