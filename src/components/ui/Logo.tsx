'use client';

import { useId } from 'react';
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
  sm: { icon: 32, wordmark: 16 },
  md: { icon: 44, wordmark: 20 },
  lg: { icon: 56, wordmark: 24 },
  xl: { icon: 80, wordmark: 30 },
};

/** The photo tile and DOR101 wordmark are one responsive SVG logo image. */
export function Logo({ size = 'md', showText = true, animated = true, className }: LogoProps) {
  const { icon, wordmark } = sizes[size];
  const brandStyle = useAppStore((s) => s.brandStyle);
  const logoSrc = brandStyle === 'classic' ? '/logo-classic.png' : '/logo.png';
  const clipId = `dor101-logo-clip-${useId().replace(/:/g, '')}`;
  const corner = icon * 0.22;
  const gap = Math.round(icon * 0.23);
  const width = icon + gap + Math.ceil(wordmark * 4.8);
  const baseline = icon * 0.69;

  return (
    <div className={cn('flex min-w-0 items-center', className)}>
      {showText ? (
        <motion.svg
          role="img"
          aria-label="DOR101"
          focusable="false"
          viewBox={`0 0 ${width} ${icon}`}
          width={width}
          height={icon}
          initial={animated ? { opacity: 0, scale: 0.96 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.35 }}
          className="block shrink-0"
        >
          <defs>
            <clipPath id={clipId}>
              <rect width={icon} height={icon} rx={corner} />
            </clipPath>
          </defs>
          <image
            href={logoSrc}
            x="0"
            y="0"
            width={icon}
            height={icon}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <rect
            x="0.5"
            y="0.5"
            width={icon - 1}
            height={icon - 1}
            rx={corner}
            fill="none"
            stroke="rgba(255,255,255,0.42)"
            strokeWidth="1"
          />
          <text
            x={icon + gap}
            y={baseline}
            fontFamily="var(--font-display)"
            fontSize={wordmark}
            fontWeight="700"
            letterSpacing="0.3"
            fill="var(--color-text-primary)"
          >
            DOR<tspan fill="var(--color-accent-primary)">101</tspan>
          </text>
        </motion.svg>
      ) : (
        <motion.div
          initial={animated ? { opacity: 0, scale: 0.96 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.35 }}
          className="relative shrink-0"
        >
          <Image
            src={logoSrc}
            alt=""
            width={icon}
            height={icon}
            priority
            unoptimized
            className="relative z-10 rounded-[22%] border border-white/35 object-cover shadow-[var(--shadow-sm)]"
          />
        </motion.div>
      )}
    </div>
  );
}
