/** Small geodesy helpers shared by the map sheet and the directory. */

const R = 6371000;

export function haversineMeters(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const la1 = toRad(a[0]);
  const la2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Walking estimate. Straight-line distance × 1.3 for the street grid, at
 * 80 m/min (≈ 3 mph) which is the MBTA's own planning speed. Always labelled
 * "about" in the UI.
 */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters * 1.3) / 80));
}

export function formatDistance(meters: number, locale = 'en-US'): string {
  const miles = meters / 1609.344;
  if (miles < 0.1) return `${Math.round(meters * 3.28084 / 10) * 10} ft`;
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(miles)} mi`;
}

export function googleDirections(dest: [number, number], mode: 'walking' | 'transit', origin?: [number, number] | null) {
  const o = origin ? `&origin=${origin[0]},${origin[1]}` : '';
  return `https://www.google.com/maps/dir/?api=1${o}&destination=${dest[0]},${dest[1]}&travelmode=${mode}`;
}

export function appleDirections(dest: [number, number], mode: 'walking' | 'transit') {
  return `https://maps.apple.com/?daddr=${dest[0]},${dest[1]}&dirflg=${mode === 'walking' ? 'w' : 'r'}`;
}
