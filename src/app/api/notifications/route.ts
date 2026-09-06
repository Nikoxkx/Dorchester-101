export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { BHA_STATUS, LIHEAP, RAFT_PROGRAM } from '@/data/programs';

interface Notification {
  id: string;
  type: 'housing' | 'food' | 'transit' | 'alert' | 'news' | 'deadline';
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  read: boolean;
  source: string;
}

async function mbtaHeaders(): Promise<string[]> {
  try {
    const res = await fetch('https://api-v3.mbta.com/alerts?filter[route]=Red,CR-Fairmount,23,28&page[limit]=5', {
      headers: { Accept: 'application/vnd.api+json' },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ id: string; attributes: { header: string; updated_at: string } }> };
    return (data.data || []).slice(0, 3).map((a) => a.attributes.header);
  } catch {
    return [];
  }
}

function buildNotifications(mbta: string[]): Notification[] {
  const now = new Date();
  const month = now.getMonth();
  const list: Notification[] = [];

  list.push({
    id: 'bha-s8',
    type: 'housing',
    title: 'BHA Section 8 waitlist is closed',
    message: BHA_STATUS.note,
    link: '/affordable-housing',
    linkText: 'Housing desk',
    priority: 'high',
    createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    read: false,
    source: 'Boston Housing Authority',
  });

  list.push({
    id: 'bha-ph',
    type: 'housing',
    title: 'Public housing waitlists are open',
    message: 'You can still apply for BHA public housing at boston.myhousing.com even while tenant-based Section 8 is closed.',
    link: 'https://boston.myhousing.com',
    linkText: 'Apply',
    priority: 'high',
    createdAt: new Date(now.getTime() - 8 * 3600000).toISOString(),
    read: false,
    source: 'Boston Housing Authority',
  });

  list.push({
    id: 'raft',
    type: 'deadline',
    title: `RAFT cap is $${RAFT_PROGRAM.maxBenefit.toLocaleString()} / 12 months`,
    message: RAFT_PROGRAM.note,
    link: RAFT_PROGRAM.sourceUrl,
    linkText: 'RAFT',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
    read: false,
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
      createdAt: now.toISOString(),
      read: false,
      source: 'ABCD / DHCD',
    });
  }

  if (month >= 2 && month <= 5) {
    list.push({
      id: 'syep',
      type: 'news',
      title: 'Watch Boston SYEP dates',
      message: 'Summer Youth Employment usually opens in the spring for ages 14–18. Confirm on boston.gov — do not rely on a copied deadline.',
      link: 'https://www.boston.gov',
      linkText: 'boston.gov',
      priority: 'low',
      createdAt: now.toISOString(),
      read: false,
      source: 'City of Boston',
    });
  }

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
      read: false,
      source: 'MBTA',
    });
  });

  list.push({
    id: 'food',
    type: 'food',
    title: 'Need a meal today?',
    message: 'Project Bread 1-800-645-8333 knows which pantries are actually open this week.',
    link: '/food',
    linkText: 'Food desk',
    priority: 'medium',
    createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    read: false,
    source: 'Project Bread',
  });

  return list;
}

export async function GET() {
  const headers = await mbtaHeaders();
  const notifications = buildNotifications(headers);
  return NextResponse.json({
    notifications,
    total: notifications.length,
    unreadCount: notifications.length,
    lastUpdated: new Date().toISOString(),
    source: 'BHA status, RAFT, seasonal programs, MBTA alerts',
  });
}

export async function POST() {
  return NextResponse.json({ success: true, readCount: 0 });
}
