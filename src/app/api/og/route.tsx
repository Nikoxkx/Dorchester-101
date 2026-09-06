import { ImageResponse } from 'next/og';
import { LANGUAGES } from '@/i18n/config';
import { dictionaries } from '@/i18n';

/**
 * The link-preview card.
 *
 * Shared links decide whether to open a community resource, so this is drawn for a
 * person on a phone in a group chat: what the site is, what it costs nothing to
 * use, and that nine languages are available. It is generated rather than a
 * screenshot so the copy can never drift from the words the site actually uses.
 */
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#14304F';
const CREAM = '#F3EFE7';
const RED = '#C8102E';

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
<rect x="4" y="4" width="72" height="72" rx="16" fill="${NAVY}"/>
<path d="M40 16L20 30H60L40 16Z" fill="#FFFFFF" fill-opacity="0.96"/>
<rect x="24" y="30" width="32" height="10" fill="#FFFFFF" fill-opacity="0.95"/>
<rect x="24" y="41" width="32" height="10" fill="#FFFFFF" fill-opacity="0.9"/>
<rect x="24" y="52" width="32" height="10" fill="#FFFFFF" fill-opacity="0.85"/>
<rect x="37" y="54" width="6" height="8" rx="1" fill="${RED}"/>
<circle cx="58" cy="22" r="8" fill="${RED}"/><circle cx="58" cy="22" r="4" fill="#FFFFFF"/>
<path d="M58 30L54 24H62L58 30Z" fill="${RED}"/>
</svg>`;

export async function GET() {
  // Copy is read from the English dictionary so the card cannot drift away from the
  // words the site itself uses. The preview language is English because a share card
  // is one asset, and the page it links to follows the reader's own setting.
  const en = dictionaries.en;
  const subhead = `${en['site.tagline']} ${en['intro.fact.verified']}.`;
  const mark = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: CREAM,
          padding: 56,
          gap: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mark} width={92} height={92} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: NAVY, letterSpacing: -0.5 }}>DOR101</div>
            <div style={{ fontSize: 19, color: '#54606E', letterSpacing: 2.4 }}>DORCHESTER · BOSTON</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <div style={{ background: NAVY, color: '#FFFFFF', fontSize: 18, padding: '8px 14px', borderRadius: 999 }}>
              {`${LANGUAGES.length} languages`}
            </div>
            <div style={{ background: RED, color: '#FFFFFF', fontSize: 18, padding: '8px 14px', borderRadius: 999 }}>No account, no ads</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
          <div style={{ fontSize: 66, lineHeight: 1.06, fontWeight: 800, color: NAVY, letterSpacing: -1.6 }}>
            {en['intro.title']}
          </div>
          <div style={{ fontSize: 27, color: '#3C4757', lineHeight: 1.35 }}>{subhead}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['EN', 'ES', 'HT', 'PT', 'VI', 'ZH', 'AR', 'SO', 'KEA'].map((code) => (
              <div
                key={code}
                style={{
                  fontSize: 16,
                  color: NAVY,
                  border: `2px solid ${NAVY}`,
                  borderRadius: 8,
                  padding: '4px 8px',
                  fontWeight: 700,
                }}
              >
                {code}
              </div>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 21, color: '#54606E' }}>Open source · built in Dorchester</div>
        </div>
      </div>
    ),
    { ...size, headers: { 'cache-control': 'public, max-age=86400, s-maxage=604800' } }
  );
}
