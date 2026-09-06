'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, DollarSign, Apple, Map, Ellipsis } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { springNav } from '@/lib/motion';

const items: { href: string; icon: typeof Home; labelKey: TranslationKey }[] = [
  { href: '/', icon: Home, labelKey: 'nav.dashboard' },
  { href: '/affordable-housing', icon: DollarSign, labelKey: 'nav.affordableShort' },
  { href: '/food', icon: Apple, labelKey: 'nav.food' },
  { href: '/map', icon: Map, labelKey: 'nav.map' },
];

/**
 * BottomNav — mobile glass tab bar. Shrinks on scroll down, expands on
 * scroll up; the fifth slot opens the full drawer. Safe-area aware.
 */
export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();
  const direction = useScrollDirection();

  const condensed = direction === 'down';

  return (
    <motion.nav
      aria-label="Primary"
      className="glass glass-regular glass-edge bottom-nav fixed bottom-0 inset-x-0 z-40 md:hidden no-print"
      animate={{ paddingTop: condensed ? 4 : 8, paddingBottom: condensed ? 4 : 8 }}
      initial={false}
      transition={reduce ? { duration: 0 } : springNav}
      style={{ borderRadius: 0 }}
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-1',
                'text-caption2 font-semibold tracking-wide',
                'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current rounded-lg',
                active ? 'text-1' : 'text-text-2',
              )}
            >
              <span className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} aria-hidden />
                {active && (
                  <motion.span
                    layoutId="tab-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ink"
                    transition={reduce ? { duration: 0 } : springNav}
                  />
                )}
              </span>
              {!condensed && <span>{t(item.labelKey)}</span>}
            </Link>
          );
        })}
        <button
          onClick={onMore}
          aria-label={t('nav.more')}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-caption2 font-semibold tracking-wide text-text-2 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-current rounded-lg"
        >
          <Ellipsis className="w-5 h-5" strokeWidth={2} aria-hidden />
          {!condensed && <span>{t('nav.more')}</span>}
        </button>
      </div>
    </motion.nav>
  );
}
