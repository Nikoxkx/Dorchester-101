import fs from 'node:fs';
import vm from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

describe('offline cache privacy', () => {
  it('does not cache API responses or any URL containing a query string', () => {
    const handlers: Record<string, (event: { request: { url: string; method: string }; respondWith: ReturnType<typeof vi.fn> }) => void> = {};
    const worker = {
      location: { origin: 'https://dorchester.example' },
      addEventListener: (type: string, handler: typeof handlers[string]) => { handlers[type] = handler; },
    };
    vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), { self: worker, URL });
    for (const url of [
      '/api/search?q=private',
      '/api/resources?q=private',
      '/api/news?custom=https%3A%2F%2Fexample.org%2Frss%3Ftoken%3Dprivate',
      '/api/cron/refresh',
      '/api/mbta?type=arrivals&stops=place-fldcr',
      '/api/weather',
      '/map?place=fields-corner-main-street',
    ]) {
      const respondWith = vi.fn();
      handlers.fetch({ request: { url: `https://dorchester.example${url}`, method: 'GET' }, respondWith });
      expect(respondWith, url).not.toHaveBeenCalled();
    }
  });

  it('removes older live-response caches on activation without deleting other sites’ caches', async () => {
    const handlers: Record<string, (event: { waitUntil: (promise: Promise<unknown>) => void }) => void> = {};
    const worker = {
      location: { origin: 'https://dorchester.example' },
      addEventListener: (type: string, handler: typeof handlers[string]) => { handlers[type] = handler; },
      clients: { claim: vi.fn().mockResolvedValue(undefined), matchAll: vi.fn().mockResolvedValue([]) },
    };
    const deleted: string[] = [];
    const caches = {
      keys: async () => ['dor101-live-v4.13.0', 'dor101-shell-v4.13.0', 'dor101-shell-v4.14.0', 'another-app'],
      delete: async (name: string) => { deleted.push(name); return true; },
    };
    vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), { self: worker, URL, caches });
    let activation: Promise<unknown> | undefined;
    handlers.activate({ waitUntil: (promise) => { activation = promise; } });
    await activation;
    expect(deleted.sort()).toEqual(['dor101-live-v4.13.0', 'dor101-shell-v4.13.0']);
    expect(worker.clients.claim).toHaveBeenCalledOnce();
  });
});
