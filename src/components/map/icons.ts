import L from 'leaflet';
import type { ResourceCategory } from '@/data/resources';

/**
 * Leaflet icons drawn as HTML rather than bitmaps.
 *
 * Vector-in-a-divIcon is the right trade here: it scales on high-DPI screens for
 * free, it inherits the page's font and colour tokens so a shield looks like the
 * legend beside it, and — the part an emoji pin can never do — it re-renders when
 * the theme or contrast preference changes, because the styles come from CSS
 * custom properties rather than baked pixels.
 */

/**
 * Route badge, MBTA-shaped: circle for the subway, square for surfaces, the same
 * silhouette people learn on platform signage. The `.shield--*` rules in
 * globals.css already define the shape and the official colour for each mode, so
 * the map only overrides them when the live feed reports a different colour.
 */
export type ShieldMode = 'subway' | 'bus' | 'rail' | 'trolley';

export function routeShieldIcon(
  label: string,
  mode: ShieldMode,
  color?: string,
  opts: { ink?: string; selected?: boolean } = {}
) {
  const size = mode === 'bus' || mode === 'rail' ? 'height:24px;min-width:38px;padding:0 6px;' : 'width:28px;height:28px;';
  const style = [size, color ? `background:${color};` : '', opts.ink ? `color:${opts.ink};` : ''].join('');
  const html = `<span class="shield shield--${mode}${opts.selected ? ' is-selected' : ''}" style="${style}">${escapeHtml(label)}</span>`;
  return L.divIcon({
    className: 'dor101-icon',
    html,
    iconSize: mode === 'bus' || mode === 'rail' ? [40, 24] : [28, 28],
    iconAnchor: mode === 'bus' || mode === 'rail' ? [20, 12] : [14, 14],
  });
}

/**
 * Category glyphs, drawn as 24x24 stroke paths (Lucide geometry, ISC licence),
 * so the pin on the map and the icon in the list beside it are literally the
 * same shape. A letter was the old glyph; it did not survive translation
 * ("F" for food is meaningless in Vietnamese) and it did not survive small
 * screens.
 */
const CATEGORY_PIN: Record<ResourceCategory, { token: string; glyph: string; path: string }> = {
  housing: {
    token: 'var(--color-accent-primary)',
    glyph: 'housing',
    path: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  },
  food: {
    token: 'var(--color-accent-green)',
    glyph: 'food',
    path: 'M12 7c-1.5-2.5-6-2.5-7.5 1S5 18 8 20c1.2.8 2.8.8 4 0 1.2.8 2.8.8 4 0 3-2 5-8.5 3.5-12S13.5 4.5 12 7zM12 7V4m0 0c0-1 1-2 2.5-2',
  },
  health: {
    token: 'var(--color-accent-secondary)',
    glyph: 'health',
    path: 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z',
  },
  legal: {
    token: 'var(--color-accent-amber)',
    glyph: 'legal',
    path: 'M12 3v18M5 21h14M4 7h16M6 7l-3 7a3 3 0 0 0 6 0L6 7zm12 0-3 7a3 3 0 0 0 6 0l-3-7z',
  },
  community: {
    token: 'var(--color-accent-primary-soft)',
    glyph: 'community',
    path: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  },
  school: {
    token: 'var(--mbta-green)',
    glyph: 'school',
    path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  },
};

/**
 * Resource pin: a teardrop with the category glyph inside, a stem dot on the
 * ground so the exact address is unambiguous at any zoom, and a soft shadow
 * that is drawn in SVG (not CSS) so it survives Leaflet's transform layers.
 * Colour and glyph are redundant coding; the tooltip and `title` carry the name.
 */
export function resourcePinIcon(category: ResourceCategory, opts: { selected?: boolean; openNow?: boolean } = {}) {
  const tone = CATEGORY_PIN[category] ?? CATEGORY_PIN.community;
  const html = `
    <span class="pin pin--${tone.glyph}${opts.selected ? ' is-selected' : ''}${opts.openNow ? ' is-open' : ''}" style="--pin-color:${tone.token}">
      <svg viewBox="0 0 32 44" aria-hidden="true" focusable="false" class="pin__shape">
        <ellipse cx="16" cy="41" rx="6" ry="2.2" class="pin__shadow"/>
        <path class="pin__body" d="M16 1.5c7.6 0 13.5 5.8 13.5 13.2 0 9.4-10.4 20.8-12.6 23.9a1.1 1.1 0 0 1-1.8 0C12.9 35.5 2.5 24.1 2.5 14.7 2.5 7.3 8.4 1.5 16 1.5z"/>
        <path class="pin__rim" d="M16 3.2c6.7 0 11.8 5 11.8 11.5 0 8-8.6 18-11.8 22.3C12.8 32.7 4.2 22.7 4.2 14.7 4.2 8.2 9.3 3.2 16 3.2z"/>
        <circle cx="16" cy="14.7" r="9.2" class="pin__disc"/>
        <g transform="translate(9.4 8.1) scale(0.55)" class="pin__glyph">
          <path d="${tone.path}"/>
        </g>
      </svg>
      ${opts.openNow ? '<span class="pin__live" aria-hidden="true"></span>' : ''}
    </span>`;
  return L.divIcon({
    className: 'dor101-icon',
    html,
    iconSize: [32, 44],
    iconAnchor: [16, 41],
    popupAnchor: [0, -38],
    tooltipAnchor: [0, -30],
  });
}

export function stationDotIcon(color: string, opts: { interchange?: boolean; selected?: boolean; accessible?: boolean } = {}) {
  const size = opts.interchange ? 14 : 9;
  return L.divIcon({
    className: 'dor101-icon',
    html: `<span class="stop-dot${opts.selected ? ' is-selected' : ''}${opts.interchange ? ' is-interchange' : ''}"
                 style="--dot:${color};--dot-size:${size}px">${opts.accessible ? '<span class="stop-dot__access" aria-hidden="true"></span>' : ''}</span>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
  });
}

/** You-are-here marker, animated by CSS so reduce-motion switches it off. */
export function userLocationIcon() {
  return L.divIcon({
    className: 'dor101-icon',
    html: `<span class="me-here"><span class="me-here__pulse" aria-hidden="true"></span><span class="me-here__dot" aria-hidden="true"></span></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] as string
  );
}

export const CATEGORY_PIN_TONE = CATEGORY_PIN;
