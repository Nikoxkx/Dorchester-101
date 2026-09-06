'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  invert?: boolean;
}

const sizes = {
  sm: { icon: 26, text: 'text-base' },
  md: { icon: 34, text: 'text-xl' },
  lg: { icon: 46, text: 'text-2xl' },
  xl: { icon: 64, text: 'text-4xl' },
};

// The DOR101 mark: three Dorchester rowhouses on a pine tile.
export function DOR101Mark({ width = 34 }: { width?: number }) {
  return (
    <svg width={width} height={width} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill="#0E4C3F" />
      {/* bodies */}
      <g fill="#F6F7F4">
        <rect x="7" y="34" width="16" height="24" />
        <rect x="24" y="34" width="16" height="24" />
        <rect x="41" y="34" width="16" height="24" />
      </g>
      {/* gables */}
      <g fill="#F6F7F4">
        <polygon points="7,34 15,18 23,34" />
        <polygon points="24,34 32,12 40,34" />
        <polygon points="41,34 49,16 57,34" />
      </g>
      {/* punched windows */}
      <g fill="#0E4C3F">
        <rect x="9.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
        <rect x="17.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
        <rect x="26.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
        <rect x="34.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
        <rect x="43.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
        <rect x="51.4" y="37.5" width="3.2" height="3.2" rx="0.6" />
      </g>
      {/* doors */}
      <g fill="#E4572E">
        <rect x="13.8" y="44" width="3.4" height="12.4" rx="1" />
        <rect x="30.8" y="44" width="3.4" height="12.4" rx="1" />
        <rect x="47.8" y="44" width="3.4" height="12.4" rx="1" />
      </g>
    </svg>
  );
}

export function Logo({ size = 'md', showText = true, className, invert = false }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      <span className="shrink-0 block">
        <DOR101Mark width={icon} />
      </span>
      {showText && (
        <span className="flex flex-col leading-none min-w-0">
          <span className={cn('font-display font-extrabold tracking-[-0.02em] truncate', text, invert ? 'text-[#EDF4EF]' : 'text-[var(--charcoal)]')}>
            DOR101
          </span>
          <span className={cn('text-[9px] uppercase tracking-[0.24em] font-heading font-bold mt-1', invert ? 'text-[#8FB0A2]' : 'text-[var(--ink-soft)]')}>
            The Dot desk
          </span>
        </span>
      )}
    </div>
  );
}
