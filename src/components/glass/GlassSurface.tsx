'use client';

import { forwardRef, useCallback, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassWeight = 'regular' | 'clear';

/**
 * GlassSurface — the one primitive every glass element composes.
 *
 * Liquid Glass rules enforced here:
 *  - `regular` weight for nav bars, sidebars, sheets, modals, toasts;
 *    `clear` weight for buttons, pills, small floating controls.
 *  - The material stays translucent + backdrop-saturated, so its apparent
 *    tint shifts with whatever content scrolls beneath it.
 *  - A pointer-tracked specular highlight runs on mouse devices only —
 *    it is meaningless on touch and is skipped there (and by
 *    prefers-reduced-transparency / the in-app toggle, via CSS).
 *
 * Never wrap page content in this. Content stays flat and opaque.
 */

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  weight?: GlassWeight;
  /** Adds the 1px specular top edge + inner line. On for elevated chrome. */
  edge?: boolean;
  /** Pointer-tracked highlight (mouse only). On for large surfaces. */
  specular?: boolean;
  /** Continuous-corner squircle instead of a plain radius. */
  squircle?: boolean;
  /** CSS radius value, e.g. "var(--radius-lg)" — feeds the squircle var. */
  radius?: string;
  children?: ReactNode;
}

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
  function GlassSurface(
    {
      weight = 'regular',
      edge = true,
      specular = false,
      squircle = true,
      radius,
      className,
      onPointerMove,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--spec-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
        el.style.setProperty('--spec-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        onPointerMove?.(e);
      },
      [onPointerMove],
    );

    return (
      <div
        ref={ref}
        onPointerMove={specular ? handlePointerMove : onPointerMove}
        className={cn(
          'glass',
          weight === 'regular' ? 'glass-regular' : 'glass-clear',
          edge && 'glass-edge',
          specular && 'glass-specular',
          squircle && 'squircle',
          'overflow-hidden',
          className,
        )}
        style={radius ? ({ ...style, '--squircle-r': radius } as React.CSSProperties) : style}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
