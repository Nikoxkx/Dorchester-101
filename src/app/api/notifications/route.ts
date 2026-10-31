import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchAlerts } from '@/lib/mbta';
import { RESOURCES, verificationLevel, type ResourceCategory } from '@/data/resources';
import { statusFor, BOSTON_TZ } from '@/lib/hours';

export const dynamic = 'force-dynamic';

/**
 * Alerts feed for the notification bell.
 *
 * The previous version hard-coded a dozen announcements — "Section 8 waitlist
 * applications open", "food distribution today" — and emitted them every day,
 * whatever the date. That is the single most damaging kind of mistake on a
 * mutual-aid site: someone can act on it. Everything here is now *derived* from
 * a live feed or from the opening-hours data, and if neither produces anything
 * the response is an honest empty list.
 *
 * Read/unread state deliberately does not live on the server: it belongs to the
 * device, is kept in the app store, and never leaks one resident's activity to
 * another.
 */

export interface DerivedNotification {
  id: string;
  kind: 'transit' | 'open-now' | 'closing-soon' | 'needs-review';
  titleKey: string;
  params: Record<string, string | number>;
  href: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  /** Instant the underlying signal was produced, not "now". */
  occurredAt: string;
  expiresAt?: string;
  sourceLabel: string;
  /** Language of live transit text, as declared by its publisher. */
  contentLanguage?: string;
  /** Optional dictionary key for localizing a category source label. */
  sourceKey?: string;
  sourceUrl?: string;
}

const CATEGORY_TITLES: Record<ResourceCategory, string> = {
  food: 'Food help',
  housing: 'Housing help',
  health: 'Health care',
  legal: 'Legal aid',
  community: 'Community services',
  school: 'Classes and school',
};


export async function GET(request: Request) {
  const url = new URL(request.url);
  const now = new Date();
  const language = z.enum(['en', 'es', 'ht', 'pt', 'vi', 'zh', 'ar', 'so', 'kea']).catch('en').parse(url.searchParams.get('lang'));

  const followed = (url.searchParams.get('lines') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const categories = (url.searchParams.get('categories') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is ResourceCategory =>
      ['food', 'housing', 'health', 'legal', 'community', 'school'].includes(s)
    );

  const items: DerivedNotification[] = [];

  // 1. Real service disruptions on the lines this resident follows. A disabled
  // feed is not an outage, and an empty successful feed is not an outage either.
  const transitEnabled = url.searchParams.get('transit') !== '0';
  let alertsSource: 'mbta' | 'partial' | 'unavailable' | 'disabled' = transitEnabled ? 'mbta' : 'disabled';
  try {
    const result = transitEnabled ? await fetchAlerts(language) : null;
    if (result && result.status !== 'ok') alertsSource = result.status;
    const relevant = (result?.alerts ?? []).filter((alert) => {
      if (!followed.length) return true;
      return alert.routeIds.length === 0 || alert.routeIds.some((r) => followed.includes(r));
    });
    for (const alert of relevant.slice(0, 6)) {
      items.push({
        id: `mbta-${alert.id}`,
        kind: 'transit',
        titleKey: 'notifications.transitAlert',
        params: { header: alert.header, effect: alert.effect },
        href: '/map',
        priority: alert.severity === 'major' ? 'urgent' : alert.severity === 'minor' ? 'medium' : 'low',
        occurredAt: alert.lastModified ?? result!.fetchedAt,
        expiresAt: alert.validUntil ?? undefined,
        sourceLabel: 'MBTA',
        contentLanguage: alert.headerLanguage ?? 'en',
        sourceUrl: alert.url ?? 'https://www.mbta.com/alerts',
      });
    }
  } catch {
    alertsSource = 'unavailable';
  }

  // 2. Places in a followed category that are open right now or closing soon.
  const scored = RESOURCES.filter((record) =>
    (categories.length === 0 || categories.includes(record.category)) && record.hours,
  );

  for (const record of scored) {
    const status = statusFor(record.hours!, now, BOSTON_TZ);
    if (status.state === 'closed' || status.state === 'always-open') continue;
    const minutesLeft = status.minutesUntilClose;
    if (minutesLeft > 60 && record.category !== 'food') continue;
    items.push({
      id: `open-${record.id}`,
      kind: minutesLeft <= 60 ? 'closing-soon' : 'open-now',
      titleKey: minutesLeft <= 60 ? 'notifications.closingSoon' : 'notifications.openNow',
      // Keep the legacy text for API clients; the panel formats the numeric
      // wall-clock minute and count in the reader's selected language.
      params: { name: record.name, minutes: Math.max(0, minutesLeft), closesAt: formatClock(status.closesAt), closesAtMinutes: status.closesAt },
      href: record.detailHref ?? `/directory#${record.id}`,
      priority: minutesLeft <= 30 ? 'high' : 'medium',
      occurredAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + Math.max(1, minutesLeft) * 60_000).toISOString(),
      sourceLabel: CATEGORY_TITLES[record.category],
      sourceKey: `map.${record.category}`,
    });
  }

  // 3. Records the project itself has not confirmed recently, shown to the
  //    editor-facing footer rather than disguised as news.
  const stale = RESOURCES.filter((r) => verificationLevel(r, now) === 'critical');
  if (stale.length) {
    items.push({
      id: 'needs-review',
      kind: 'needs-review',
      titleKey: 'notifications.reviewBacklog',
      params: { count: stale.length },
      href: '/about',
      priority: 'low',
      occurredAt: now.toISOString(),
      sourceLabel: 'DOR101',
    });
  }

  const rank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
  items.sort((a, b) => rank[a.priority] - rank[b.priority] || b.occurredAt.localeCompare(a.occurredAt));

  return NextResponse.json(
    {
      notifications: items,
      total: items.length,
      generatedAt: now.toISOString(),
      // Explicit about why the bell may be empty, so the UI never has to guess.
      status: items.length ? 'ok' : alertsSource === 'partial' || alertsSource === 'unavailable' ? 'degraded' : 'quiet',
      alertsSource,
      followedLines: followed,
      followedCategories: categories,
      timezone: BOSTON_TZ,
      localTime: now.toLocaleString('en-US', { timeZone: BOSTON_TZ }),
    },
    {
      headers: {
        // Cache 60s on the edge (query-string aware) — reduces origin hits for
        // many residents watching the same transit lines. Not private: the URL
        // itself carries the filter (lines=, categories=) so each variant is its own cache entry.
        'cache-control': 'public, s-maxage=30, stale-while-revalidate=120',
        'Vary': 'Accept-Language',
        'x-robots-tag': 'noindex',
      },
    }
  );
}

function formatClock(minutes: number): string {
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}
