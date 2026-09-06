'use client';

import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-12 pt-6 border-t-2 border-[var(--ink)] text-sm text-[var(--muted)]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="font-display text-[var(--ink)] text-lg">DOR101</p>
          <p>Dorchester desk — housing, food, transit, rights. No account. No tracking.</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="underline underline-offset-2">Privacy</Link>
          <Link href="/terms" className="underline underline-offset-2">Terms</Link>
          <Link href="/resources" className="underline underline-offset-2">Directory</Link>
          <Link href="/faq" className="underline underline-offset-2">Questions</Link>
          <a href="https://github.com/Nikoxkx/Dorchester-101" className="underline underline-offset-2" target="_blank" rel="noreferrer">Source</a>
        </nav>
      </div>
      <p className="mt-4 text-xs">
        Always confirm waitlists, hours, and eligibility with the agency. We cite sources; they can change overnight.
      </p>
    </footer>
  );
}
