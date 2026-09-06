'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Bell, Check, Clock, ExternalLink, House, RefreshCw, UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/i18n/hook';
import { useAppStore } from '@/stores/appStore';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { useLivePolling } from '@/hooks/useLivePolling';
import type { TranslationKey } from '@/i18n/en';
import { useAnnounce } from '@/components/providers/LiveRegion';

/**
 * The updates bell.
 *
 * The payload is derived server-side from live MBTA alerts and the opening-hours
 * data, so this component renders what came back and never implies a notice
 * exists. `status` tells it which empty-state sentence to show: nothing to
 * report, or the feed could not be read. Read-state is per-device by design.
 */

interface DerivedNotification {
  id: string;
  kind: 'transit' | 'open-now' | 'closing-soon' | 'needs-review';
  titleKey: string;
  params: Record<string, string | number>;
  href: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  occurredAt: string;
  expiresAt?: string;
  sourceLabel: string;
  sourceUrl?: string;
}

interface Payload {
  notifications: DerivedNotification[];
  total: number;
  status: 'ok' | 'quiet' | 'degraded';
  alertsSource: 'mbta' | 'unavailable';
  generatedAt: string;
  localTime: string;
}

const READ_KEY = 'dor101:read-notifications';
const POLL_MS = 5 * 60_000;

function readIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    return raw ? new Set((JSON.parse(raw) as string[]).slice(0, 300)) : new Set();
  } catch {
    return new Set();
  }
}

const KIND_ICON = {
  transit: AlertTriangle,
  'open-now': Clock,
  'closing-soon': UtensilsCrossed,
  'needs-review': House,
} as const;

const PRIORITY_STYLE = {
  urgent: 'border-s-[3px] border-s-[var(--mbta-red)]',
  high: 'border-s-[3px] border-s-[var(--color-accent-secondary)]',
  medium: 'border-s-[3px] border-s-[var(--color-accent-primary-soft)]',
  low: 'border-s-[3px] border-s-[var(--color-border-strong)]',
} as const;

