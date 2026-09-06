'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { useReduceMotion } from '@/stores/appStore';
import type { TranslationKey } from '@/i18n/en';

/**
 * One number, its source and its date.
 *
 * Three things this version does that the first one did not:
 *  - the value is read through the active locale, so `1 342` in French and
 *    `1,342` in English come from the same Intl call the rest of the site uses;
 *  - the accent is applied with `color-mix`, because appending `15` to a CSS
 *    custom property (`var(--color-accent-primary)15`) is not a colour and left
 *    the icon chip unpainted;
 *  - a stat with no data says so instead of counting up to zero.
 */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' };
  source?: string;
  /** ISO date string; formatted in the reader's locale, never pasted as English. */
  sourceDate?: string;
  /** Small line under the figure: a denominator, a coverage note. */
  hint?: string;
  /** Suppresses the figure entirely when the upstream source has nothing. */
  unavailable?: boolean;
  accent?: string;
  href?: string;
}

export function StatCard({
  icon,
  label,
  value,
  format = 'number',
  trend,
  source,
  sourceDate,
  hint,
  unavailable = false,
  accent = 'var(--color-accent-primary)',
  href,
}: StatCardProps) {
  const { t, format: locale } = useI18n();
  const reduceMotion = useReduceMotion();
  const [displayValue, setDisplayValue] = useState(unavailable ? 0 : value);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef(false);
  const frameRef = useRef(0);

  useEffect(() => {
    if (unavailable) return;
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }
    if (hasAnimated.current) {
      setDisplayValue(value);
      return;
    }
    const node = cardRef.current;
    if (!node) return;

    // Count-up only once the card is actually on screen: animating a figure nobody
    // has scrolled to yet means the number has already settled by the time it is read.
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        hasAnimated.current = true;
        const duration = 1200;
        const start = performance.now();
        const step = (currentTime: number) => {
          const progress = Math.min((currentTime - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.round(value * eased));
          if (progress < 1) frameRef.current = requestAnimationFrame(step);
        };
        frameRef.current = requestAnimationFrame(step);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, reduceMotion, unavailable]);

  const shown = unavailable
    ? t('error.dataUnavailable')
    : format === 'currency'
      ? locale.currency(displayValue)
      : format === 'percent'
        ? locale.percent(displayValue / 100, 1)
        : locale.number(displayValue);

  const Body = (
    <>
      <div className="mb-3 flex items-start justify-between gap-2">
        <span
          className="grid h-9 w-9 place-items-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}
          aria-hidden="true"
        >
          {icon}
        </span>
        {trend && !unavailable && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-heading text-xs font-semibold',
              trend.direction === 'up' && 'text-[var(--color-accent-green)]',
              trend.direction === 'down' && 'text-[var(--color-accent-secondary)]',
              trend.direction === 'neutral' && 'text-[var(--color-text-muted)]'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" aria-hidden="true" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Minus className="h-3 w-3" aria-hidden="true" />
            )}
            {t(`stats.trend${trend.direction === 'up' ? 'Up' : trend.direction === 'down' ? 'Down' : 'Flat'}` as TranslationKey, {
              value: locale.percent(Math.abs(trend.value) / 100, 1),
            })}
          </span>
        )}
      </div>

      <div className={cn('font-mono text-2xl font-semibold leading-tight', unavailable && 'text-sm font-normal')}>{shown}</div>

      <div className="mt-1 font-heading text-sm text-[var(--color-text-muted)]">{label}</div>
      {hint && <div className="mt-1 text-[11px] leading-snug text-[var(--color-text-muted)]">{hint}</div>}

      {source && (
        <div className="mt-3 border-t border-[var(--color-border)] pt-2.5 text-[11px] text-[var(--color-text-muted)]">
          <span className="font-heading font-semibold">{t('common.source')}</span> {source}
          {sourceDate && (
            <span className="block opacity-80">
              {t('common.updated')} {locale.date(sourceDate, 'medium')}
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
      className={cn(
        'rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4 transition-shadow',
        'hover:shadow-[var(--shadow-md)]',
        href && 'cursor-pointer'
      )}
    >
      {href ? (
        <a href={href} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-primary)]">
          {Body}
        </a>
      ) : (
        Body
      )}
    </motion.div>
  );
}
