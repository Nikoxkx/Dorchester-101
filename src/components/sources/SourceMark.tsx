'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { SOURCES, type SourceId } from '@/data/sources';
import { cn } from '@/lib/utils';

/**
 * Publisher badge.
 *
 * Prefers a real logo at `/sources/<id>.svg` when an operator has installed one
 * under a licence that allows it, and otherwise draws a monogram in the
 * publisher's public brand colour. Either way the badge is a link to the
 * publisher, because a source you cannot click is a claim, not a citation.
 */
export function SourceMark({
  id,
  size = 'md',
  withName = false,
  className,
  href,
  asSpan = false,
}: {
  id: SourceId;
  /** Render as a <span> when the badge already sits inside a link. */
  asSpan?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  withName?: boolean;
  className?: string;
  /** Deep link to the exact table or page; falls back to the publisher home. */
  href?: string;
}) {
  const source = SOURCES[id];
  const [logoFailed, setLogoFailed] = useState(false);
  const px = { xs: 18, sm: 24, md: 32, lg: 44 }[size];
  const fontPx = Math.max(8, Math.round(px * (source.short.length > 3 ? 0.28 : source.short.length > 2 ? 0.36 : 0.46)));
  const external = !(href ?? source.url).startsWith('/');

  const badge = logoFailed ? (
    <span
      className="grid shrink-0 place-items-center rounded-[26%] font-heading font-extrabold uppercase leading-none tracking-tight shadow-[var(--shadow-sm)] ring-1 ring-black/10"
      style={{ width: px, height: px, background: source.color, color: source.ink ?? '#FFFFFF', fontSize: fontPx }}
      aria-hidden="true"
    >
      {source.short}
    </span>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/sources/${source.id}.svg`}
      alt=""
      width={px}
      height={px}
      className="shrink-0 rounded-[26%] bg-white object-contain p-0.5 ring-1 ring-black/10"
      onError={() => setLogoFailed(true)}
    />
  );

  const inner = (
    <>
      {badge}
      {withName && (
        <span className="inline-flex min-w-0 items-center gap-1 font-heading text-xs font-semibold text-[var(--color-text-secondary)]">
          <span className="truncate">{source.name}</span>
          {external && !asSpan && <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />}
        </span>
      )}
      <span className="sr-only">{source.name}</span>
    </>
  );
  const cls = cn('inline-flex items-center gap-2 rounded-lg align-middle no-underline hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]', className);
  if (asSpan) {
    return (
      <span title={`${source.name} — ${source.provides}`} className={cls}>
        {inner}
      </span>
    );
  }
  return (
    <a
      href={href ?? source.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      title={`${source.name} — ${source.provides}`}
      className={cls}
    >
      {inner}
    </a>
  );
}

/**
 * Inline citation: “Source: <badge> Name · as of <date>”. Used under every
 * figure, chart and photograph.
 */
export function Cite({
  id,
  asOf,
  note,
  href,
  className,
}: {
  id: SourceId;
  asOf?: string;
  note?: string;
  href?: string;
  className?: string;
}) {
  const source = SOURCES[id];
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-snug text-[var(--color-text-muted)]', className)}>
      <span className="font-heading font-semibold">Source</span>
      <SourceMark id={id} size="xs" withName href={href} />
      {asOf && <span>· as of {asOf}</span>}
      {note && <span>· {note}</span>}
      {source.licence && <span className="opacity-80">· {source.licence}</span>}
    </p>
  );
}
