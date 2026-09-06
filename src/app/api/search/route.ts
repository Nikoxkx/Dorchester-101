import { NextResponse } from 'next/server';
import { getMapLocations } from '@/data/map';
import { COLLEGE_RESOURCES } from '@/data/college';
import { COMMUNITY_RESOURCES } from '@/data/resources';
import { HOUSING_LISTINGS } from '@/data/housing';
import { FOOD_SITES } from '@/data/food';

export interface SearchHit {
  id: string;
  title: string;
  snippet?: string;
  href: string;
  category?: string;
}

/**
 * GET /api/search?q= — global fuzzy-ish search across sections, resources,
 * organizations, listings, and food sites. Client-side sections are matched
 * locally in the command palette; everything data-backed lives here.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  if (!q) return NextResponse.json({ hits: [], query: q });

  const hits: SearchHit[] = [];
  const match = (...fields: (string | undefined)[]) =>
    fields.some((f) => f?.toLowerCase().includes(q));

  // Community resource directory
  for (const r of COMMUNITY_RESOURCES) {
    if (match(r.name, r.services, r.category, r.neighborhood, r.address)) {
      hits.push({
        id: `res-${r.id}`,
        title: r.name,
        snippet: r.services.slice(0, 140),
        href: '/resources',
        category: r.category,
      });
    }
  }

  // Food sites
  for (const s of FOOD_SITES) {
    if (match(s.name, s.neighborhood, s.address, s.foodTypes.join(' '))) {
      hits.push({
        id: `food-${s.id}`,
        title: s.name,
        snippet: `${s.address}`,
        href: '/food',
        category: s.type,
      });
    }
  }

  // Housing listings
  for (const l of HOUSING_LISTINGS) {
    if (match(l.propertyName, l.neighborhood, l.notes)) {
      hits.push({
        id: `housing-${l.id}`,
        title: l.propertyName,
        snippet: l.notes.slice(0, 140),
        href: '/affordable-housing',
        category: 'Housing',
      });
    }
  }

  // College resources
  COLLEGE_RESOURCES.dorchesterSpecific.forEach((r) => {
    if (match(r.name, r.description)) {
      hits.push({
        id: `college-${r.name.slice(0, 12)}`,
        title: r.name,
        snippet: r.description.slice(0, 140),
        href: '/college-access',
        category: r.type,
      });
    }
  });

  // Map locations
  getMapLocations().forEach((loc) => {
    if (match(loc.name, loc.type, loc.address, loc.description)) {
      hits.push({
        id: `map-${loc.id ?? loc.name.slice(0, 12)}`,
        title: loc.name,
        snippet: `${loc.address ?? ''} · ${loc.description ?? ''}`.slice(0, 140),
        href: '/map',
        category: loc.type,
      });
    }
  });

  return NextResponse.json({ hits: hits.slice(0, 24), query: q });
}
