import { COMMUNITY_RESOURCES } from './resources';
import { FOOD_SITES } from './food';
import { HOUSING_LISTINGS, DEVELOPMENT_PROJECTS } from './housing';
import { NEIGHBORHOODS } from './neighborhoods';
import { FAQ_CATEGORIES } from './faq';

export interface SearchHit {
  id: string;
  title: string;
  blurb: string;
  href: string;
  kind: 'resource' | 'food' | 'housing' | 'project' | 'neighborhood' | 'faq' | 'page';
}

const PAGES: SearchHit[] = [
  { id: 'p-home', title: 'Home', blurb: 'Hotlines, news, map', href: '/', kind: 'page' },
  { id: 'p-housing', title: 'Affordable housing', blurb: 'BHA, MassAccess, AMI calculator', href: '/affordable-housing', kind: 'page' },
  { id: 'p-food', title: 'Food', blurb: 'Pantries, meals, SNAP', href: '/food', kind: 'page' },
  { id: 'p-map', title: 'Map', blurb: 'Red Line, pantries, clinics', href: '/map', kind: 'page' },
  { id: 'p-tools', title: 'Calculators', blurb: 'Rent burden and AMI', href: '/tools', kind: 'page' },
  { id: 'p-news', title: 'News', blurb: 'Dorchester Reporter, WBUR, city', href: '/news', kind: 'page' },
  { id: 'p-faq', title: 'Questions', blurb: 'Section 8, SNAP, eviction', href: '/faq', kind: 'page' },
  { id: 'p-projects', title: 'Housing projects', blurb: 'BPDA developments', href: '/projects', kind: 'page' },
  { id: 'p-market', title: 'Rents and sales', blurb: 'Published market estimates', href: '/market-trends', kind: 'page' },
  { id: 'p-nabe', title: 'Neighborhood guide', blurb: 'Fields Corner to Lower Mills', href: '/neighborhood', kind: 'page' },
  { id: 'p-resources', title: 'Directory', blurb: 'CDCs, legal aid, clinics', href: '/resources', kind: 'page' },
];

export function searchContent(query: string, limit = 20): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const hits: SearchHit[] = [];

  const match = (text: string) => text.toLowerCase().includes(q);

  for (const p of PAGES) {
    if (match(p.title) || match(p.blurb)) hits.push(p);
  }

  for (const r of COMMUNITY_RESOURCES) {
    if (match(r.name) || match(r.services) || match(r.address || '') || r.languages.some(match)) {
      hits.push({
        id: r.id,
        title: r.name,
        blurb: r.services.slice(0, 140),
        href: '/resources',
        kind: 'resource',
      });
    }
  }

  for (const f of FOOD_SITES) {
    if (match(f.name) || match(f.neighborhood) || match(f.address) || match(f.type)) {
      hits.push({
        id: f.id,
        title: f.name,
        blurb: `${f.type} · ${f.neighborhood}`,
        href: '/food',
        kind: 'food',
      });
    }
  }

  for (const h of HOUSING_LISTINGS) {
    if (match(h.propertyName) || match(h.neighborhood) || match(h.notes)) {
      hits.push({
        id: h.id,
        title: h.propertyName,
        blurb: h.neighborhood,
        href: '/affordable-housing',
        kind: 'housing',
      });
    }
  }

  for (const p of DEVELOPMENT_PROJECTS) {
    if (match(p.name) || match(p.neighborhood) || match(p.developer) || match(p.description)) {
      hits.push({
        id: p.id,
        title: p.name,
        blurb: `${p.neighborhood} · ${p.status.replace('_', ' ')}`,
        href: '/projects',
        kind: 'project',
      });
    }
  }

  for (const n of NEIGHBORHOODS) {
    if (match(n.name) || match(n.description) || n.landmarks.some(match)) {
      hits.push({
        id: n.slug,
        title: n.name,
        blurb: n.description.slice(0, 140),
        href: '/neighborhood',
        kind: 'neighborhood',
      });
    }
  }

  for (const cat of FAQ_CATEGORIES) {
    for (const faq of cat.faqs) {
      if (match(faq.q) || match(faq.a)) {
        hits.push({
          id: faq.q,
          title: faq.q,
          blurb: cat.name,
          href: '/faq',
          kind: 'faq',
        });
      }
    }
  }

  const seen = new Set<string>();
  return hits.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  }).slice(0, limit);
}
