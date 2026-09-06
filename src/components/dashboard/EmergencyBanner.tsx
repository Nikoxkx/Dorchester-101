'use client';

import { HOTLINES } from '@/data/programs';
import { telHref } from '@/lib/utils';

export function EmergencyBanner() {
  const featured = HOTLINES[0];
  const rest = HOTLINES.slice(1);

  return (
    <section className="relative overflow-hidden bg-[var(--red)] text-[var(--paper)] -mx-4 md:-mx-7 px-4 md:px-7 py-6 border-y-4 border-[var(--ink)]" aria-label="Emergency hotlines">
      {/* Raw paper texture overlay — original, not stock */}
      <div aria-hidden className="absolute inset-0 opacity-[0.1] pointer-events-none select-none" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'5\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' fill=\'%23fff\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '200px 200px'
      }} />

      <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2">Emergency — 24 hours</p>
          <h2 className="font-display text-[clamp(2.5rem,5vw,5rem)] leading-[0.9] tracking-[-0.05em]">Need help<br /><span className="italic">today</span></h2>
        </div>
        <a
          href={telHref(featured.phone)}
          className="shrink-0 bg-[var(--bone)] text-[var(--rust-dark)] px-6 py-4 font-bold text-base hover:bg-white transition-colors inline-block w-fit shadow-soft"
        >
          {featured.name} — {featured.phone}
        </a>
      </div>

      <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rest.map((h) => (
          <a
            key={h.id}
            href={telHref(h.phone)}
            className="group border border-white/30 bg-white/5 hover:bg-white/10 px-3 py-3 transition-colors"
          >
            <p className="font-mono text-[10px] uppercase tracking-wide opacity-70">{h.name}</p>
            <p className="font-display text-xl font-semibold leading-none mt-1 group-hover:underline decoration-2 underline-offset-4">{h.phone}</p>
            <p className="text-xs opacity-90 mt-1">{h.blurb}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
