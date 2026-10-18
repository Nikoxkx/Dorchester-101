export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-visit',
    title: 'Dorchester Neighbor',
    description: 'Opened DOR101 to check live neighborhood data.',
    icon: 'Compass',
  },
  {
    id: 'map-explorer',
    title: 'Transit & Map Explorer',
    description: 'Explored the Dorchester interactive resource and transit map.',
    icon: 'MapPin',
  },
  {
    id: 'food-finder',
    title: 'Pantry Scout',
    description: 'Checked free food pantries, community fridges, or meal sites.',
    icon: 'Utensils',
  },
  {
    id: 'verifier',
    title: 'Community Verifier',
    description: 'Confirmed a local resource listing is open today for neighbors.',
    icon: 'CheckCircle2',
  },
  {
    id: 'listener',
    title: 'Voice Reader',
    description: 'Used read-aloud voice mode to listen to a resource summary.',
    icon: 'Volume2',
  },
  {
    id: 'field-scribe',
    title: 'Field Worker',
    description: 'Saved an offline field note on a resource or the dashboard.',
    icon: 'FileText',
  },
  {
    id: 'qr-sharer',
    title: 'Wall Poster',
    description: 'Opened a printable QR poster to share a resource offline.',
    icon: 'QrCode',
  },
  {
    id: 'housing-scout',
    title: 'Lottery Tracker',
    description: 'Added a housing lottery or project check-in reminder to a calendar.',
    icon: 'Calendar',
  },
  {
    id: 'offline-ready',
    title: 'Offline Ready',
    description: 'Service worker active so key Dorchester info works without signal.',
    icon: 'ShieldCheck',
  },
];
