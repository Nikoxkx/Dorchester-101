'use client';

import Link from 'next/link';
import { BookOpenText, ClipboardList, FileCheck2, Landmark, ListOrdered, Ticket, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Cite, SourceMark } from '@/components/sources/SourceMark';

/** Always-visible three-sentence orientation above the tabs. */
export function HousingStartHere({ onLearnMore }: { onLearnMore: () => void }) {
  return (
    <section aria-labelledby="start-here" className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4">
      <h2 id="start-here" className="flex items-center gap-2 font-heading text-base font-bold">
        <BookOpenText className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" /> Start here: what “affordable housing” means in Boston
      </h2>
      <div className="mt-2 grid gap-3 text-sm leading-relaxed text-[var(--color-text-secondary)] md:grid-cols-3">
        <p>
          <strong className="text-[var(--color-text-primary)]">It is a rent cap, not a discount.</strong> An income-restricted apartment has a rent fixed by the City or HUD so that a household at a given
          income spends about 30% of it on housing. The building may look like any other; only the lease terms differ.
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">You qualify by income band.</strong> Each unit is tagged 30%, 50%, 60%, 70% or 80% of Area Median Income (AMI). Your household must earn <em>at or
          below</em> that band, and usually above a floor of about 2.5× the rent, when you apply.
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">You get in by lottery or waitlist.</strong> New buildings run a one-time lottery; older ones keep waitlists; public housing and vouchers go through
          the Boston Housing Authority. Applying is free, and no one can charge you to apply.
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <button type="button" onClick={onLearnMore} className="rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading font-bold text-white">
          Step-by-step: how to apply
        </button>
        <Link href="/tools" className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 font-heading font-bold no-underline hover:border-[var(--color-accent-primary)]">
          Find my AMI band
        </Link>
        <span className="ms-auto inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
          Rules from <SourceMark id="bostongov" size="xs" withName /> · <SourceMark id="hud" size="xs" withName />
        </span>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: Users,
    title: 'Work out your household and income',
    body: 'Count everyone who will live in the home. Add up gross (before-tax) income for everyone 18+, including wages, SSI/SSDI, child support, unemployment, and regular gifts. Lotteries use the income you can document today, not last year’s taxes alone.',
    tip: 'Use the AMI calculator on the Tools page — it gives you the band (e.g. “≤ 60% AMI”) that every listing is filtered by.',
  },
  {
    icon: ClipboardList,
    title: 'Gather documents once, reuse them everywhere',
    body: 'Photo ID for each adult; birth certificates or school records for children; 4–6 recent pay stubs or an employer letter; last 2 years of tax returns (or a non-filer statement); 6 months of bank statements; benefit award letters; current lease and landlord contact.',
    tip: 'Scan everything to your phone. Most lotteries now accept uploads, and a missing document is the most common reason an application is rejected.',
  },
  {
    icon: Landmark,
    title: 'Pick the right door',
    body: 'Three systems run in parallel. (1) Boston Housing Authority — public housing and Section 8 vouchers; one application, long waits, priority for homelessness, domestic violence, and displacement. (2) Metrolist / Boston One Stop — the City’s list of income-restricted apartments and lotteries in private buildings. (3) MassAccess / CHAPA — the statewide list, including accessible units.',
    tip: 'Apply to all three. They do not share applications, and being on one list never hurts your place on another.',
  },
  {
    icon: Ticket,
    title: 'Enter every lottery you qualify for',
    body: 'A lottery is a random draw among complete applications received by the deadline — not first-come. Each new building runs one, typically 4–8 weeks long, advertised on Metrolist and in the Dorchester Reporter. Preferences (Boston resident, household with a disability, a household member who works in Boston) move you up.',
    tip: 'Winning a ranking is not a lease. You will be called in rank order for income verification; keep documents current for 6–12 months after the draw.',
  },
  {
    icon: FileCheck2,
    title: 'Verification and lease-up',
    body: 'The management company re-checks income, credit, criminal history (limited by Boston’s Fair Chance rules), and landlord references. Credit problems tied to medical debt or a past eviction must be explained, not automatically disqualifying. Rent is set to the unit’s band, and recertified each year.',
    tip: 'If you are denied, you have the right to a written reason and an appeal. Greater Boston Legal Services and City Life/Vida Urbana help with appeals for free.',
  },
  {
    icon: ListOrdered,
    title: 'Stay on waitlists and update them',
    body: 'Older income-restricted buildings and BHA developments keep waitlists that move as people leave. Most require you to re-confirm interest every 12 months; if you miss the letter you are removed. Tell every list when your address, phone, income or household changes.',
    tip: 'Ask the BHA and each building for your current position in writing once a year. It is your right under the tenant-selection plan.',
  },
];

export function HowToApply() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to apply, step by step</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          This is the process a Boston housing counsellor walks people through. Nothing here costs money. Anyone who asks for a fee to “get you in” is committing fraud — report them to the
          Office of Housing at (617) 635-4200.
        </p>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-xl border border-[var(--color-border)] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]">
                <s.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-heading font-semibold">
                  <span className="me-1.5 font-mono text-xs text-[var(--color-text-muted)]">{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.body}</p>
                <p className="mt-1.5 rounded-lg bg-[var(--color-bg-tertiary)] px-2.5 py-1.5 text-xs leading-snug"><strong>Tip:</strong> {s.tip}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
          <a href="https://www.bostonhousing.org/en/Apply-for-Housing.aspx" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <SourceMark id="bha" size="sm" withName asSpan />
            <p className="mt-1.5 text-[var(--color-text-secondary)]">Public housing &amp; Section 8. One application; (617) 988-4000.</p>
          </a>
          <a href="https://www.boston.gov/metrolist" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <SourceMark id="bostongov" size="sm" withName asSpan />
            <p className="mt-1.5 text-[var(--color-text-secondary)]">Metrolist: every income-restricted listing and lottery in Boston.</p>
          </a>
          <a href="https://www.massaccesshousingregistry.org/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-[var(--color-border)] p-3 no-underline hover:border-[var(--color-accent-primary)]">
            <SourceMark id="massgov" size="sm" withName asSpan />
            <p className="mt-1.5 text-[var(--color-text-secondary)]">MassAccess: statewide registry, including accessible units.</p>
          </a>
        </div>
        <Cite id="bostongov" note="Boston Office of Housing — Income-restricted housing guide and lottery preferences" href="https://www.boston.gov/departments/housing/income-restricted-housing" className="mt-3" />
      </CardContent>
    </Card>
  );
}
