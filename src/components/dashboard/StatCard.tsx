'use client';

import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  source?: string;
  sourceDate?: string;
}

/**
 * StatCard — content layer: flat, opaque, full contrast.
 * Source and as-of date sit with the number, not in a footnote.
 */
export function StatCard({ label, value, trend, source, sourceDate }: StatCardProps) {
  return (
    <div className="content-card squircle p-4">
      <p className="text-caption font-semibold uppercase tracking-wider text-text-2">{label}</p>
      <p className="text-title1 font-bold tracking-tight text-1 mt-1 num leading-none">{value}</p>
      {trend && (
        <p
          className={cn(
            'text-caption font-semibold mt-1.5 num',
            trend.direction === 'up' ? 'text-warning' : trend.direction === 'down' ? 'text-success' : 'text-text-2',
          )}
        >
          {trend.value > 0 ? '+' : ''}
          {trend.value}%{' '}
          <span className="font-normal text-text-3">yr</span>
        </p>
      )}
      {source && (
        <p className="text-caption2 text-text-3 mt-2.5 leading-snug">
          {source}
          {sourceDate ? ` · ${sourceDate}` : ''}
        </p>
      )}
    </div>
  );
}
