import { ogCardImage, OG_SIZE } from '@/lib/ogCard';
import { SITE_URL } from '@/lib/site';

/**
 * Per-page share cards: `/api/og?title=…&desc=…&kicker=…`.
 *
 * Page metadata points its og:image here so sharing /weather or
 * /winter-clothing shows that section's name and promise, drawn in the
 * identical design as the home card (see `src/lib/ogCard.tsx`). Inputs
 * are plain text, length-capped, and rendered as text by the image
 * generator — never parsed as markup.
 */
export const runtime = 'nodejs';
export const size = OG_SIZE;
export const contentType = 'image/png';

function clamp(raw: string | null, max: number): string | undefined {
  const text = raw?.replace(/\s+/g, ' ').trim();
  return text ? text.slice(0, max) : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return ogCardImage({
    title: clamp(searchParams.get('title'), 60),
    desc: clamp(searchParams.get('desc'), 140),
    kicker: clamp(searchParams.get('kicker'), 48),
    siteUrl: SITE_URL,
  });
}
