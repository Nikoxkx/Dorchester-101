'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * OrgLogo — renders a partner organization's real mark from /public/logos/
 * (see public/logos/MANIFEST.md for verified source URLs and licenses).
 *
 * If the file has not been added yet, we render a plain typographic
 * wordmark — deliberately NOT a stand-in logo. Design rules forbid
 * generated or approximated marks.
 */

export interface OrgLogoProps {
  /** Manifest file key, e.g. "bha", "hud", "mbta". */
  org: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 24, md: 32, lg: 44 } as const;

export function OrgLogo({ org, name, className, size = 'md' }: OrgLogoProps) {
  const [src, setSrc] = useState<string | null>(null);
  const px = SIZES[size];

  useEffect(() => {
    let cancelled = false;
    // SVG first, then PNG.
    const candidates = [`/logos/${org}.svg`, `/logos/${org}.png`];
    (async () => {
      for (const path of candidates) {
        try {
          const res = await fetch(path, { method: 'HEAD' });
          if (res.ok && !cancelled) {
            setSrc(path);
            return;
          }
        } catch {
          // offline — fall through to wordmark
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [org]);

  if (src) {
    // Local, tiny, already-optimized SVG/PNG — next/image adds nothing here.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} logo`}
        width={px}
        height={px}
        loading="lazy"
        className={cn('object-contain shrink-0', className)}
        style={{ width: px, height: px }}
      />
    );
  }

  // Typographic wordmark — the org's initials in its own plain chip.
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w[0] ?? ''))
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <span
      aria-hidden
      className={cn('squircle grid place-items-center bg-[var(--surface-2)] text-text-2 font-bold shrink-0', className)}
      style={{ width: px, height: px, borderRadius: px * 0.3, fontSize: px * 0.36 }}
    >
      {initials || name[0]}
    </span>
  );
}
