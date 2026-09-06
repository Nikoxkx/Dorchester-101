'use client';

import Link from 'next/link';
import {
  ArrowUpRight, BuildingIcon, CalculatorIcon, ExternalIcon, FoodIcon, GlobeIcon, HomeIcon,
  MapIcon, PhoneIcon, RailIcon, ScalesIcon,
} from '@/components/ui/icons';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function QuickLinks() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const links = [
    { href: '/affordable-housing', label: t('quick.applyHousing'), icon: BuildingIcon, hint: 'AMI bands · waitlists · how to apply', external: false },
    { href: '/food', label: t('quick.findFood'), icon: FoodIcon, hint: 'Pantries · hot meals · SNAP', external: false },
    { href: '/map', label: t('nav.map'), icon: MapIcon, hint: 'Pin the nearest pantry or clinic', external: false },
    { href: '/neighborhood', label: t('quick.knowRights'), icon: ScalesIcon, hint: 'Eviction · heat · deposits · housing court', external: false },
    { href: '/tools', label: t('quick.rentCalc'), icon: CalculatorIcon, hint: 'What rent can you actually afford', external: false },
    { href: 'https://www.mbta.com/schedules', label: t('quick.mbtaStatus'), icon: RailIcon, hint: 'Live schedules & alerts', external: true },
    { href: 'https://boston.myhousing.com', label: t('quick.bhaWaitlist'), icon: HomeIcon, hint: 'BHA waitlist applications', external: true },
    { href: '/resources', label: t('quick.legalHelp'), icon: PhoneIcon, hint: 'GBLS · City Life · ABCD · hotlines', external: false },
  ];

  return (
    <section aria-labelledby="quick-title">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 id="quick-title" className="font-display text-[1.65rem] md:text-[2rem] font-bold uppercase tracking-[0.01em]">
          {t('dashboard.quickAccess')}
        </h2>
        <span className="masthead-date">Direct to the agency — no middlemen</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link, i) => {
          const Icon = link.icon;
          const num = String(i + 1).padStart(2, '0');
          const inner = (
            <>
              <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--blue)] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
              <span className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] text-[var(--muted)]">{num}</span>
                <Icon className="w-[18px] h-[18px] text-[var(--ink-soft)] group-hover:text-[var(--blue)] transition-colors" strokeWidth={1.7} />
              </span>
              <span className="mt-2.5 block">
                <span className="flex items-center gap-1.5 font-display font-bold uppercase tracking-[0.05em] text-[15px] leading-tight text-[var(--charcoal)] group-hover:text-[var(--blue)] transition-colors">
                  {link.label}
                  {(link.external ? <ExternalIcon className="w-3 h-3 shrink-0 opacity-60" /> : <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />)}
                </span>
                <span className="block text-[11.5px] text-[var(--muted)] mt-1 leading-snug">{link.hint}</span>
              </span>
            </>
          );
          const cls = 'group relative flex flex-col p-4 border-b border-r border-[var(--line)] bg-[var(--paper)] card-hover h-full';
          return link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
          ) : (
            <Link key={link.href} href={link.href} className={cls}>{inner}</Link>
          );
        })}
      </div>
      <p className="text-[11.5px] text-[var(--muted)] mt-3 inline-flex items-center gap-1.5">
        <GlobeIcon className="w-3.5 h-3.5" /> Outbound links go straight to the agency or program that runs the service.
      </p>
    </section>
  );
}
