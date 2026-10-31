import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/cron/refresh/route';

const request = (headers: Record<string, string> = {}) => new Request('https://example.org/api/cron/refresh', { headers });
const success = (url: string) => {
  const path = new URL(url).pathname;
  const data = path === '/api/news' ? { okFeeds: 2, requestedFeeds: 2, snapshot: null }
    : path === '/api/market-data' ? { acs: { status: 'live' }, hudFmr: { status: 'available' }, ami: { snapshot: false } }
    : path === '/api/notifications' ? { alertsSource: 'mbta' }
    : path === '/api/weather' ? { status: 'live', alertsStatus: 'live' }
    : path === '/api/winter-clothing' ? { places: [{ sourceCheck: { reachable: true } }] }
    : { records: [] };
  return Response.json(data);
};

describe('scheduled refresh', () => {
  beforeEach(() => vi.stubEnv('CRON_SECRET', 'secret-for-test'));
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('fails closed without a configured secret', async () => {
    vi.stubEnv('CRON_SECRET', '');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    const response = await GET(request({ 'x-vercel-cron': '1' }));
    expect(response.status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('does not accept a forgeable cron header or an incorrect bearer token', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect((await GET(request({ 'x-vercel-cron': '1' }))).status).toBe(401);
    expect((await GET(request({ authorization: 'Bearer wrong', 'x-vercel-cron': '1' }))).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('reports live endpoints and says static records still require review', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => success(url)));
    const response = await GET(request({ authorization: 'Bearer secret-for-test' }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.results).toHaveLength(6);
    expect(body.note).toContain('static records still require human review');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('returns a failure status for errors and partial/fallback responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      if (path === '/api/weather') return Response.json({ status: 'fallback', alertsStatus: 'unavailable' });
      if (path === '/api/resources') return new Response('unavailable', { status: 500 });
      if (path === '/api/news') return Response.json({ okFeeds: 1, requestedFeeds: 2, snapshot: null });
      return success(url);
    }));
    const response = await GET(request({ authorization: 'Bearer secret-for-test' }));
    const body = await response.json();
    expect(response.status).toBe(503);
    expect(body.ok).toBe(false);
    expect(body.results.find((r: { path: string }) => r.path === '/api/weather').state).toBe('degraded');
    expect(body.results.find((r: { path: string }) => r.path.startsWith('/api/resources')).state).toBe('failed');
    expect(body.results.find((r: { path: string }) => r.path.startsWith('/api/news')).state).toBe('degraded');
  });
});
