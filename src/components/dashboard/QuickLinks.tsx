'use client';

import Link from 'next/link';
import {
  FileSignature, Apple, Scale, TrainFront, Calculator, ListPlus, Landmark, Languages,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

/**
 * QuickLinks — the actions a returning resident actually repeats.
 * Flat content layer; distinct icons; every link goes somewhere real.
 */
export function QuickLinks() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const links = [
    { href: '/affordable-housing', icon: FileSignature, label: t('quick.applyHousing') },
    { href: '/food', icon: Apple, label: t('quick.findFood') },
    { href: '/neighborhood', icon: Scale, label: t('quick.knowRights') },
    { href: '/map', icon: TrainFront, label: t('quick.mbtaStatus') },
    { href: '/tools', icon: Calculator, label: t('quick.rentCalc') },
    { href: '/affordable-housing#waitlists', icon: ListPlus, label: t('quick.bhaWaitlist') },
    { href: '/resources?category=legal', icon: Landmark, label: t('quick.legalHelp') },
    { href: '/settings', icon: Languages, label: t('quick.langSettings') },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {links.map(({ href, icon: Icon, label }) => (
        <Link
          key={href + label}
          href={href}
          className="content-card squircle group flex flex-col gap-2.5 p-4 transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          <span className="w-9 h-9 rounded-full grid place-items-center bg-[var(--surface-2)] group-hover:bg-canvas transition-colors">
            <Icon className="w-4.5 h-4.5 text-1" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-footnote font-semibold text-1 leading-snug">{label}</span>
        </Link>
      ))}
    </div>
  );
}
