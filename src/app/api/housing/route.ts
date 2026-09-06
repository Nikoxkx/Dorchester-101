export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { HOUSING_LISTINGS } from '@/data/housing';
import { BHA_STATUS, HUD_AMI_FY2026, RAFT_PROGRAM } from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    listings: HOUSING_LISTINGS,
    bha: BHA_STATUS,
    ami: HUD_AMI_FY2026,
    raft: RAFT_PROGRAM,
    lastUpdated: new Date().toISOString(),
  });
}
