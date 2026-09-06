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

const CATEGORY_PIN: Record<ResourceCategory, { token: string; glyph: string }> = {
  housing: { token: 'var(--color-accent-primary)', glyph: 'M' },
  food: { token: 'var(--color-accent-green)', glyph: 'F' },
  health: { token: 'var(--color-accent-secondary)', glyph: '+' },
  legal: { token: 'var(--color-accent-amber)', glyph: 'L' },
  community: { token: 'var(--color-accent-primary-soft)', glyph: 'C' },
  school: { token: 'var(--mbta-green)', glyph: 'S' },
};

/**
 * Resource pin. The letter is not the whole affordance: `alt` text comes from the
 * marker's `title`/`alt` props and the tooltip repeats the name, so colour and
 * glyph are redundant coding, not the only signal.
 */
export function resourcePinIcon(category: ResourceCategory, opts: { selected?: boolean; openNow?: boolean } = {}) {
  const tone = CATEGORY_PIN[category] ?? CATEGORY_PIN.community;
  return L.divIcon({
    className: 'dor101-icon',
    html: `
      <span class="pin${opts.selected ? ' is-selected' : ''}${opts.openNow ? ' is-open' : ''}" style="--pin-color:${tone.token}">
        <svg viewBox="0 0 24 32" aria-hidden="true" focusable="false" class="pin__shape">
          <path d="M12 1.5c5.6 0 10.2 4.5 10.2 10.1 0 7.3-8 16.6-10.2 18.9-2.2-2.3-10.2-11.6-10.2-18.9C1.8 6 6.4 1.5 12 1.5z"
                fill="var(--pin-color)" stroke="rgba(0,0,0,.22)" stroke-width="1"/>
        </svg>
        <span class="pin__glyph" aria-hidden="true">${tone.glyph}</span>
        ${opts.openNow ? '<span class="pin__live" aria-hidden="true"></span>' : ''}
      </span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 33],
    popupAnchor: [0, -30],
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
