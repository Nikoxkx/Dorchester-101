import { NextResponse } from 'next/server';
import { getMapLocations } from '@/data/map';
import { COLLEGE_RESOURCES } from '@/data/college';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  if (!q) return NextResponse.json({ results: [], query: '' });

  const results: { type: string; title: string; url: string; category: string; snippet: string }[] = [];

  // Search college resources
  COLLEGE_RESOURCES.dorchesterSpecific.forEach((r) => {
    if (r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) {
      results.push({
        type: 'college-access',
        title: r.name,
        url: r.url,
        category: r.type,
        snippet: r.description.slice(0, 140) + '...',
      });
    }
  });

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

  // Add pathway match
  if (q.includes('princeton') || q.includes('college') || q.includes('service')) {
    results.unshift({
      type: 'pathway',
      title: 'Dorchester to Princeton — Service Pathway',
      url: '/college-access',
      category: 'princeton-alignment',
      snippet: 'Verified college-access resources for first-generation students, framed by Princeton values.',
    });
  }

  return NextResponse.json({ query: q, count: results.length, results: results.slice(0, 12), timestamp: new Date().toISOString() });
}
