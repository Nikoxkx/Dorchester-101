'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Apple, DollarSign, Home, Map, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/affordable-housing', icon: DollarSign, label: 'Housing' },
  { href: '/food', icon: Apple, label: 'Food' },
  { href: '/map', icon: Map, label: 'Map' },
];

export function BottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--paper)] border-t border-[var(--line)] grid grid-cols-5 backdrop-blur bg-opacity-90"
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
              'flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide',
              active ? 'text-[var(--red)]' : 'text-[var(--muted)]',
            )}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.6 : 2} />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={onMore}
        className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]"
      >
        <MoreHorizontal className="w-5 h-5" />
        More
      </button>
    </nav>
  );
}
