'use client';

import Link from 'next/link';
import { ArrowUpRight, Apple, Building, Calculator, Globe, Home, Languages, Scale, TrainFront } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

export function QuickLinks() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);

  const links = [
    { href: '/affordable-housing', label: t('quick.applyHousing'), icon: Building, hint: 'AMI bands · waitlists · apply' },
    { href: '/food', label: t('quick.findFood'), icon: Apple, hint: 'Pantries · meals · SNAP' },
    { href: '/neighborhood', label: t('quick.knowRights'), icon: Scale, hint: 'Eviction · heat · deposits' },
    { href: 'https://www.mbta.com/schedules', label: t('quick.mbtaStatus'), icon: TrainFront, hint: 'Live schedules', external: true },
    { href: '/tools', label: t('quick.rentCalc'), icon: Calculator, hint: 'Rent burden · AMI' },
    { href: 'https://boston.myhousing.com', label: t('quick.bhaWaitlist'), icon: Home, hint: 'BHA applications', external: true },
    { href: '/resources', label: t('quick.legalHelp'), icon: Scale, hint: 'GBLS · City Life · ABCD' },
    { href: '/settings', label: t('quick.langSettings'), icon: Languages, hint: '9 languages · dark mode' },
  ];

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold">{t('dashboard.quickAccess')}</h2>
        <span className="hidden sm:block text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">Agencies verified {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          const inner = (
            <>
              <span className="w-10 h-10 rounded-lg bg-[var(--wax)] border border-[var(--line)] flex items-center justify-center text-[var(--red)] transition-colors group-hover:bg-[var(--red)] group-hover:text-white group-hover:border-[var(--red)]">
                <Icon className="w-5 h-5" strokeWidth={2.2} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1 font-display font-bold text-sm text-[var(--charcoal)] group-hover:text-[var(--red)] transition-colors">
                  {link.label}
                  {link.external && <ArrowUpRight className="w-3 h-3 shrink-0" />}
                </span>
                <span className="block text-[11px] text-[var(--muted)] mt-0.5 truncate">{link.hint}</span>
              </span>
            </>
          );
          const cls = 'group flex items-start gap-3 p-3.5 desk-card card-hover h-full';
          return link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
          ) : (
            <Link key={link.href} href={link.href} className={cls}>{inner}</Link>
          );
        })}
      </div>
      <p className="text-[11px] text-[var(--muted)] mt-3 inline-flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" /> Every link goes to the agency or program itself — nothing is a referral middleman.
      </p>
    </section>
  );
}
