import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { ALL_SECTIONS, PRIMARY_NAV } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      {/* Signal stripe */}
      <div className="signal-stripe" aria-hidden="true" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_0.9fr]">
          <div>
            <Logo size="md" />
            <p className="text-sm text-[var(--ink-soft)] mt-4 max-w-md leading-relaxed">
              A free community directory for Dorchester, Boston: income-restricted housing,
              food programs, rent help, transit, and tenant rights. Real phone numbers, dated
              sources, nine languages.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[13px]">
              {ALL_SECTIONS.filter((s) => s.href === '/privacy' || s.href === '/terms' || s.href === '/faq' || s.href === '/resources')
                .map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--blue)] hover:text-[var(--blue)] transition-colors">
                      {s.navLabel}
                    </Link>
                  </li>
                ))}
              <li>
                <a
                  href="https://github.com/Nikoxkx/Dorchester-101"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--blue)] hover:text-[var(--blue)] transition-colors"
                >
                  Open source
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="kicker mb-4">Need help now</p>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-8 h-8 shrink-0 bg-[var(--blue)] text-white font-display font-bold text-lg flex items-center justify-center">2-1-1</span>
                <span>
                  <a href="tel:211" className="font-display font-bold text-lg block hover:text-[var(--blue)] transition-colors">2-1-1</a>
                  <span className="text-xs text-[var(--muted)]">Mass 211 — 24/7, every language</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 w-8 h-8 shrink-0 bg-[var(--charcoal)] text-[var(--paper)] font-display font-bold text-lg flex items-center justify-center">PB</span>
                <span>
                  <a href="tel:18006458333" className="font-display font-bold text-lg block hover:text-[var(--blue)] transition-colors">1-800-645-8333</a>
                  <span className="text-xs text-[var(--muted)]">Project Bread FoodSource — Mon–Fri 8a–5p</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <p className="kicker mb-4">Browse the directory</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {PRIMARY_NAV.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="underline underline-offset-4 decoration-[var(--line)] hover:decoration-[var(--blue)] hover:text-[var(--blue)] transition-colors">
                    {s.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-5 border-t border-[var(--line)] flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[var(--muted)]">
          <p>© 2026 DOR101 Community Project · Dorchester, Boston, Massachusetts</p>
          <p>Waitlists, hours, and eligibility change — confirm with the agency before you act.</p>
        </div>
      </div>
    </footer>
  );
}
