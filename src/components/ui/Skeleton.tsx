'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton', className)} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-8 w-24" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 bg-[var(--color-bg-secondary)] rounded-lg">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
      ))}
    </div>
  );
}
