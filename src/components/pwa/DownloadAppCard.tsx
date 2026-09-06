'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, ExternalLink, Monitor, PackageOpen, RotateCw } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { cn } from '@/lib/utils';
import { APP_VERSION } from '@/lib/site';
import type { DownloadInfo } from '@/app/api/download/route';

/**
 * Download the real Windows desktop app straight from the site.
 *
 * The version, size and URLs come from `/api/download`, which reads GitHub's
 * release API server-side (CSP keeps the browser same-origin) and falls back to
 * the last published release when GitHub is unreachable — so the button works
 * even on a bad connection, and the payload says when it is showing a pinned
 * release rather than the newest one.
 *
 * `variant="hero"` renders one compact inline button for the dashboard hero;
 * `variant="full"` renders the complete card (installer + portable + notes)
 * used on the About page.
 */

function formatMb(bytes: number | null): string | null {
  if (bytes == null) return null;
  return `${Math.round(bytes / 1_000_000)} MB`;
}

export function DownloadAppCard({ variant = 'full', className }: { variant?: 'hero' | 'full'; className?: string }) {
  const { t } = useI18n();
  const [info, setInfo] = useState<DownloadInfo | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  const load = useCallback((options: { silent?: boolean } = {}) => {
    // Silent (initial) runs must not write state synchronously from the effect
    // body; `state` already starts at 'loading', so the first paint is correct.
    if (!options.silent) setState('loading');
    fetch('/api/download', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((payload: DownloadInfo) => {
        setInfo(payload);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, []);

  useEffect(() => {
    // Deferred a tick so no state write happens synchronously in the effect
    // body; `state` already starts at 'loading' so the first paint is honest.
    const kick = window.setTimeout(() => load({ silent: true }), 0);
    return () => window.clearTimeout(kick);
  }, [load]);

  const asset = info?.installer ?? null;

  if (variant === 'hero') {
    return (
      <span className={cn('inline-flex flex-wrap items-center gap-2', className)}>
        <a
          href={asset?.url ?? '/api/download?get=installer'}
          download={asset?.name ?? true}
          className="inline-flex items-center gap-2 rounded-full border border-white/35 px-4 py-2.5 font-heading text-sm font-bold text-white transition-colors hover:bg-white/12"
          aria-label={t('download.app.title')}
        >
          <Monitor className="h-4 w-4" aria-hidden="true" />
          {t('download.app.title')}
          {asset ? (
            <span className="font-mono text-[11px] font-normal text-white/75">
              {asset.name.replace(/\.exe$/i, '')} {formatMb(asset.sizeBytes) ? `· ${formatMb(asset.sizeBytes)}` : ''}
            </span>
          ) : null}
        </a>
        {state === 'error' && (
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1 text-[11px] font-heading font-bold text-white/80 underline decoration-dotted underline-offset-2"
          >
            <RotateCw className="h-3 w-3" aria-hidden="true" /> {t('common.retry')}
          </button>
        )}
      </span>
    );
  }

  return (
    <section
      aria-labelledby="download-app-heading"
      className={cn('rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]/90 p-4', className)}
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]" aria-hidden="true">
          <Monitor className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="download-app-heading" className="font-heading text-sm font-bold">
            {t('download.app.title')}
          </h2>
          <p className="mt-1 max-w-prose text-xs leading-relaxed text-[var(--color-text-secondary)]">{t('download.app.description')}</p>
        </div>
      </div>

      {state === 'loading' && (
        <p role="status" className="mt-3 text-xs text-[var(--color-text-muted)]">
          {t('download.app.checking')}
        </p>
      )}

      {state === 'error' && (
        <p role="status" className="mt-3 text-xs text-[var(--color-text-secondary)]">
          {t('download.app.offline')}{' '}
          <button type="button" onClick={() => load()} className="font-heading font-bold text-[var(--color-accent-primary)] underline decoration-dotted underline-offset-2">
            {t('common.retry')}
          </button>
        </p>
      )}

      {state === 'ready' && info && (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[info.installer, info.portable].map((item, index) =>
              item ? (
                <a
                  key={item.url}
                  href={item.url}
                  download={item.name}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border p-3 transition-colors',
                    index === 0
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-white hover:opacity-92'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-primary)]/70 hover:border-[var(--color-accent-primary)]'
                  )}
                >
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', index === 0 ? 'bg-white/15' : 'bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]')}>
                    {index === 0 ? <Download className="h-4 w-4" aria-hidden="true" /> : <PackageOpen className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-sm font-bold">{index === 0 ? t('download.app.installer') : t('download.app.portable')}</span>
                    <span className={cn('block truncate font-mono text-[11px]', index === 0 ? 'text-white/80' : 'text-[var(--color-text-muted)]')}>
                      {item.name} {formatMb(item.sizeBytes) ? `· ${formatMb(item.sizeBytes)}` : ''}
                    </span>
                  </span>
                  <span className="font-heading text-[11px] font-bold uppercase tracking-wide">{t('download.app.action')}</span>
                </a>
              ) : null
            )}
          </div>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--color-text-muted)]">
            <span>
              {info.name} · {new Date(info.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t('download.app.note')}</span>
            <span aria-hidden="true">·</span>
            <a href={info.pageUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-heading font-semibold text-[var(--color-accent-primary)] hover:underline">
              {t('common.source')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          </p>
          {info.fallback && (
            <p role="status" className="mt-1.5 text-[11px] leading-snug text-[var(--color-text-secondary)]">
              GitHub could not be reached from this server, so the button points at the last published release ({info.tag}). Site version {APP_VERSION}; releases always carry the newest packaged build.
            </p>
          )}
        </>
      )}
    </section>
  );
}
