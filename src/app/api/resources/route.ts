export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { COMMUNITY_RESOURCES } from '@/data/resources';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const list = category && category !== 'all'
    ? COMMUNITY_RESOURCES.filter((r) => r.category === category)
    : COMMUNITY_RESOURCES;

  return NextResponse.json({
    resources: list,
    total: list.length,
    lastUpdated: new Date().toISOString(),
  });
}
