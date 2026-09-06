import { cn } from '@/lib/utils';
import { CATEGORY_PIN_TONE } from './icons';
import type { ResourceCategory } from '@/data/resources';

/**
 * The resource pin as a React element, for legends, lists and cards. It is
 * built from the same `CATEGORY_PIN_TONE` table as the Leaflet marker, so the
 * symbol a reader learns in the legend is the symbol on the map.
 */
export function CategoryPin({
  category,
  size = 22,
  className,
  title,
}: {
  category: ResourceCategory;
  size?: number;
  className?: string;
  title?: string;
}) {
  const tone = CATEGORY_PIN_TONE[category] ?? CATEGORY_PIN_TONE.community;
  return (
    <svg
      viewBox="0 0 32 44"
      width={size}
      height={size * (44 / 32)}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      style={{ ['--pin-color' as string]: tone.token }}
    >
      {title && <title>{title}</title>}
      <path
        d="M16 1.5c7.6 0 13.5 5.8 13.5 13.2 0 9.4-10.4 20.8-12.6 23.9a1.1 1.1 0 0 1-1.8 0C12.9 35.5 2.5 24.1 2.5 14.7 2.5 7.3 8.4 1.5 16 1.5z"
        fill={tone.token}
        stroke="rgba(0,0,0,.22)"
      />
      <circle cx="16" cy="14.7" r="9.2" fill="rgba(255,255,255,.94)" />
      <g transform="translate(9.4 8.1) scale(0.55)" fill="none" stroke={tone.token} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d={tone.path} />
      </g>
    </svg>
  );
}
