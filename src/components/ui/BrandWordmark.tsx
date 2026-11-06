'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface BrandWordmarkProps {
  className?: string;
  /** Mark the wordmark as decoration when the surrounding content names the brand. */
  decorative?: boolean;
}

/**
 * The DOR101 outline mark from the supplied skyline reference, rebuilt as a
 * responsive vector so it stays crisp in the menu, on the home hero, and at
 * browser zoom. The offset strokes create the stacked/extruded lettering;
 * the halftone fill keeps the original poster-like detail without baking text
 * into the photograph.
 */
export function BrandWordmark({ className, decorative = false }: BrandWordmarkProps) {
  const patternId = `dor101-halftone-${useId().replace(/:/g, '')}`;

  return (
    <svg
      viewBox="0 0 444 108"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'DOR101'}
      aria-hidden={decorative || undefined}
      focusable="false"
      className={cn('block h-auto w-full overflow-visible', className)}
    >
      <defs>
        <pattern id={patternId} width="5" height="5" patternUnits="userSpaceOnUse">
          <circle cx="1.2" cy="1.2" r="0.72" fill="currentColor" fillOpacity="0.46" />
          <circle cx="3.7" cy="3.7" r="0.56" fill="currentColor" fillOpacity="0.22" />
        </pattern>
      </defs>
      <g
        fontFamily="Public Sans, Arial, sans-serif"
        fontSize="70"
        fontWeight="900"
        letterSpacing="-3"
        strokeLinejoin="round"
      >
        <text
          x="19"
          y="78"
          textLength="398"
          lengthAdjust="spacingAndGlyphs"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="2.2"
          transform="translate(12 11)"
        >
          DOR101
        </text>
        <text
          x="19"
          y="78"
          textLength="398"
          lengthAdjust="spacingAndGlyphs"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="2"
          transform="translate(8 8)"
        >
          DOR101
        </text>
        <text
          x="19"
          y="78"
          textLength="398"
          lengthAdjust="spacingAndGlyphs"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.58"
          strokeWidth="1.8"
          transform="translate(4 4)"
        >
          DOR101
        </text>
        <text
          x="19"
          y="78"
          textLength="398"
          lengthAdjust="spacingAndGlyphs"
          fill={`url(#${patternId})`}
          stroke="currentColor"
          strokeWidth="1.65"
          paintOrder="stroke fill"
        >
          DOR101
        </text>
      </g>
    </svg>
  );
}
