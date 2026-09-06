export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { FAIRMOUNT_LINE, LAYER_CONFIG, RED_LINE, getMapLocations } from '@/data/map';

export async function GET() {
  return NextResponse.json({
    locations: getMapLocations(),
    layers: LAYER_CONFIG,
    redLine: RED_LINE,
    fairmount: FAIRMOUNT_LINE,
    lastUpdated: new Date().toISOString(),
  });
}
