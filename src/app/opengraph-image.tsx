import { ogCardImage, OG_SIZE } from '@/lib/ogCard';
import { SITE_URL } from '@/lib/site';

// The single share card every platform sees. The design lives in
// `src/lib/ogCard.tsx` and is shared with the Twitter card and /api/og,
// so a pasted link looks the same in Messages, Instagram, WhatsApp and X.
export const runtime = 'nodejs';
export const alt = 'Dorchester 101 (DOR101) — free housing, food, live MBTA map, Boston weather and free winter clothing for Dorchester, Boston, in nine languages';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default function OGImage() {
  return ogCardImage({ siteUrl: SITE_URL });
}
