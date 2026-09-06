export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { searchContent } from '@/data/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const hits = searchContent(q, 24);
  return NextResponse.json({ q, hits, total: hits.length });
}
