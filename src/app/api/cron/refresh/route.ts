import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

/**
 * A best-effort daily request to live endpoints, NOT verification or an update
 * of the hand-maintained directory. Vercel supplies `Authorization: Bearer
 * <CRON_SECRET>` when the secret is configured on the deployment. A client can
 * forge arbitrary headers, so x-vercel-cron is never accepted as authentication.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ROUTES = [
  '/api/news?limit=10&sinceHours=168',
  '/api/market-data',
  '/api/resources?limit=5',
  '/api/notifications',
  '/api/weather',
  '/api/winter-clothing',
] as const;

interface RefreshResult {
  path: string;
  status: number | null;
  state: 'ok' | 'degraded' | 'failed';
  reason?: string;
}

function authorized(req: Request, secret: string): boolean {
  const actual = Buffer.from(req.headers.get('authorization') ?? '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** A successful HTTP response may still be an explicitly degraded fallback. */
function degradedReason(path: string, data: Record<string, unknown>): string | undefined {
  if (path.startsWith('/api/news')) {
    if (data.snapshot) return 'news snapshot, not a live feed';
    if (typeof data.okFeeds !== 'number' || typeof data.requestedFeeds !== 'number' || data.okFeeds < data.requestedFeeds) return 'one or more news feeds did not return live articles';
  }
  if (path === '/api/market-data') {
    const acs = data.acs as { status?: string } | undefined;
    const fmr = data.hudFmr as { status?: string; snapshot?: boolean } | undefined;
    const ami = data.ami as { snapshot?: boolean } | undefined;
    if (!acs || !fmr || !ami || ['unavailable', 'snapshot'].includes(acs.status ?? '') || fmr.status !== 'available' || fmr.snapshot || ami.snapshot) return 'one or more market sources are unavailable or using a snapshot';
  }
  if (path === '/api/notifications' && data.alertsSource !== 'mbta') return 'MBTA alerts are partial or unavailable';
  if (path === '/api/weather' && (data.status !== 'live' || data.alertsStatus !== 'live')) return 'weather or official alerts are using a fallback';
  if (path === '/api/winter-clothing') {
    const places = data.places as Array<{ sourceCheck?: { reachable?: boolean | string } }> | undefined;
    if (!Array.isArray(places) || places.some((place) => place.sourceCheck?.reachable !== true)) return 'one or more clothing source pages need a manual check';
  }
  return undefined;
}

async function refresh(origin: string, path: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${origin}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(25_000) });
    if (!res.ok) return { path, status: res.status, state: 'failed', reason: 'endpoint returned an error' };
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) return { path, status: res.status, state: 'failed', reason: 'endpoint returned invalid data' };
    const reason = degradedReason(path, data as Record<string, unknown>);
    return { path, status: res.status, state: reason ? 'degraded' : 'ok', ...(reason ? { reason } : {}) };
  } catch {
    return { path, status: null, state: 'failed', reason: 'request failed or timed out' };
  }
}

export async function GET(req: Request) {
  const headers = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: 'cron secret not configured' }, { status: 503, headers });
  if (!authorized(req, secret)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers });

  const origin = new URL(req.url).origin;
  const results = await Promise.all(ROUTES.map((path) => refresh(origin, path)));
  const ok = results.every((result) => result.state === 'ok');
  return NextResponse.json(
    { ok, checkedAt: new Date().toISOString(), note: 'Requests live endpoints; static records still require human review.', results },
    { status: ok ? 200 : 503, headers },
  );
}
