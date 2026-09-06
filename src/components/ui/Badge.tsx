'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import type { TranslationKey } from '@/i18n/en';

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

/**
 * The label is a translation key, not a string. A status badge in Kreyòl has to be
 * readable by the person deciding whether to apply, and English text inside a
 * translated page is the leak that makes a multilingual site untrustworthy.
 */
const statusConfig: Record<StatusBadgeProps['status'], { key: TranslationKey; variant: BadgeVariant }> = {
  available: { key: 'status.available', variant: 'green' },
  waitlist_open: { key: 'status.waitlistOpen', variant: 'amber' },
  waitlist_closed: { key: 'status.waitlistClosed', variant: 'red' },
  in_review: { key: 'status.inReview', variant: 'blue' },
  under_construction: { key: 'status.underConstruction', variant: 'amber' },
  complete: { key: 'status.complete', variant: 'green' },
  planning: { key: 'status.planning', variant: 'default' },
  approved: { key: 'status.approved', variant: 'blue' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useI18n();
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={className}>
      {t(config.key)}
    </Badge>
  );
}
