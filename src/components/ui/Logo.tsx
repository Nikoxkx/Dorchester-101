'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
  invert?: boolean;
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-lg' },
  lg: { icon: 48, text: 'text-2xl' },
  xl: { icon: 72, text: 'text-4xl' },
};

export function Logo({ size = 'md', showText = true, className, invert = false }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg width={icon} height={icon} viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" fill="#C8102E" />
        <rect x="14" y="22" width="36" height="30" fill="#F4F5F0" />
        <path d="M12 24 L32 10 L52 24" stroke="#161714" strokeWidth="3" fill="#F4F5F0" />
        <rect x="18" y="26" width="8" height="7" fill="#1E3A5F" />
        <rect x="28" y="26" width="8" height="7" fill="#1E3A5F" />
        <rect x="38" y="26" width="8" height="7" fill="#1E3A5F" />
        <rect x="18" y="36" width="8" height="7" fill="#1E3A5F" />
        <rect x="38" y="36" width="8" height="7" fill="#1E3A5F" />
        <rect x="28" y="36" width="8" height="16" fill="#C8102E" />
      </svg>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn('font-display font-semibold tracking-tight', text, invert ? 'text-[#eeeee6]' : '')}>
            DOR101
          </span>
          <span className={cn('text-[10px] uppercase tracking-[0.18em] font-heading', invert ? 'text-[#c6c7be]' : 'text-[var(--muted)]')}>
            The Dot
          </span>
        </div>
      )}
    </div>
  );
}
