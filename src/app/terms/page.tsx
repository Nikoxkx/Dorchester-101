import { MainLayout } from '@/components/layout/MainLayout';

export const metadata = { title: 'Terms — DORCHESTER 101' };

export default function TermsPage() {
  return (
    <MainLayout>
      <article className="max-w-2xl space-y-4 text-sm leading-relaxed">
        <header className="pb-6 border-b border-[var(--line)]">
          <p className="kicker mb-3">Legal</p>
          <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-black leading-none text-[var(--charcoal)]">Terms</h1>
          <p className="text-[var(--muted)] mt-3">Last written September 2026.</p>
        </header>
        <p>
          This site is a public-information desk for Dorchester. It is not a city office, a housing
          authority, a law firm, or a newsroom of record — it is neighbors keeping the numbers straight.
        </p>
        <h2 className="font-display text-2xl pt-2">No legal advice</h2>
        <p>
          Eligibility numbers, waitlist status, and tenant-rights summaries are compiled from published sources. Always confirm with BHA, EOHLC, Mass Legal Help, or an attorney before you act.
        </p>
        <h2 className="font-display text-2xl pt-2">Figures move</h2>
        <p>
          HUD income limits, MBTA fares, SNAP allotments, and market rents change. We date the sources we used. If a number looks wrong, follow the source link on the page.
        </p>
        <h2 className="font-display text-2xl pt-2">External links</h2>
        <p>
          Links to boston.gov, mbta.com, bostonhousing.org, and newsrooms are provided as a convenience. Those sites have their own terms.
        </p>
        <h2 className="font-display text-2xl pt-2">Use</h2>
        <p>
          You may read, share, and fork the desk. Do not scrape it in a way that knocks over the MBTA or city endpoints we proxy.
        </p>
      </article>
    </MainLayout>
  );
}
