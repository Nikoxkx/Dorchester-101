'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell, Dot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springControl } from '@/lib/motion';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useRealtime } from '@/hooks/useRealtime';
import type { AppNotification } from '@/lib/notifications';

const READ_KEY = 'dor101-read-notifications';

function readIds(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) ?? '[]') as string[]);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-200)));
  } catch {
    // storage unavailable — panel still works, unread badge just won't persist
  }
}

const PRIORITY_TONE: Record<string, string> = {
  urgent: 'text-danger',
  high: 'text-warning',
  medium: 'text-1',
  low: 'text-2',
};

/**
 * NotificationPanel — the realtime notification center.
 * Connects to /api/notifications/stream (SSE) via useRealtime; degrades to
 * polling automatically. Read receipts stay on-device. Time-sensitive items
 * surface MBTA service alerts, recent BPDA filings, and verified food hours.
 */
export function NotificationPanel() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [read, setRead] = useState<Set<string>>(() => new Set());
  const wrapRef = useRef<HTMLDivElement>(null);

  // Hydrate read receipts after mount (localStorage is client-only).
  useEffect(() => {
    const raf = requestAnimationFrame(() => setRead(readIds()));
    return () => cancelAnimationFrame(raf);
  }, []);

  const realtime = useRealtime((payload) => {
    if (Array.isArray(payload.notifications)) {
      setNotifications(payload.notifications as AppNotification[]);
    }
  }, ['notifications', 'mbta', 'data']);

  // When live MBTA/data events arrive, refresh the full payload.
  useEffect(() => {
    if (realtime.status !== 'live') return;
    const raf = requestAnimationFrame(() => {
      void (async () => {
        try {
          const res = await fetch('/api/notifications', { cache: 'no-store' });
          if (!res.ok) return;
          const json = (await res.json()) as { notifications?: AppNotification[] };
          if (Array.isArray(json.notifications)) setNotifications(json.notifications);
        } catch {
          // offline — panel keeps the last known payload
        }
      })();
    });
    return () => cancelAnimationFrame(raf);
  }, [realtime.status, realtime.lastEventAt]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const unread = useMemo(
    () => notifications.filter((n) => !read.has(n.id)).length,
    [notifications, read],
  );

  const markAllRead = () => {
    const next = new Set(read);
    for (const n of notifications) next.add(n.id);
    setRead(next);
    writeReadIds(next);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="glass glass-clear glass-edge rounded-full w-9 h-9 grid place-items-center text-1 hover:bg-[var(--glass-clear-hover)] transition-colors relative"
        aria-label={`${t('notifications.title')}${unread > 0 ? ` — ${unread} ${t('notifications.unread')}` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-4 h-4" strokeWidth={2} aria-hidden />
        {unread > 0 && (
          <motion.span
            initial={reduce ? undefined : { scale: 0 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={springControl}
            className="absolute -top-0.5 -end-0.5 min-w-4 h-4 px-1 rounded-full bg-danger-fill text-white text-[10px] font-bold grid place-items-center"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t('notifications.title')}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={springControl}
            className={cn(
              'glass glass-regular glass-edge glass-specular squircle absolute end-0 top-full mt-2 z-[85]',
              'w-[min(92vw,24rem)] max-h-[70vh] flex flex-col',
            )}
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
              <h2 className="text-subhead font-bold text-1">{t('notifications.title')}</h2>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-caption font-semibold text-text-2 hover:text-1 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current rounded"
                >
                  {t('notifications.markRead')}
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-2 pb-2 overscroll-contain">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-subhead text-text-2">
                  {t('notifications.empty')}
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {notifications.map((n) => {
                    const isUnread = !read.has(n.id);
                    const Wrapper = n.link?.startsWith('/') ? Link : 'a';
                    const wrapProps =
                      n.link?.startsWith('/')
                        ? { href: n.link }
                        : { href: n.link ?? '#', target: '_blank', rel: 'noopener noreferrer' };
                    return (
                      <li key={n.id}>
                        <Wrapper
                          {...wrapProps}
                          onClick={() => {
                            const next = new Set(read);
                            next.add(n.id);
                            setRead(next);
                            writeReadIds(next);
                            setOpen(false);
                          }}
                          className={cn(
                            'flex items-start gap-2 rounded-[12px] px-3 py-2.5 transition-colors',
                            'hover:bg-[var(--glass-clear-hover)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
                          )}
                        >
                          <Dot
                            className={cn('w-5 h-5 shrink-0 -ms-1.5 mt-0.5', isUnread ? PRIORITY_TONE[n.priority] : 'text-transparent')}
                            strokeWidth={4}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1">
                            <span className={cn('block text-footnote leading-snug', isUnread ? 'font-semibold text-1' : 'text-text-2')}>
                              {n.title}
                            </span>
                            <span className="block text-caption2 text-text-3 mt-0.5">
                              {n.source}
                              {n.linkText ? ` · ${n.linkText}` : ''}
                            </span>
                          </span>
                        </Wrapper>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
