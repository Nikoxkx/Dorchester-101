'use client';

import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'green' | 'amber' | 'red' | 'blue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  green: 'bg-[var(--color-accent-green)]/15 text-[var(--color-accent-green)]',
  amber: 'bg-[var(--color-accent-amber)]/15 text-[var(--color-accent-amber)]',
  red: 'bg-[var(--color-accent-secondary)]/15 text-[var(--color-accent-secondary)]',
  blue: 'bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-heading font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface AMIBadgeProps {
  percentage: number;
  className?: string;
}

export function AMIBadge({ percentage, className }: AMIBadgeProps) {
  let bgColor = 'bg-gray-400';
  let textColor = 'text-gray-900';
  
  if (percentage <= 30) {
    bgColor = 'bg-[#1B3A6B]';
    textColor = 'text-white';
  } else if (percentage <= 50) {
    bgColor = 'bg-[#2E5A99]';
    textColor = 'text-white';
  } else if (percentage <= 60) {
    bgColor = 'bg-[#4A7BC4]';
    textColor = 'text-white';
  } else if (percentage <= 80) {
    bgColor = 'bg-[#7BA3E0]';
    textColor = 'text-gray-900';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        'text-xs font-heading font-medium',
        bgColor,
        textColor,
        className
      )}
    >
      {percentage}% AMI
    </span>
  );
}

interface StatusBadgeProps {
  status: 'available' | 'waitlist_open' | 'waitlist_closed' | 'in_review' | 'under_construction' | 'complete' | 'planning' | 'approved';
  className?: string;
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; variant: BadgeVariant }> = {
  available: { label: 'Available', variant: 'green' },
  waitlist_open: { label: 'Waitlist Open', variant: 'amber' },
  waitlist_closed: { label: 'Waitlist Closed', variant: 'red' },
  in_review: { label: 'In Review', variant: 'blue' },
  under_construction: { label: 'Under Construction', variant: 'amber' },
  complete: { label: 'Complete', variant: 'green' },
  planning: { label: 'Planning', variant: 'default' },
  approved: { label: 'Approved', variant: 'blue' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
