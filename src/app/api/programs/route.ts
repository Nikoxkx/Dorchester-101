export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  BHA_STATUS,
  HOTLINES,
  HUD_AMI_FY2026,
  HUD_FMR_FY2026,
  LIHEAP,
  MBTA_FARES,
  RAFT_PROGRAM,
  SNAP_FY2026,
} from '@/data/programs';

export async function GET() {
  return NextResponse.json({
    ami: HUD_AMI_FY2026,
    fmr: HUD_FMR_FY2026,
    snap: SNAP_FY2026,
    raft: RAFT_PROGRAM,
    bha: BHA_STATUS,
    fares: MBTA_FARES,
    liheap: LIHEAP,
    hotlines: HOTLINES,
    lastUpdated: new Date().toISOString(),
  });
}
