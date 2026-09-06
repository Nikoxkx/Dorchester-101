import { BHA_STATUS, LIHEAP, RAFT_PROGRAM, PROGRAM_META } from '@/data/programs';
import { DEVELOPMENT_PROJECTS } from '@/data/housing';
import { FOOD_SITES } from '@/data/food';

/**
 * Notification payloads — shared by the REST route and the SSE stream so
 * both always emit the same shape. Everything here traces to a named source;
 * nothing is invented for the sake of having a notification.
 */

export type NotificationType = 'housing' | 'food' | 'transit' | 'alert' | 'news' | 'deadline';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  priority: NotificationPriority;
  createdAt: string;
  read?: boolean;
  source: string;
}

export async function fetchMbtaAlertHeaders(limit = 3): Promise<string[]> {
  try {
    const res = await fetch(
      'https://api-v3.mbta.com/alerts?filter[route]=Red,CR-Fairmount,23,28&page[limit]=5',
      { headers: { Accept: 'application/vnd.api+json' }, signal: AbortSignal.timeout(6000) },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: Array<{ attributes: { header: string } }>;
    };
    return (data.data || []).slice(0, limit).map((a) => a.attributes.header);
  } catch {
    return [];
  }
}

/**
 * Recently approved/filed BPDA projects — the newest entries in the curated,
 * BPDA-verified development set (see data/housing.ts). This surfaces the most
 * recent additions on record; the dataset itself is the source of truth.
 */
export function recentProjects(limit = 2): AppNotification[] {
  return DEVELOPMENT_PROJECTS.filter((p) => p.approvalDate)
    .sort(
      (a, b) => new Date(b.approvalDate!).getTime() - new Date(a.approvalDate!).getTime(),
    )
    .slice(0, limit)
    .map((p) => ({
      id: `project-${p.id}`,
      type: 'housing' as const,
      title: p.name,
      message: `${p.totalUnits ?? '—'} units · ${p.incomeRestrictedUnits ?? 0} income-restricted · ${p.neighborhood}`,
      link: '/projects',
      linkText: 'Projects',
      priority: 'medium' as const,
      createdAt: p.approvalDate!,
      source: 'BPDA',
    }));
}

/** Food sites whose verified hours are most recent in the curated set. */
export function updatedFoodSites(limit = 2): AppNotification[] {
  return [...FOOD_SITES]
    .sort((a, b) => new Date(b.lastVerified).getTime() - new Date(a.lastVerified).getTime())
    .slice(0, limit)
    .map((s) => ({
      id: `food-${s.id}`,
      type: 'food' as const,
      title: s.name,
      message: `Hours last verified ${s.lastVerified}. Call ahead — schedules shift by season.`,
      link: '/food',
      linkText: 'Food',
      priority: 'low' as const,
      createdAt: s.lastVerified,
      source: 'Verified listing',
    }));
}

export async function buildNotifications(): Promise<AppNotification[]> {
  const now = new Date();
  const month = now.getMonth();
  const list: AppNotification[] = [];

  // Verified program statuses (curated, sourced, dated)
  list.push({
    id: 'bha-s8',
    type: 'housing',
    title: 'BHA Section 8 waitlist is closed',
    message: BHA_STATUS.note,
    link: '/affordable-housing',
    linkText: 'Housing desk',
    priority: 'high',
    createdAt: BHA_STATUS.asOf,
    source: 'Boston Housing Authority',
  });

  list.push(...recentProjects());
  list.push(...updatedFoodSites());

  list.push({
    id: 'raft',
    type: 'deadline',
    title: `RAFT cap is $${RAFT_PROGRAM.maxBenefit.toLocaleString('en-US')} / 12 months`,
    message: RAFT_PROGRAM.note,
    link: RAFT_PROGRAM.sourceUrl,
    linkText: 'RAFT',
    priority: 'medium',
    createdAt: PROGRAM_META.lastReviewed,
    source: 'Mass.gov',
  });

  if (month >= 10 || month <= 3) {
    list.push({
      id: 'liheap',
      type: 'alert',
      title: 'Fuel assistance season',
      message: `${LIHEAP.note} ABCD: ${LIHEAP.applyPhone}.`,
      link: LIHEAP.sourceUrl,
      linkText: 'LIHEAP',
      priority: 'urgent',
      createdAt: PROGRAM_META.lastReviewed,
      source: 'ABCD / DHCD',
    });
  }

  // Live MBTA service alerts
  const mbta = await fetchMbtaAlertHeaders();
  mbta.forEach((header, i) => {
    list.push({
      id: `mbta-${i}`,
      type: 'transit',
      title: header,
      message: 'From the MBTA alert feed for the Red Line, Fairmount, and main Dot buses.',
      link: '/map',
      linkText: 'Map',
      priority: 'medium',
      createdAt: now.toISOString(),
      source: 'MBTA',
    });
  });

  list.push({
    id: 'food-hotline',
    type: 'food',
    title: 'Need a meal today?',
    message: 'Project Bread 1-800-645-8333 knows which pantries are actually open this week.',
    link: '/food',
    linkText: 'Food desk',
    priority: 'medium',
    createdAt: PROGRAM_META.lastReviewed,
    source: 'Project Bread',
  });

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
