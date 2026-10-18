import { ImageResponse } from 'next/og';

/**
 * The one social-share card, used by all three entry points:
 * `opengraph-image.tsx`, `twitter-image.tsx`, and `/api/og?title=…` for
 * per-page cards. Previously the site shipped three different previews
 * (a ~1 MB photograph PNG, and two differently-drawn generated cards) and
 * the layout's explicit `images` fought the file conventions, so what a
 * paste into Messages, WhatsApp or Instagram showed depended on which
 * crawler won. Now there is exactly one design, generated at 1200×630,
 * with the name, the promise and the contents inside the centre-safe
 * area every platform crops to.
 *
 * Full-bleed navy sky over a skyline silhouette (drawn shapes, no
 * photography to blow the file size), "Dorchester 101" set large enough
 * to survive a thumbnail, feature chips naming what is inside, and the
 * live domain read from SITE_URL so a custom domain rebrands the card
 * without touching this file.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const FEATURES = ['Housing', 'Food', 'Live MBTA map', 'Boston weather', 'Free winter clothing'];

const SKYLINE = [
  { x: 0, w: 90, h: 120 }, { x: 78, w: 60, h: 190 }, { x: 130, w: 84, h: 145 },
  { x: 206, w: 54, h: 240 }, { x: 254, w: 92, h: 165 }, { x: 340, w: 58, h: 205 },
  { x: 392, w: 86, h: 130 }, { x: 470, w: 60, h: 265 }, { x: 524, w: 96, h: 180 },
  { x: 614, w: 56, h: 150 }, { x: 664, w: 88, h: 225 }, { x: 746, w: 60, h: 160 },
  { x: 800, w: 94, h: 250 }, { x: 888, w: 56, h: 140 }, { x: 938, w: 84, h: 200 },
  { x: 1016, w: 62, h: 170 }, { x: 1072, w: 128, h: 130 },
];

export function ogCardImage({
  title = 'Dorchester 101',
  kicker = 'DOR101 · DORCHESTER, BOSTON',
  desc = 'Free housing, food, transit and legal help for Dorchester residents — live, verified, in nine languages. No account, no ads.',
  siteUrl = 'https://dorchester-101.vercel.app',
}: { title?: string; kicker?: string; desc?: string; siteUrl?: string } = {}): ImageResponse {
  const domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const longTitle = title.length > 26;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: 'linear-gradient(165deg,#0B2242 0%,#143A6B 48%,#2E6DA8 78%,#E8915B 135%)',
          color: '#FFFFFF',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* sunset glow */}
        <div style={{ position: 'absolute', right: 90, top: 46, width: 210, height: 210, borderRadius: '50%', background: 'radial-gradient(circle,#FFD9A0 0%,#F5A05B 42%,rgba(245,160,91,0) 72%)', display: 'flex' }} />
        {/* skyline silhouette */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 290, display: 'flex' }}>
          {SKYLINE.map((b, i) => (
            <div key={i} style={{ position: 'absolute', left: b.x, bottom: 0, width: b.w, height: b.h, background: 'rgba(4,16,34,0.88)', borderRadius: '4px 4px 0 0', display: 'flex' }} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 26, background: '#041022', display: 'flex' }} />
        </div>

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', padding: '54px 64px 0', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 74, height: 74, borderRadius: 18, background: '#FFFFFF', color: '#14304F', fontSize: 30, fontWeight: 900, letterSpacing: -1 }}>
              101
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3.2, color: '#BFE0F7' }}>{kicker}</div>
              <div style={{ fontSize: 19, color: 'rgba(255,255,255,0.85)' }}>Your neighborhood. Your rights. Your future.</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', background: '#C8102E', color: '#FFFFFF', fontSize: 18, fontWeight: 700, padding: '9px 16px', borderRadius: 999 }}>
              Free · 9 languages
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10, maxWidth: 860 }}>
            <div style={{ fontSize: longTitle ? 58 : 84, lineHeight: 1.02, fontWeight: 900, letterSpacing: -2 }}>{title}</div>
            <div style={{ fontSize: 27, lineHeight: 1.35, color: 'rgba(255,255,255,0.92)' }}>{desc}</div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', background: 'rgba(255,255,255,0.16)', border: '1.5px solid rgba(255,255,255,0.45)', color: '#FFFFFF', fontSize: 19, fontWeight: 700, padding: '8px 15px', borderRadius: 999 }}>
                {f}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 'auto', display: 'flex', alignItems: 'center', padding: '0 64px 40px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#FFFFFF' }}>{domain}</div>
          <div style={{ marginLeft: 'auto', fontSize: 19, color: 'rgba(255,255,255,0.8)' }}>Open source · built in Dorchester</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400' } }
  );
}
