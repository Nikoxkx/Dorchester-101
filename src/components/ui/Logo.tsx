'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: 'text-lg' },
  md: { icon: 40, text: 'text-xl' },
  lg: { icon: 56, text: 'text-2xl' },
  xl: { icon: 80, text: 'text-4xl' },
};

export function Logo({ size = 'md', showText = true, animated = true, className }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ duration: 0.35 }}
        className="relative"
      >
        {/* The mark is a flat civic navy tile: a brand that pulses on a loop steals
            attention from the one thing the header has to offer, which is the
            search field. */}
        {/* A photograph, not an illustration: the Boston skyline seen across
            Dorchester Bay at dusk (Wikimedia Commons, Sswonk, CC BY-SA 3.0 — see
            public/IMAGE-CREDITS.md). The same file is the app icon. */}
        <Image
          src="/logo.png"
          alt=""
          width={icon}
          height={icon}
          priority
          className="relative z-10 rounded-[22%] shadow-[var(--shadow-sm)]"
        />
      </motion.div>
      
      {showText && (
        <motion.div
          initial={animated ? { opacity: 0, x: -10 } : undefined}
          animate={animated ? { opacity: 1, x: 0 } : undefined}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex flex-col"
        >
          <span className={cn('font-display font-bold leading-none', text)}>
            DOR<span className="text-[var(--color-accent-primary)]">101</span>
          </span>
          <span className="text-[0.6em] font-heading tracking-wider text-[var(--color-text-muted)]">
            DORCHESTER
          </span>
        </motion.div>
      )}
    </div>
  );
}
