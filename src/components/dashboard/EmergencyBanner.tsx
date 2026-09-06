'use client';

import { HOTLINES } from '@/data/programs';
import { telHref } from '@/lib/utils';

export function EmergencyBanner() {
  return (
    <section className="hotline-bar bg-[var(--red)] text-white -mx-4 md:-mx-7 px-4 md:px-7 py-4">
      <p className="kicker text-white/80 mb-2">Need help today</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {HOTLINES.map((h) => (
          <a
            key={h.id}
            href={telHref(h.phone)}
            className="block border border-white/40 px-3 py-2 hover:bg-white hover:text-[var(--red-dark)]"
          >
            <p className="text-[11px] uppercase tracking-wide opacity-80">{h.name}</p>
            <p className="font-mono text-lg font-bold">{h.phone}</p>
            <p className="text-xs">{h.blurb}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
