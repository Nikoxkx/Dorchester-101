'use client';

import { HOTLINES } from '@/data/programs';
import { telHref } from '@/lib/utils';
import { PhoneIcon } from '@/components/ui/icons';

export function EmergencyBanner() {
  const featured = HOTLINES[0];
  const rest = HOTLINES.slice(1);

  return (
    <section aria-label="Emergency hotlines" className="desk-panel-ink">
      <div className="signal-stripe" aria-hidden="true" />
      <div className="p-5 md:p-7 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-mono font-medium uppercase tracking-[0.22em] text-[var(--paper)]/65 mb-2.5">
            <PhoneIcon className="w-3.5 h-3.5" /> Free · 24 hours · every language
          </p>
          <h2 className="font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-bold uppercase leading-[0.95] tracking-[0.01em] text-[var(--paper)]">
            Need help <span className="text-[var(--yellow)]">now?</span>
          </h2>
          <p className="text-sm text-[var(--paper)]/75 mt-2 max-w-xl">
            Call a hotline first. The person on the other end finds food, shelter, and
            legal help with you — and interpreters are available.
          </p>
        </div>
        <a
          href={telHref(featured.phone)}
          className="inline-flex items-baseline gap-3 bg-[var(--yellow)] text-[#111a2c] px-5 py-3.5 hover:bg-white transition-colors w-fit"
        >
          <span>
            <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.16em] opacity-70">{featured.name}</span>
            <span className="stat-num text-[1.9rem] md:text-[2.2rem]">{featured.phone}</span>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide opacity-75 leading-tight">24/7<br />press to call</span>
        </a>
      </div>
      <ul className="border-t border-[var(--paper)]/15 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--paper)]/15">
        {rest.map((h) => (
          <li key={h.id}>
            <a
              href={telHref(h.phone)}
              className="group block px-5 py-4 hover:bg-[var(--paper)]/8 transition-colors"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--paper)]/60">{h.name}</p>
              <p className="stat-num text-[1.4rem] text-[var(--paper)] mt-1 group-hover:text-[var(--yellow)] transition-colors">
                {h.phone}
              </p>
              <p className="text-[11.5px] text-[var(--paper)]/65 mt-0.5">{h.hours} — {h.blurb}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
