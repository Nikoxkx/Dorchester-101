import { NextResponse } from 'next/server';
import { PROGRAM_META } from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'healthy',
    service: 'DOR101',
    version: '2.0.0',
    lastReviewed: PROGRAM_META.lastReviewed,
    realtime: '/api/notifications/stream',
    features: [
      'dashboard',
      'projects',
      'affordable-housing',
      'market-trends',
      'map',
      'food',
      'neighborhood',
      'tools',
      'news',
      'resources',
      'faq',
      'settings',
      'realtime-sse',
      'offline-pwa',
      'electron-desktop',
    ],
    dataSources: [
      'HUD FY2026',
      'MBTA API v3',
      'BPDA',
      'BHA',
      'Boston Open Data',
      'U.S. Census ACS',
      'Zillow Research / Redfin (published estimates)',
      'Greater Boston Food Bank / Project Bread',
    ],
    timestamp: new Date().toISOString(),
  });
}
