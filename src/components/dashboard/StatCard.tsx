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

  const isPositive = trend && trend.value > 0;
  const tone = trend && trend.value !== 0
    ? (isPositive ? 'text-[var(--red)]' : 'text-[var(--sage)]')
    : 'text-[var(--ink-soft)]';

  return (
    <div className="desk-card p-4 h-full flex flex-col justify-between gap-3 card-hover">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-display font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] shrink-0" aria-hidden />
        </div>
        <p className="font-display text-[2rem] font-black tracking-[-0.02em] text-[var(--charcoal)] leading-none mt-2">
          {formatted}
        </p>
      </div>
      <div className="flex items-end justify-between gap-2">
        {trend ? (
          <span className={cn('text-xs font-bold', tone)}>
            {trend.value > 0 ? '+' : ''}{trend.value}% yr
          </span>
        ) : (
          <span />
        )}
        {(source || sourceDate) && (
          <span className="text-[10px] text-[var(--muted)] text-right leading-tight">
            {source}
            {sourceDate && <span className="block">{sourceDate}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
