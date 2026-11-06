'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ImageRevealCardProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  caption: ReactNode;
  credit?: ReactNode;
  priority?: boolean;
  className?: string;
  imageClassName: string;
}

/**
 * Photo card with a subtle reveal: the image lifts on hover/focus while its
 * caption and source credit gain contrast above a harbor-tinted gradient.
 * Captions remain visible on touch screens and reduced-motion preferences.
 */
export function ImageRevealCard({
  src,
  alt,
  width,
  height,
  sizes,
  caption,
  credit,
  priority = false,
  className,
  imageClassName,
}: ImageRevealCardProps) {
  return (
    <figure className={cn('dor101-image-reveal group relative isolate m-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]', className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        className={cn('dor101-image-reveal-media block w-full object-cover', imageClassName)}
      />
      <div className="dor101-image-reveal-wash pointer-events-none absolute inset-0" aria-hidden="true" />
      <figcaption className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
        <div className="dor101-image-reveal-caption">
          <p className="font-heading text-xs font-semibold leading-snug text-white sm:text-sm">{caption}</p>
          {credit && <div className="mt-1.5 max-w-full text-[10px] leading-snug text-white/90 sm:text-[11px]">{credit}</div>}
        </div>
      </figcaption>
    </figure>
  );
}
