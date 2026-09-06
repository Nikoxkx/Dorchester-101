import { NextResponse } from 'next/server';
import { PROGRAM_META } from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'DOR101',
    version: '1.2.0-rebuilt',
    branch: 'arena/01a07424-dorchester-101',
    lastReviewed: PROGRAM_META.lastReviewed,
    features: [
      'dashboard',
      'college-access',
      'map',
      'report-engine',
      'multi-language',
      'dark-mode',
      'electron-desktop',
    ],
    dataSources: [
      'HUD FY2026',
      'MBTA API v3',
      'BPDA',
      'BHA',
      'CSNDC',
      'Princeton Bridge Year',
    ],
    timestamp: new Date().toISOString(),
  });
}
