'use client';

import { ExternalLink, Globe } from 'lucide-react';
import { SourceMark } from '@/components/sources/SourceMark';
import { SOURCES, type SourceId } from '@/data/sources';
import { cn } from '@/lib/utils';

/**
 * A "link card" for the page a piece of information came from — publisher badge,
 * page title, domain, one-line description and the date we last read it.
 *
 * It deliberately does not embed the remote page in an iframe or screenshot it:
 * most government sites forbid framing (X-Frame-Options) and a screenshot would
 * go stale silently. A card that states the domain, the date checked and opens
 * the real page is more honest and works offline.
 */
export function SourcePreview({
  title,
  url,
  sourceId,
  description,
  lastChecked,
  secondary,
  className,
}: {
  title: string;
  url: string;
  sourceId: SourceId;
  description?: string;
  lastChecked?: string;
  secondary?: { label: string; url: string; sourceId: SourceId };
  className?: string;
}) {
  const domain = safeDomain(url);
  const src = SOURCES[sourceId];
  return (
    <div className={cn('grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]', className)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-stretch overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] no-underline transition-colors hover:border-[var(--color-accent-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
      >
        <div className="grid w-20 shrink-0 place-items-center border-e border-[var(--color-border)]" style={{ background: `${src.color}14` }}>
          <SourceMark id={sourceId} size="lg" asSpan />
        </div>
        <div className="min-w-0 flex-1 p-3">
          <p className="flex items-center gap-1 text-[10px] font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            <Globe className="h-3 w-3" aria-hidden="true" /> {domain}
          </p>
          <p className="mt-0.5 truncate font-heading text-sm font-semibold text-[var(--color-text-primary)] group-hover:underline">{title}</p>
          {description && <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-text-secondary)]">{description}</p>}
          <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
            {src.name}
            {lastChecked && <> · last read by DOR101 on {lastChecked}</>}
          </p>
        </div>
        <div className="grid shrink-0 place-items-center px-3 text-[var(--color-text-muted)]">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </div>
      </a>
      {secondary && (
        <a
          href={secondary.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-heading font-semibold text-[var(--color-text-secondary)] no-underline transition-colors hover:border-[var(--color-accent-primary)] hover:underline sm:self-stretch"
        >
          <SourceMark id={secondary.sourceId} size="sm" asSpan /> {secondary.label}
        </a>
      )}
    </div>
  );
}

function safeDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
