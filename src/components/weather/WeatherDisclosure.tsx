'use client';

import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '@/i18n/hook';

/** A compact, keyboard-native disclosure for optional weather detail. */
export function WeatherDisclosure({
  label,
  children,
  className = '',
  contentClassName = '',
}: {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const { t } = useI18n();

  return (
    <details data-weather-disclosure className={`wx-disclosure ${className}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[var(--radius-md)] px-3 py-2.5 font-heading text-sm font-bold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]">
        <span className="min-w-0">{label}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
          <span className="wx-disclosure-more">{t('common.showMore')}</span>
          <span className="wx-disclosure-less">{t('common.showLess')}</span>
          <ChevronDown className="wx-disclosure-chevron h-4 w-4 transition-transform" aria-hidden="true" />
        </span>
      </summary>
      <div className={`wx-disclosure-content ${contentClassName}`}>{children}</div>
    </details>
  );
}