export function NotificationPanel() {
  const { t, format } = useI18n();
  const announce = useAnnounce();
  const followed = useAppStore((s) => s.enabledTransitFeeds);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [read, setRead] = useState<Set<string>>(() => readIds());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!options.silent) setLoading(true);
      try {
        const res = await fetch(`/api/notifications?lines=${encodeURIComponent(followed.join(','))}&categories=food,housing`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Payload;
        setData(json);
        setError(false);
        const fresh = json.notifications.filter((n) => !read.has(n.id)).length;
        if (options.silent && fresh > 0) announce(t('notifications.label', { count: fresh }), 'polite');
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    // `read` intentionally excluded: it changes on every click and must not re-trigger a fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [announce, followed, t]
  );

  useLivePolling(() => void load({ silent: true }), { minMs: POLL_MS });

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (anchor.current && !anchor.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    const close = () => setOpen(false);
    window.addEventListener(APP_EVENTS.CLOSE_EVENT, close);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(APP_EVENTS.CLOSE_EVENT, close);
    };
  }, [open]);

  function markRead(id: string) {
    const next = new Set(read).add(id);
    setRead(next);
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify([...next]));
    } catch {
      /* storage off: the panel still works for this visit */
    }
  }

  function markAll() {
    const next = new Set(read);
    (data?.notifications ?? []).forEach((n) => next.add(n.id));
    setRead(next);
    try {
      window.localStorage.setItem(READ_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
    announce(t('notifications.markRead'), 'polite');
  }

  const items = data?.notifications ?? [];
  const unread = items.filter((n) => !read.has(n.id)).length;

  return (
    <div className="relative" ref={anchor}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load({ silent: true });
        }}
        aria-expanded={open}
        aria-controls="notification-panel"
        aria-label={t('notifications.label', { count: unread })}
        className={cn(
          'relative inline-flex items-center justify-center rounded-[var(--radius-pill)] border p-2 transition-colors',
          'border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)]',
          'hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
          open && 'border-[var(--color-accent-primary)]'
        )}
      >
        <Bell className="w-4 h-4" aria-hidden="true" />
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1 -end-1 min-w-[18px] rounded-full bg-[var(--mbta-red)] px-1 text-center font-mono text-[10px] font-semibold leading-[18px] text-white"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="notification-panel"
            role="dialog"
            aria-label={t('notifications.title')}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 0.84, 0.44, 1] }}
            className="absolute end-0 top-[calc(100%+8px)] z-[70] w-[min(26rem,calc(100vw-1.5rem))] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] shadow-[var(--shadow-lg)]"
          >
            <header className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
              <h2 className="font-display text-sm font-bold">{t('notifications.title')}</h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void load()}
                  disabled={loading}
                  aria-label={t('common.refresh')}
                  className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-bg-tertiary)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={markAll}
                  disabled={items.length === 0}
                  className="rounded-[var(--radius-sm)] px-2 py-1 text-[11px] font-heading font-semibold text-[var(--color-accent-primary)] hover:bg-[var(--color-bg-tertiary)] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                >
                  {t('notifications.markRead')}
                </button>
              </div>
            </header>

            <div className="max-h-[60vh] overflow-y-auto">
              {error && !data ? (
                <p className="p-4 text-sm text-[var(--color-accent-secondary)]">{t('settings.refreshFailed')}</p>
              ) : items.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm font-heading text-[var(--color-text-secondary)]">{t('notifications.empty')}</p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {data?.status === 'degraded' ? t('map.predictionsFailed') : t('map.alertsNone')}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-border)]">
                  {items.map((item) => {
                    const Icon = KIND_ICON[item.kind] ?? AlertTriangle;
                    const isUnread = !read.has(item.id);
                    return (
                      <li key={item.id} className={cn('px-3 py-2.5', PRIORITY_STYLE[item.priority])}>
                        <div className="flex items-start gap-2.5">
                          <Icon className="mt-0.5 w-4 h-4 shrink-0 text-[var(--color-accent-primary)]" aria-hidden="true" />
                          <div className="min-w-0 flex-1">
                            <p className={cn('text-sm leading-snug', isUnread ? 'font-heading font-semibold' : 'text-[var(--color-text-secondary)]')}>
                              {t(item.titleKey as TranslationKey, item.params)}
                            </p>
                            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--color-text-muted)]">
                              <span>{item.sourceLabel}</span>
                              <span aria-hidden="true">·</span>
                              <time dateTime={item.occurredAt}>{format.relative(item.occurredAt)}</time>
                              <span className="rounded-[var(--radius-pill)] bg-[var(--color-bg-tertiary)] px-1.5 py-0.5 font-heading">
                                {t(`notifications.priority.${item.priority}` as TranslationKey)}
                              </span>
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <Link
                                href={item.href}
                                onClick={() => {
                                  markRead(item.id);
                                  setOpen(false);
                                }}
                                className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] bg-[var(--color-accent-primary)] px-2 py-1 text-[11px] font-heading font-semibold text-white hover:bg-[var(--color-accent-primary)]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
                              >
                                {t('notifications.open')}
                                <ExternalLink className="w-3 h-3" aria-hidden="true" />
                              </Link>
                              {isUnread && (
                                <button
                                  type="button"
                                  onClick={() => markRead(item.id)}
                                  className="inline-flex items-center gap-1 text-[11px] font-heading text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                                >
                                  <Check className="w-3 h-3" aria-hidden="true" />
                                  {t('notifications.dismiss')}
                                </button>
                              )}
                              {item.sourceUrl && (
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] font-heading text-[var(--color-accent-primary-soft)] hover:underline"
                                >
                                  {t('common.source')}
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <footer className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[11px] text-[var(--color-text-muted)]">
              <span>{t('notifications.footer')}</span>
              {data?.localTime && <span className="font-mono">{data.localTime.split(', ')[1] ?? data.localTime}</span>}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
