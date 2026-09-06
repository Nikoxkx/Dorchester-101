import { globalCache, CACHE_TTL } from '@/lib/cache';

/**
 * Server-side realtime hub — the single push channel for the app.
 *
 * The SSE endpoint (/api/notifications/stream) subscribes here. Pollers run
 * once per process regardless of client count (reference-counted), diff
 * against the last known payload, and broadcast only real changes:
 *
 *  · mbta   — MBTA service alerts for Dorchester routes (30s poll)
 *  · news   — new articles in the RSS aggregation (5 min check)
 *  · data   — fingerprint of curated datasets: food hours, BPDA projects,
 *             program statuses (60s check; changes when verified data changes)
 *  · ping   — keepalive comment, handled inside the stream route
 */

export type RealtimeEventType = 'mbta' | 'news' | 'data';
export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: Record<string, unknown>;
  at: string;
}

type Subscriber = (event: RealtimeEvent) => void;

interface MbtaAlertRecord {
  id: string;
  header: string;
  updatedAt: string;
}

const POLL = {
  mbta: 30_000,
  news: 5 * 60_000,
  data: 60_000,
  heartbeat: 25_000,
} as const;

async function fetchMbtaAlerts(): Promise<MbtaAlertRecord[]> {
  try {
    const res = await fetch(
      'https://api-v3.mbta.com/alerts?filter[route]=Red,CR-Fairmount,23,28&fields[alert]=header,updated_at&sort=-updated_at&page[limit]=10',
      {
        headers: { Accept: 'application/vnd.api+json' },
        signal: AbortSignal.timeout(8000),
        // Never let Next's data cache serve stale alerts to the poller.
        cache: 'no-store',
      },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: Array<{ id: string; attributes: { header: string; updated_at: string } }>;
    };
    return (json.data ?? []).map((a) => ({
      id: a.id,
      header: a.attributes.header,
      updatedAt: a.attributes.updated_at,
    }));
  } catch {
    return [];
  }
}

async function fetchNewsFingerprint(): Promise<string | null> {
  const cached = globalCache.get<{ articles: Array<{ id: string }> }>('news:articles');
  if (!cached || cached.articles.length === 0) return null;
  const latest = cached.articles
    .slice(0, 20)
    .map((a) => a.id)
    .sort()
    .join(',');
  return `${cached.articles.length}:${latest}`;
}

class RealtimeHub {
  private subscribers = new Set<Subscriber>();
  private timers: ReturnType<typeof setInterval>[] = [];
  private lastMbta: MbtaAlertRecord[] | null = null;
  private lastNews: string | null = null;
  private lastData: string | null = null;

  get subscriberCount(): number {
    return this.subscribers.size;
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    if (this.subscribers.size === 1) this.start();
    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) this.stop();
    };
  }

  broadcast(event: RealtimeEvent): void {
    for (const fn of this.subscribers) {
      try {
        fn(event);
      } catch {
        // A failing client must never break the others.
      }
    }
  }

  private start(): void {
    if (this.timers.length > 0) return;

    const tick = async (fn: () => Promise<void>) => {
      try {
        await fn();
      } catch {
        // Poll failures are non-fatal; the next tick retries.
      }
    };

    const pollMbta = async () => {
      const alerts = await fetchMbtaAlerts();
      if (alerts.length === 0 && this.lastMbta === null) return; // offline start
      const prev = JSON.stringify(this.lastMbta ?? []);
      const next = JSON.stringify(alerts);
      if (prev !== next) {
        this.lastMbta = alerts;
        this.broadcast({
          type: 'mbta',
          payload: { alerts, changedAt: new Date().toISOString() },
          at: new Date().toISOString(),
        });
      }
    };
    this.lastMbta = null;
    void tick(pollMbta);
    this.timers.push(setInterval(() => void tick(pollMbta), POLL.mbta));

    const pollNews = async () => {
      const fp = await fetchNewsFingerprint();
      if (fp === null) return;
      if (this.lastNews !== null && fp !== this.lastNews) {
        this.broadcast({
          type: 'news',
          payload: { reason: 'updated' },
          at: new Date().toISOString(),
        });
      }
      this.lastNews = fp;
    };
    void tick(pollNews);
    this.timers.push(setInterval(() => void tick(pollNews), POLL.news));

    const pollData = async () => {
      const { DEVELOPMENT_PROJECTS } = await import('@/data/housing');
      const { FOOD_SITES } = await import('@/data/food');
      const { PROGRAM_META } = await import('@/data/programs');
      const fp = `${PROGRAM_META.lastReviewed}|${DEVELOPMENT_PROJECTS.length}|${FOOD_SITES.length}`;
      if (this.lastData !== null && fp !== this.lastData) {
        this.broadcast({
          type: 'data',
          payload: { reason: 'verified-datasets-updated' },
          at: new Date().toISOString(),
        });
      }
      this.lastData = fp;
    };
    void tick(pollData);
    this.timers.push(setInterval(() => void tick(pollData), POLL.data));
  }

  private stop(): void {
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
  }
}

const globalForHub = globalThis as unknown as { __dor101RealtimeHub?: RealtimeHub };
export const realtimeHub: RealtimeHub = (globalForHub.__dor101RealtimeHub ??= new RealtimeHub());

export { CACHE_TTL };
