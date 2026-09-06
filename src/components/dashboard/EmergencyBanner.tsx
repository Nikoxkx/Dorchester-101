'use client';

import { HOTLINES } from '@/data/programs';
import { telHref } from '@/lib/utils';
import { PhoneCall } from 'lucide-react';

export function EmergencyBanner() {
  const featured = HOTLINES[0];
  const rest = HOTLINES.slice(1);

  return (
    <section
      className="relative overflow-hidden bg-[var(--red)] text-white rounded-2xl shadow-[0_14px_36px_rgba(215,38,30,0.25)]"
      aria-label="Emergency hotlines"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] pointer-events-none select-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'5\'/%3E%3C/filter%3E%3Crect width=\'200\' height=\'200\' fill=\'%23fff\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      <div className="relative z-10 p-5 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-[0.2em] text-white/75 mb-2">
              <PhoneCall className="w-3.5 h-3.5" /> Emergency — free, 24 hours, any language
            </p>
            <h2 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-black leading-none tracking-[-0.02em]">
              Need help <span className="text-[#FFC94D]">today</span>?
            </h2>
            <p className="text-sm text-white/85 mt-2 max-w-xl">
              Call these hotlines first. They speak your language and connect you to food, housing, and legal help immediately.
            </p>
          </div>
          <a
            href={telHref(featured.phone)}
            className="shrink-0 inline-flex flex-col items-start bg-white text-[var(--red)] rounded-xl px-5 py-3.5 hover:bg-[var(--wax)] transition-colors w-fit"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">{featured.name}</span>
            <span className="font-display text-2xl md:text-3xl font-black leading-tight tracking-tight">{featured.phone}</span>
            <span className="text-[11px] opacity-75 mt-0.5">{featured.hours} · {featured.blurb}</span>
          </a>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {rest.map((h) => (
            <a
              key={h.id}
              href={telHref(h.phone)}
              className="group border border-white/25 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-80">{h.name}</p>
              <p className="font-display text-xl font-extrabold leading-tight mt-0.5 group-hover:underline underline-offset-4 decoration-2">
                {h.phone}
              </p>
              <p className="text-xs opacity-90 mt-1">{h.hours} — {h.blurb}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
