import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';

export function CollegePathwayCard() {
  return (
    <article className="relative overflow-hidden bg-[var(--charcoal)] text-[var(--bone)] p-8 md:p-10 border border-[var(--line)]">
      <div aria-hidden className="absolute top-0 right-0 w-48 h-48 opacity-[0.08] pointer-events-none translate-x-10 -translate-y-10">
        <svg viewBox="0 0 200 200" className="w-full h-full"><circle cx="100" cy="100" r="80" fill="none" stroke="var(--bone)" strokeWidth="1" /><circle cx="100" cy="100" r="55" fill="none" stroke="var(--bone)" strokeWidth="1" /></svg>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ochre)] mb-3">College Access · Updated 6 Sept 2026</p>
      <h3 className="font-display text-3xl md:text-4xl tracking-[-0.05em] leading-none mb-3">Dorchester to<br /><span className="italic text-[var(--rust)]">Princeton</span></h3>
      <p className="font-body text-[var(--bone)]/90 max-w-xl leading-relaxed mb-5">Verified resources for first-generation students. Real legal help. Direct links to CSNDC, BPS Counseling, Greater Boston Legal Services, UMass Boston, and Princeton Bridge Year.</p>
      <div className="flex items-center gap-4">
        <Link href="/college-access" className="inline-flex items-center gap-2 bg-[var(--rust)] text-white px-5 py-3 font-bold text-sm hover:bg-[var(--rust-dark)] transition-colors shadow-soft">
          Explore pathway <ArrowUpRight className="w-4 h-4" />
        </Link>
        <Link href="/api/report" className="inline-flex items-center gap-2 border border-[var(--bone)] text-[var(--bone)] px-5 py-3 font-bold text-sm hover:bg-[var(--bone)] hover:text-[var(--charcoal)] transition-colors">
          <BookOpen className="w-4 h-4" /> Report engine
        </Link>
      </div>
    </article>
  );
}
