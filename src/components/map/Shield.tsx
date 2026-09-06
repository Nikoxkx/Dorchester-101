import { cn } from '@/lib/utils';

/**
 * The route badge, in HTML, for anywhere that is not a Leaflet marker: the
 * departures list, the legend, the layer chips. The map paints the same shape from
 * `routeShieldIcon` in icons.ts, so a route looks identical in both places and a
 * rider can match the circle on the platform to the circle on the screen.
 *
 * Colours come from the MBTA feed when it answers (`route.color` from
 * `/api/mbta?type=routes`) and from `src/data/transit.ts` otherwise, which is the
 * authority's own published value. Nothing here guesses a line's colour.
 */

export type ShieldMode = 'subway' | 'bus' | 'rail' | 'trolley';

export function Shield({
  label,
  mode,
  color,
  ink,
  compact,
  className,
}: {
  label: string;
  mode: ShieldMode;
  /** Official hex from the feed or the reference data; unset falls back to CSS. */
  color?: string;
  ink?: string;
  /** Tighter padding for inside chips and lists. */
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'shield',
        `shield--${mode}`,
        compact && 'shield--compact',
        // A colour that needs black type and one that needs white type are two
        // different contrast problems; `ink` is the authority's own text colour.
        !color && !ink && 'shield--reference',
        className
      )}
      style={color ? { background: color, color: ink ?? '#FFFFFF', borderColor: 'transparent' } : undefined}
    >
      {label}
    </span>
  );
}
