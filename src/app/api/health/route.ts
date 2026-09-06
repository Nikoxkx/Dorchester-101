import { NextResponse } from 'next/server';
import { PROGRAM_META } from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: 'healthy',
    service: 'DOR101',
    version: '2.0.0',
    lastReviewed: PROGRAM_META.lastReviewed,
    features: [
      'dashboard',
      'affordable-housing',
      'food',
      'map',
      'projects',
      'market-estimates',
      'neighborhood-guide',
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
      'Mass.gov / EOHLC',
      'USDA SNAP (DTA)',
      'Project Bread',
      'Dorchester Reporter',
    ],
    timestamp: new Date().toISOString(),
  });
}
