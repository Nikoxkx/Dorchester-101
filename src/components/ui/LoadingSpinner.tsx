'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('relative', sizes[size])}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[var(--color-accent-primary)]/20"
        />
        {/* Spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-accent-primary)]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner pulse */}
        <motion.div
          className="absolute inset-2 rounded-full bg-[var(--color-accent-primary)]/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-[var(--color-text-muted)] font-heading"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ isLoading, children, text }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[var(--color-bg-primary)]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
        >
          <LoadingSpinner size="lg" text={text} />
        </motion.div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 relative">
            {/* Animated logo placeholder */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#1B3A6B] to-[#4A7BC4]"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(27, 58, 107, 0.3)',
                  '0 0 40px rgba(27, 58, 107, 0.6)',
                  '0 0 20px rgba(27, 58, 107, 0.3)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-white font-display font-bold text-xl"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              D
            </motion.div>
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[var(--color-text-muted)] font-heading"
        >
          Loading DOR101...
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-1 bg-[var(--color-accent-primary)] rounded-full mt-4 max-w-[200px] mx-auto"
        />
      </div>
    </div>
  );
}

export function DataRefreshIndicator({ lastUpdated, isRefreshing }: { lastUpdated: string | null; isRefreshing: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
      {isRefreshing ? (
        <>
          <motion.div
            className="w-2 h-2 rounded-full bg-[var(--color-accent-amber)]"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <span>Updating...</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 rounded-full bg-[var(--color-accent-green)]" />
          <span>Updated {lastUpdated || 'just now'}</span>
        </>
      )}
    </div>
  );
}
