'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, wordmark: 'text-base' },
  md: { icon: 44, wordmark: 'text-xl' },
  lg: { icon: 56, wordmark: 'text-2xl' },
  xl: { icon: 80, wordmark: 'text-3xl' },
};

/** A crisp photo tile beside a formal, live-text DOR101 lockup. */
export function Logo({ size = 'md', showText = true, animated = true, className }: LogoProps) {
  const { icon, wordmark } = sizes[size];
  const brandStyle = useAppStore((s) => s.brandStyle);
  const logoSrc = brandStyle === 'classic' ? '/logo-classic.png' : '/logo.png';

  return (
    <div className={cn('flex min-w-0 items-center gap-2.5', className)}>
      <motion.div
        initial={animated ? { opacity: 0, scale: 0.96 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 0.35 }}
        className="relative shrink-0"
      >
        <Image
          key={logoSrc}
          src={logoSrc}
          alt=""
          width={icon}
          height={icon}
          priority
          unoptimized
          className="relative z-10 rounded-[22%] border border-white/35 object-cover shadow-[var(--shadow-sm)]"
        />
      </motion.div>

      {showText && (
        <motion.div
          initial={animated ? { opacity: 0, x: -8 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.12, duration: 0.32 }}
          style={{ minHeight: icon }}
          className="flex min-w-0 flex-col items-start justify-center text-[var(--color-text-primary)]"
        >
          <span className={cn('whitespace-nowrap font-display font-bold leading-none tracking-[0.015em]', wordmark)}>
            DOR<span className="ms-[0.08em] text-[var(--color-accent-primary)]">101</span>
          </span>
        </motion.div>
      )}
    </div>
  );
}
