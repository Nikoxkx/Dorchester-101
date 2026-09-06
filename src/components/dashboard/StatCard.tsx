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
    <div className="py-3 border-t border-[var(--line)]">
      <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="font-display text-2xl mt-0.5 capitalize">{formatted}</p>
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
