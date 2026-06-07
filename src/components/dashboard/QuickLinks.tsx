'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Apple, Scale, Train, Calculator, ClipboardList, Gavel, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function QuickLinks() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const links = [
    { href: '/affordable-housing', icon: Home, labelKey: 'quick.applyHousing', color: '#1B3A6B' },
    { href: '/food', icon: Apple, labelKey: 'quick.findFood', color: '#1A6B3A' },
    { href: '/resources?category=legal', icon: Scale, labelKey: 'quick.knowRights', color: '#B8860B' },
    { href: 'https://www.mbta.com/schedules', icon: Train, labelKey: 'quick.mbtaStatus', color: '#C8102E', external: true },
    { href: '/tools#rent-burden', icon: Calculator, labelKey: 'quick.rentCalc', color: '#4A7BC4' },
    { href: 'https://www.bostonhousing.org', icon: ClipboardList, labelKey: 'quick.bhaWaitlist', color: '#6B5B95', external: true },
    { href: '/resources?category=legal', icon: Gavel, labelKey: 'quick.legalHelp', color: '#88B04B' },
    { href: '/settings', icon: Globe, labelKey: 'quick.langSettings', color: '#955251' },
  ];

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const Component = link.external ? 'a' : Link;
        const extraProps = link.external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};
        return (
          <Component
            key={link.href}
            href={link.href}
            {...extraProps}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl',
              'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
              'hover:shadow-md hover:border-[var(--color-accent-primary)]/30',
              'transition-all duration-200 text-center'
            )}
          >
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${link.color}15` }}>
              <Icon className="w-6 h-6" style={{ color: link.color }} />
            </div>
            <span className="text-sm font-heading font-medium">{t(link.labelKey)}</span>
          </Component>
        );
      })}
    </motion.div>
  );
}
