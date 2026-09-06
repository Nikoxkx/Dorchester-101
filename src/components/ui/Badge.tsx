'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'amber' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'text-[var(--ink-soft)] border-[var(--line)]',
  green: 'text-[var(--park)] border-[var(--park)]',
  amber: 'text-[var(--gold)] border-[var(--gold)]',
  red: 'text-[var(--red)] border-[var(--red)]',
  blue: 'text-[var(--harbor)] border-[var(--harbor)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantStyles[variant], className)}>
      {children}
    </span>
  );
}

export function AMIBadge({ percentage, className }: { percentage: number; className?: string }) {
  const band = percentage <= 30 ? 30 : percentage <= 50 ? 50 : percentage <= 60 ? 60 : percentage <= 80 ? 80 : 100;
  const cls =
    band <= 30 ? 'ami-30' :
    band <= 50 ? 'ami-50' :
    band <= 60 ? 'ami-60' :
    band <= 80 ? 'ami-80' : 'ami-market';

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase', cls, className)}>
      {band}% AMI
    </span>
  );
}

interface StatusBadgeProps {
  status: 'available' | 'waitlist_open' | 'waitlist_closed' | 'in_review' | 'under_construction' | 'complete' | 'planning' | 'approved' | 'lottery' | 'check_source' | 'closed' | 'open' | 'open_priority_one';
  className?: string;
}

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Openings', variant: 'green' },
  waitlist_open: { label: 'Waitlist open', variant: 'amber' },
  waitlist_closed: { label: 'Waitlist closed', variant: 'red' },
  in_review: { label: 'In review', variant: 'blue' },
  under_construction: { label: 'Under construction', variant: 'amber' },
  complete: { label: 'Built', variant: 'green' },
  planning: { label: 'Planning', variant: 'default' },
  approved: { label: 'Approved', variant: 'blue' },
  lottery: { label: 'Lottery', variant: 'amber' },
  check_source: { label: 'Check source', variant: 'default' },
  closed: { label: 'Closed', variant: 'red' },
  open: { label: 'Open', variant: 'green' },
  open_priority_one: { label: 'Priority One', variant: 'amber' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
