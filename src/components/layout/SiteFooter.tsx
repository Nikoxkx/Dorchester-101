import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function SiteFooter() {
  return (
    <footer className="mt-16 pt-10 border-t-2 border-[var(--line)]">
      <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
        <div>
          <Logo size="md" />
          <p className="text-sm text-[var(--ink-soft)] mt-4 max-w-sm leading-relaxed">
            The free neighborhood desk for Dorchester, Boston. Housing, food, transit, tenant
            rights, and the agencies behind them — phone numbers and waitlist statuses you can
            act on today.
          </p>
          <p className="text-xs text-[var(--muted)] mt-4">
            No account. No tracking. No ads. Sources and dates on every page.
          </p>
        </div>

        <div>
          <p className="kicker mb-3">Need help now</p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="tel:211" className="font-display font-bold text-lg block hover:text-[var(--red)] transition-colors">2-1-1</a>
              <span className="text-xs text-[var(--muted)]">Mass 211 — 24/7, any language</span>
            </li>
            <li>
              <a href="tel:18006458333" className="font-display font-bold text-lg block hover:text-[var(--red)] transition-colors">1-800-645-8333</a>
              <span className="text-xs text-[var(--muted)]">Project Bread FoodSource — Mon–Fri 8–5</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="kicker mb-3">The desk</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:grid-cols-1">
            <li><Link href="/privacy" className="underline underline-offset-4 hover:text-[var(--red)]">Privacy</Link></li>
            <li><Link href="/terms" className="underline underline-offset-4 hover:text-[var(--red)]">Terms</Link></li>
            <li><Link href="/resources" className="underline underline-offset-4 hover:text-[var(--red)]">Directory</Link></li>
            <li><Link href="/faq" className="underline underline-offset-4 hover:text-[var(--red)]">Questions</Link></li>
            <li>
              <a href="https://github.com/Nikoxkx/Dorchester-101" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-[var(--red)]">
                Open source
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-5 border-t border-[var(--line)] flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-[var(--muted)]">
        <p>© 2026 DOR101 Community Project · Built for and with the Dot.</p>
        <p>Waitlists, hours, and eligibility change — confirm with the agency before you act.</p>
      </div>
    </footer>
  );
}
