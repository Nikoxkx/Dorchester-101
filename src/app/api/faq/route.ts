export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { FAQ_CATEGORIES } from '@/data/faq';

export async function GET() {
  return NextResponse.json({
    categories: FAQ_CATEGORIES,
    lastUpdated: new Date().toISOString(),
  });
}
