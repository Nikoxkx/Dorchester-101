'use client';

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
        initial={animated ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glow effect */}
        {animated && (
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#4A90E2] blur-lg opacity-50"
            style={{ width: icon, height: icon }}
          />
        )}
        
        {/* Main icon */}
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Background gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B3A6B" />
              <stop offset="50%" stopColor="#2E5A99" />
              <stop offset="100%" stopColor="#4A7BC4" />
            </linearGradient>
            <linearGradient id="houseGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8F0FE" />
            </linearGradient>
          </defs>
          
          {/* Rounded square background */}
          <rect
            x="4"
            y="4"
            width="72"
            height="72"
            rx="16"
            fill="url(#logoGradient)"
          />
          
          {/* Triple-decker house icon - iconic Dorchester architecture */}
          <g>
            {/* Roof */}
            <path
              d="M40 16L20 30H60L40 16Z"
              fill="url(#houseGradient)"
              stroke="white"
              strokeWidth="1.5"
            />
            
            {/* Building body - 3 floors representing triple-decker */}
            <rect x="24" y="30" width="32" height="10" fill="white" opacity="0.95" />
            <rect x="24" y="41" width="32" height="10" fill="white" opacity="0.9" />
            <rect x="24" y="52" width="32" height="10" fill="white" opacity="0.85" />
            
            {/* Windows - 3 per floor */}
            <rect x="27" y="33" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.8" />
            <rect x="37" y="33" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.8" />
            <rect x="47" y="33" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.8" />
            
            <rect x="27" y="44" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.7" />
            <rect x="37" y="44" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.7" />
            <rect x="47" y="44" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.7" />
            
            <rect x="27" y="55" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.6" />
            <rect x="47" y="55" width="6" height="5" rx="1" fill="#1B3A6B" opacity="0.6" />
            
            {/* Door */}
            <rect x="37" y="54" width="6" height="8" rx="1" fill="#C8102E" />
            <circle cx="41.5" cy="58" r="0.8" fill="#FFD700" />
            
            {/* Location pin accent */}
            <circle cx="58" cy="22" r="8" fill="#C8102E" />
            <circle cx="58" cy="22" r="4" fill="white" />
            <path d="M58 30L54 24H62L58 30Z" fill="#C8102E" />
          </g>
          
          {/* Subtle shine */}
          <rect
            x="4"
            y="4"
            width="72"
            height="36"
            rx="16"
            fill="white"
            opacity="0.1"
          />
        </svg>
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
          <span className="text-[0.6em] text-[var(--color-text-muted)] font-heading tracking-wider">
            DORCHESTER
          </span>
        </motion.div>
      )}
    </div>
  );
}
