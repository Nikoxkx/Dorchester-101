import { ogCardImage, OG_SIZE } from '@/lib/ogCard';
import { SITE_URL } from '@/lib/site';

// Same card as the Open Graph image by design (see ogCard.tsx).
export const runtime = 'nodejs';
export const alt = 'Dorchester 101 (DOR101) — free housing, food, live MBTA map, Boston weather and free winter clothing for Dorchester, Boston';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function TwitterImage() {
  return ogCardImage({ siteUrl: SITE_URL });
}
