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
    { href: '/college-access', label: 'College Access — Princeton Pathway', new: true },
    { href: '/settings', label: t('quick.langSettings') },
  ];

  return (
    <div className="relative">
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="font-display text-xl tracking-[-0.03em]">Quick access</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--red)]">Updated 6 Sept 2026</span>
      </div>
      <ol className="columns-1 sm:columns-2 gap-x-8 text-sm">
        {links.map((link, i) => {
          const className = 'flex items-baseline gap-2 py-2 border-b border-[var(--line)] break-inside-avoid hover:bg-[var(--surface)] -mx-2 px-2 transition-colors';
          const inner = (
            <>
              <span className="font-mono text-[11px] text-[var(--red)] w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
              <span className="underline underline-offset-2 decoration-[var(--red)]/40 hover:text-[var(--red)] transition-colors">{link.label}</span>
              {link.new && <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--red)] border border-[var(--red)] px-1 py-0.5 shrink-0 ml-1">New</span>}
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
    </div>
  );
}
