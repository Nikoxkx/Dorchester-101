'use client';

import { cn, formatCurrency, formatNumber } from '@/lib/utils';

interface StatCardProps {
  icon?: React.ReactNode;
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent' | 'status';
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  source?: string;
  sourceDate?: string;
  color?: string;
  status?: string;
}

export function StatCard({
  label,
  value,
  format = 'number',
  trend,
  source,
  sourceDate,
  status,
}: StatCardProps) {
  const formatted =
    format === 'currency' ? formatCurrency(value) :
    format === 'percent' ? `${value}%` :
    format === 'status' ? (status || '').replace(/_/g, ' ') :
    formatNumber(value);

  return (
    <div className="py-4 border-t-2 border-[var(--ink)] relative group hover:bg-[var(--surface)] -mx-2 px-2 transition-colors">
      <div aria-hidden className="absolute top-0 left-0 w-1 h-full bg-[var(--red)] opacity-60 group-hover:opacity-100 transition-opacity" />
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] mb-0.5">{label}</p>
      <p className="font-display text-3xl tracking-[-0.04em] leading-none">{formatted}</p>
      {trend && (
        <p className={cn('text-xs mt-1', trend.value > 0 ? 'text-[var(--red)]' : 'text-[var(--park)]')}>
          {trend.value > 0 ? '+' : ''}{trend.value}% yr
        </p>
      )}
      {source && (
        <p className="text-[10px] text-[var(--muted)] mt-2">
          {source}{sourceDate ? ` · ${sourceDate}` : ''}
        </p>
      )}
    </div>
  );
}
