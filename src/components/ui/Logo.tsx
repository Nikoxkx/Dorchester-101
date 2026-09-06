'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  invert?: boolean;
}

const sizes = {
  sm: { icon: 22, text: 'text-lg' },
  md: { icon: 28, text: 'text-[1.6rem]' },
  lg: { icon: 40, text: 'text-[2.1rem]' },
  xl: { icon: 56, text: 'text-[2.9rem]' },
};

/** The DOR101 plate: cobalt square with a knocked-out slab-serif D. */
export function DOR101Mark({ width = 28 }: { width?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const maskId = `dor-d-${uid}`;
  return (
    <svg width={width} height={width} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="60" height="60" rx="11" fill="#1748E2" />
      {/* White D overlay, punched by the counter via a mask */}
      <mask id={maskId}>
        <rect x="0" y="0" width="64" height="64" fill="#000" />
        <rect x="17" y="13" width="11" height="38" fill="#fff" />
        <path d="M28 13 A19 19 0 0 1 28 51 Z" fill="#fff" />
        <ellipse cx="35.5" cy="32" rx="5.5" ry="11.5" fill="#000" />
      </mask>
      <rect x="2" y="2" width="60" height="60" rx="11" fill="#f4f6f8" mask={`url(#${maskId})`} />
    </svg>
  );
}

export function Logo({ size = 'md', showText = true, className, invert = false }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <span className="shrink-0 block drop-shadow-[0_1px_0_rgba(17,26,44,0.25)]">
        <DOR101Mark width={icon} />
      </span>
      {showText && (
        <span className={cn('font-display font-bold tracking-[0.02em] leading-none truncate', text)}>
          <span className={invert ? 'text-[#eef2f7]' : 'text-[var(--charcoal)]'}>DOR</span>
          <span className={invert ? 'text-[#f4c400]' : 'text-[#1748e2]'}>101</span>
        </span>
      )}
    </div>
  );
}
