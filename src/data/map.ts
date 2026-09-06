import { COMMUNITY_RESOURCES } from './resources';
import { FOOD_SITES } from './food';

export type MapLayer = 'housing' | 'food' | 'transit' | 'health' | 'legal' | 'community';

export const LAYER_CONFIG: Record<MapLayer, { color: string; label: string; desc: string }> = {
  housing: { color: '#155E8F', label: 'Housing', desc: 'CDCs and housing offices' },
  food: { color: '#E4572E', label: 'Food', desc: 'Pantries and meals' },
  transit: { color: '#DA291C', label: 'Transit', desc: 'Red Line and Fairmount' },
  health: { color: '#217A4C', label: 'Health', desc: 'Clinics and hospital' },
  legal: { color: '#7C4DA1', label: 'Legal', desc: 'Legal aid' },
  community: { color: '#0F766E', label: 'Community', desc: 'Libraries and squares' },
};

export const RED_LINE = {
  color: '#DA291C',
  name: 'Red Line — Ashmont branch',
  stops: [
    { id: 'place-jfk', name: 'JFK/UMass', lat: 42.320685, lng: -71.052391, transfers: 'Commuter Rail' },
    { id: 'place-shmnl', name: 'Savin Hill', lat: 42.31129, lng: -71.053331, transfers: '' },
    { id: 'place-fldcr', name: 'Fields Corner', lat: 42.300093, lng: -71.061667, transfers: '' },
    { id: 'place-smmnl', name: 'Shawmut', lat: 42.29312, lng: -71.065738, transfers: '' },
    { id: 'place-asmnl', name: 'Ashmont', lat: 42.284652, lng: -71.064489, transfers: 'Mattapan Trolley' },
  ],
};

export const FAIRMOUNT_LINE = {
  color: '#80276C',
  name: 'Fairmount Line',
  stops: [
    { id: 'place-DB-2265', name: 'Uphams Corner', lat: 42.31867, lng: -71.06933, transfers: '' },
    { id: 'place-DB-2258', name: 'Four Corners/Geneva', lat: 42.305, lng: -71.077, transfers: '' },
    { id: 'place-DB-2249', name: 'Talbot Avenue', lat: 42.2929, lng: -71.0784, transfers: '' },
  ],
};

export const BUS_ROUTES = [
  { id: '16', name: '16', description: 'Forest Hills via Columbia Rd' },
  { id: '17', name: '17', description: 'Andrew via Fields Corner' },
  { id: '18', name: '18', description: 'Andrew via Savin Hill' },
  { id: '23', name: '23', description: 'Ruggles via Blue Hill Ave' },
  { id: '26', name: '26', description: 'Ashmont via Talbot Ave' },
  { id: '28', name: '28', description: 'Ruggles via Blue Hill Ave' },
];

export interface MapLocation {
  id: string;
  name: string;
  type: MapLayer;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  hours?: string;
  description?: string;
  detailLink?: string;
}

export function getMapLocations(): MapLocation[] {
  const transit: MapLocation[] = [
    ...RED_LINE.stops.map((s) => ({
      id: `t-${s.id}`,
      name: s.name,
      type: 'transit' as const,
      lat: s.lat,
      lng: s.lng,
      description: `Red Line${s.transfers ? ` · ${s.transfers}` : ''}`,
      detailLink: '/neighborhood',
    })),
    ...FAIRMOUNT_LINE.stops.map((s) => ({
      id: `t-${s.id}`,
      name: s.name,
      type: 'transit' as const,
      lat: s.lat,
      lng: s.lng,
      description: 'Fairmount Line · Zone 1A',
      detailLink: '/neighborhood',
    })),
  ];

  const fromResources: MapLocation[] = COMMUNITY_RESOURCES.filter(
    (r) => typeof r.lat === 'number' && typeof r.lng === 'number',
  ).map((r) => {
    const type: MapLayer =
      r.category === 'healthcare' ? 'health' :
      r.category === 'legal' ? 'legal' :
      r.category === 'housing' ? 'housing' :
      r.category === 'education' || r.category === 'family' ? 'community' :
      'community';
    return {
      id: r.id,
      name: r.name,
      type,
      lat: r.lat as number,
      lng: r.lng as number,
      address: r.address,
      phone: r.phone,
      hours: r.hours,
      description: r.services,
      detailLink: '/resources',
    };
  });

  const fromFood: MapLocation[] = FOOD_SITES.filter(
    (s) => typeof s.lat === 'number' && typeof s.lng === 'number',
  ).map((s) => ({
    id: s.id,
    name: s.name,
    type: 'food' as const,
    lat: s.lat as number,
    lng: s.lng as number,
    address: s.address,
    phone: s.phone,
    hours: Object.entries(s.hours)
      .filter(([, v]) => v !== 'Closed')
      .map(([d, v]) => `${d.slice(0, 3)} ${v}`)
      .join(' · '),
    description: s.type,
    detailLink: '/food',
  }));

  const extra: MapLocation[] = [
    {
      id: 'c-fields',
      name: 'Fields Corner',
      type: 'community',
      lat: 42.3002,
      lng: -71.0618,
      description: 'Commercial square on the Red Line',
      detailLink: '/neighborhood',
    },
  ];

  return [...transit, ...fromResources, ...fromFood, ...extra];
}
