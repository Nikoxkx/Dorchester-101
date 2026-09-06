import { NextResponse } from 'next/server';
import { getMapLocations } from '@/data/map';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  if (!q) return NextResponse.json({ results: [], query: '' });

  const results: { type: string; title: string; url: string; category: string; snippet: string }[] = [];

  // Search map locations by name / type
  const locations = getMapLocations();
  locations.forEach((loc) => {
    if (loc.name.toLowerCase().includes(q) || loc.type.toLowerCase().includes(q)) {
      results.push({
        type: 'map',
        title: loc.name,
        url: `/map`,
        category: loc.type,
        snippet: `${loc.address || ''} · ${loc.description || ''}`.slice(0, 140) + '...',
      });
    }
  });

  return NextResponse.json({ query: q, count: results.length, results: results.slice(0, 12), timestamp: new Date().toISOString() });
}
