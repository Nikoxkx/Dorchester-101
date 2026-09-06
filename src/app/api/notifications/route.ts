import { NextResponse } from 'next/server';
import { buildNotifications } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications — same payload the SSE snapshot emits.
 * Used by the polling fallback (offline desktop, restrictive networks)
 * and as the initial load before the stream connects.
 */
export async function GET() {
  const notifications = await buildNotifications();
  return NextResponse.json({
    notifications,
    total: notifications.length,
    unreadCount: notifications.length,
    lastUpdated: new Date().toISOString(),
    source: 'BHA status, BPDA filings, verified food listings, RAFT/LIHEAP, live MBTA alerts',
  });
}

export async function POST() {
  // Read receipts are local-only (privacy-first); the server holds no user state.
  return NextResponse.json({ success: true, readCount: 0 });
}
