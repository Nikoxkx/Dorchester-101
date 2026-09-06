/* Generates project-drawn vector badges for every source in src/data/sources.ts.
   These are original symbols in each publisher's public colour — not their trademarks. */
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'public', 'sources');
fs.mkdirSync(out, { recursive: true });

const W = 64;
const wrap = (bg, inner, ink = '#fff') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
<rect width="64" height="64" rx="16" fill="${bg}"/><rect width="64" height="64" rx="16" fill="url(#g)"/>
<g fill="${ink}" stroke="${ink}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`;

const text = (t, size = 26, y = 41, weight = 800, family = "'Inter','Helvetica Neue',Arial,sans-serif", extra = '') =>
  `<text x="32" y="${y}" text-anchor="middle" font-family="${family}" font-weight="${weight}" font-size="${size}" stroke="none" ${extra}>${t}</text>`;

const badges = {
  // Census: three ascending bars + star (data + federal)
  census: ['#112E51', `<rect x="14" y="36" width="8" height="14" rx="1.5" stroke="none"/><rect x="28" y="26" width="8" height="24" rx="1.5" stroke="none"/><rect x="42" y="16" width="8" height="34" rx="1.5" stroke="none"/><path d="M18 12l1.6 3.4 3.7.5-2.7 2.6.7 3.7L18 20.4 14.7 22.2l.7-3.7-2.7-2.6 3.7-.5z" stroke="none"/>`],
  // HUD: house with door
  hud: ['#005EA2', `<path d="M12 32L32 14l20 18" fill="none" stroke-width="4"/><path d="M18 30v20h28V30" fill="none" stroke-width="4"/><rect x="28" y="36" width="8" height="14" stroke="none"/>`],
  // MBTA: generic circled T transit mark
  mbta: ['#DA291C', `<circle cx="32" cy="32" r="21" fill="#fff" stroke="none"/><circle cx="32" cy="32" r="17" fill="#DA291C" stroke="none"/>${text('T', 24, 41, 900, "Arial,Helvetica,sans-serif", 'fill="#fff"')}`],
  // BHA: key
  bha: ['#0B4F8A', `<circle cx="22" cy="26" r="9" fill="none" stroke-width="4.5"/><path d="M29 32l18 18M40 43l4-4M46 49l4-4" fill="none" stroke-width="4.5"/>`],
  // BPDA: skyline
  bpda: ['#00857C', `<rect x="10" y="30" width="10" height="22" stroke="none"/><rect x="24" y="16" width="12" height="36" stroke="none"/><rect x="40" y="24" width="14" height="28" stroke="none"/><path d="M8 52h48" stroke-width="3"/>`],
  // Boston.gov: B monogram in a shield
  bostongov: ['#091F2F', `<path d="M32 10l17 6v14c0 11-7 19-17 24-10-5-17-13-17-24V16z" fill="#FB4D42" stroke="none"/>${text('B', 26, 41, 900, "Georgia,'Times New Roman',serif", 'fill="#fff"')}`],
  // GBFB: apple
  gbfb: ['#6CA33A', `<path d="M32 22c-6-5-16-3-17 8 0 10 7 20 12 20 2 0 3-1 5-1s3 1 5 1c5 0 12-10 12-20-1-11-11-13-17-8z" stroke="none"/><path d="M32 22c0-5 2-9 6-11" fill="none" stroke-width="3"/>`],
  // DTA: EBT card
  dta: ['#14558F', `<rect x="10" y="18" width="44" height="30" rx="4" stroke="none"/><rect x="10" y="25" width="44" height="6" fill="#0A2E4F" stroke="none"/><rect x="16" y="37" width="14" height="4" rx="1" fill="#0A2E4F" stroke="none"/>`],
  // MassLegalHelp: scales
  masslegal: ['#7A2E1D', `<path d="M32 12v40M20 52h24M32 20l-14 4M32 20l14 4" fill="none" stroke-width="3.5"/><path d="M10 36l8-12 8 12a8 8 0 0 1-16 0zM38 36l8-12 8 12a8 8 0 0 1-16 0z" fill="none" stroke-width="3"/>`],
  // OSM: map pin
  osm: ['#7EBC6F', `<path d="M32 10c-9 0-16 7-16 16 0 12 16 28 16 28s16-16 16-28c0-9-7-16-16-16z" stroke="none"/><circle cx="32" cy="26" r="6" fill="#7EBC6F" stroke="none"/>`],
  // Esri: globe
  esri: ['#2E7D32', `<circle cx="32" cy="32" r="20" fill="none" stroke-width="3.5"/><path d="M12 32h40M32 12c-7 6-7 34 0 40M32 12c7 6 7 34 0 40M17 21c8 4 22 4 30 0M17 43c8-4 22-4 30 0" fill="none" stroke-width="2.5"/>`],
  // Wikimedia Commons: W serif
  wikimedia: ['#333333', text('W', 34, 44, 700, "Georgia,'Times New Roman',serif")],
  // Dorchester Reporter: folded newspaper
  dotnews: ['#1C3F60', `<path d="M14 16h30v32H14z" fill="none" stroke-width="3.5"/><path d="M44 24h6v20a4 4 0 0 1-8 0V20" fill="none" stroke-width="3.5"/><path d="M20 24h18M20 31h18M20 38h11" stroke-width="3"/>`],
  // WBUR: radio waves
  wbur: ['#C8102E', `<circle cx="32" cy="34" r="4" stroke="none"/><path d="M22 24a14 14 0 0 1 20 0M16 18a22 22 0 0 1 32 0M26 30a8 8 0 0 1 12 0" fill="none" stroke-width="3.5"/><path d="M32 38v12" stroke-width="3.5"/>`],
  // GBH: broadcast tower
  gbh: ['#4B2A83', `<path d="M32 20v32M22 52l10-32 10 32M26 40h12" fill="none" stroke-width="3.5"/><path d="M20 20a12 12 0 0 1 24 0M14 16a18 18 0 0 1 36 0" fill="none" stroke-width="3"/>`],
  // Boston Globe: serif G
  globe: ['#000000', text('G', 38, 46, 700, "Georgia,'Times New Roman',serif")],
  // Mass.gov: state shield with star
  massgov: ['#14558F', `<path d="M32 10l17 6v14c0 11-7 19-17 24-10-5-17-13-17-24V16z" fill="none" stroke-width="3.5"/><path d="M32 22l2.4 5 5.5.7-4 3.8 1 5.5-4.9-2.7-4.9 2.7 1-5.5-4-3.8 5.5-.7z" stroke="none"/>`],
  // DOR101 itself: uses site icon
};
for (const [id, [bg, inner]] of Object.entries(badges)) {
  fs.writeFileSync(path.join(out, `${id}.svg`), wrap(bg, inner));
}
console.log('wrote', Object.keys(badges).length, 'badges to', out);
