'use client';

import Link from 'next/link';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function QuickLinks() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const links = [
    { href: '/affordable-housing', label: t('quick.applyHousing') },
    { href: '/food', label: t('quick.findFood') },
    { href: '/neighborhood', label: t('quick.knowRights') },
    { href: 'https://www.mbta.com/schedules', label: t('quick.mbtaStatus'), external: true },
    { href: '/tools', label: t('quick.rentCalc') },
    { href: 'https://boston.myhousing.com', label: t('quick.bhaWaitlist'), external: true },
    { href: '/resources', label: t('quick.legalHelp') },
    { href: '/settings', label: t('quick.langSettings') },
  ];

  return (
    <ol className="columns-1 sm:columns-2 gap-x-8 text-sm">
      {links.map((link, i) => {
        const className = 'flex items-baseline gap-2 py-1.5 border-b border-[var(--line)] break-inside-avoid';
        const inner = (
          <>
            <span className="font-mono text-[11px] text-[var(--red)] w-5">{String(i + 1).padStart(2, '0')}</span>
            <span className="underline underline-offset-2 decoration-[var(--red)]/40">{link.label}</span>
          </>
        );
        return (
          <li key={link.href}>
            {link.external ? (
              <a href={link.href} target="_blank" rel="noreferrer" className={className}>{inner}</a>
            ) : (
              <Link href={link.href} className={className}>{inner}</Link>
            )}
          </li>
        );
      })}
    </ol>
  );
}
