'use client';

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <div
        className={cn('rounded-full border-[var(--line)] border-t-[var(--blue)] animate-spin', sizes[size])}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && <p className="text-sm text-[var(--muted)]">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ isLoading, children, text }: { isLoading: boolean; children: React.ReactNode; text?: string }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--paper)]/80 flex items-center justify-center z-10">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[320px] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading…" />
    </div>
  );
}

export function DataRefreshIndicator({ lastUpdated, isRefreshing }: { lastUpdated: string | null; isRefreshing: boolean }) {
  return (
    <div className="masthead-date">
      {isRefreshing ? 'Updating…' : lastUpdated ? `As of ${lastUpdated}` : '—'}
    </div>
  );
}
