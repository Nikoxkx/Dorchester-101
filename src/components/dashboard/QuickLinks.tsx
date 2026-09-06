'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Apple, Building2, Calculator, ExternalLink, Scale, TrainFront, Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import type { TranslationKey } from '@/i18n/en';

/**
 * The six things people actually arrive for.
 *
 * Colour here means something: each tile carries the same hue the directory uses
 * for that category, so the grid and the rest of the site teach one association
 * rather than eight decorative ones. Off-site destinations say so before the
 * tap, which matters when the reader is on metered mobile data at a shelter.
 */
interface QuickLink {
  href: string;
  icon: typeof Apple;
  labelKey: TranslationKey;
  /** Maps to a category colour in globals.css instead of a one-off hex. */
  tone: 'housing' | 'food' | 'legal' | 'transit' | 'tools' | 'settings';
  external?: boolean;
}

const LINKS: QuickLink[] = [
  { href: '/affordable-housing', icon: Building2, labelKey: 'quick.applyHousing', tone: 'housing' },
  { href: '/food', icon: Apple, labelKey: 'quick.findFood', tone: 'food' },
  { href: '/resources?category=legal', icon: Scale, labelKey: 'quick.knowRights', tone: 'legal' },
  { href: 'https://www.mbta.com/schedules', icon: TrainFront, labelKey: 'quick.mbtaStatus', tone: 'transit', external: true },
  { href: '/tools#rent-burden', icon: Calculator, labelKey: 'quick.rentCalc', tone: 'tools' },
  { href: '/settings#language', icon: Globe2, labelKey: 'quick.langSettings', tone: 'settings' },
];

const TONE_CLASS: Record<QuickLink['tone'], string> = {
  housing: 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10',
  food: 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]/12',
  legal: 'text-[var(--color-accent-amber)] bg-[var(--color-accent-amber)]/12',
  transit: 'text-[var(--mbta-red)] bg-[var(--mbta-red)]/10',
  tools: 'text-[var(--color-accent-secondary)] bg-[var(--color-accent-secondary)]/10',
  settings: 'text-[var(--color-text-secondary)] bg-[var(--color-bg-tertiary)]',
};

export function QuickLinks() {
  const { t } = useI18n();

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {LINKS.map((link, index) => {
        const Icon = link.icon;
        const label = t(link.labelKey);
        return (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04, ease: [0.16, 0.84, 0.44, 1] }}
          >
            <Link
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className={cn(
                'group flex h-full flex-col items-start gap-2 rounded-[var(--radius-lg)]',
                'border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-3',
                'transition-[border-color,box-shadow,transform] duration-200',
                'hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2'
              )}
              aria-label={link.external ? `${label} — MBTA.com` : label}
            >
              <span className={cn('inline-flex rounded-[var(--radius-md)] p-2', TONE_CLASS[link.tone])}>
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-heading font-medium leading-tight text-[var(--color-text-primary)]">{label}</span>
              {link.external && (
                <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-heading text-[var(--color-text-muted)]">
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  mbta.com
                </span>
              )}
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
