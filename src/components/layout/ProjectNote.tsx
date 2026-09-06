'use client';

import Link from 'next/link';
import { Bug, GitFork, HeartHandshake, ShieldCheck } from 'lucide-react';
import { ReportProblem } from '@/components/a11y/ReportProblem';
import { REPO_URL } from '@/lib/site';
import { SourceMark } from '@/components/sources/SourceMark';
import type { SourceId } from '@/data/sources';
import { cn } from '@/lib/utils';

/**
 * The paragraph every section ends with: what this page draws on, that the
 * project is open source, and where to go when something is wrong. Rendered by
 * pages rather than the layout so each one can name its own sources.
 */
export function ProjectNote({
  sources,
  children,
  className,
}: {
  /** Publishers this page cites; shown as badges so a reader can jump to them. */
  sources?: SourceId[];
  /** Page-specific sentence about the data (what is live, what is hand-checked). */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label="About this information"
      className={cn(
        'dor101-glass rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4 text-sm leading-relaxed text-[var(--color-text-secondary)]',
        className
      )}
    >
      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-[var(--color-text-primary)]">
            <ShieldCheck className="h-4 w-4 text-[var(--color-accent-green)]" aria-hidden="true" />
            Where this comes from
          </h2>
          {children && <p className="mt-1.5">{children}</p>}
          {sources && sources.length > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-2">
              {sources.map((id) => (
                <li key={id}>
                  <SourceMark id={id} size="sm" withName />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-bg-primary)]/70 p-3">
          <h3 className="flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            <HeartHandshake className="h-3.5 w-3.5" aria-hidden="true" />
            Open source, kept by residents
          </h3>
          <p className="mt-1.5 text-xs">
            DOR101 is a volunteer project. The code, the listing data and every correction are public. Nobody pays to be listed and nothing here is sponsored.
          </p>
          <ul className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
            <li>
              <ReportProblem triggerClass="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]" />
            </li>
            <li>
              <a
                href={`${REPO_URL}/issues`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
              >
                <Bug className="h-3.5 w-3.5" aria-hidden="true" /> Issue tracker
              </a>
            </li>
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 font-heading text-xs font-bold transition-colors hover:border-[var(--color-accent-primary)]"
              >
                <GitFork className="h-3.5 w-3.5" aria-hidden="true" /> Source code
              </a>
            </li>
            <li>
              <Link href="/about" className="font-heading text-xs font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
                About the project
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
