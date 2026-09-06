'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HomeIcon, HousingIcon, FoodIcon, MapIcon, MoreIcon } from '@/components/ui/icons';

const items = [
  { href: '/', icon: HomeIcon, label: 'Home' },
  { href: '/affordable-housing', icon: HousingIcon, label: 'Housing' },
  { href: '/food', icon: FoodIcon, label: 'Food' },
  { href: '/map', icon: MapIcon, label: 'Map' },
];

export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--paper)]/95 backdrop-blur border-t border-[var(--line)] grid grid-cols-5"
      aria-label="Primary"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]',
              'font-display font-semibold uppercase tracking-[0.08em]',
              active ? 'text-[var(--blue)]' : 'text-[var(--muted)]',
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.2 : 1.7} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-display font-semibold uppercase tracking-[0.08em] text-[var(--muted)]"
      >
        <MoreIcon className="w-5 h-5" />
        More
      </button>
    </nav>
  );
}
