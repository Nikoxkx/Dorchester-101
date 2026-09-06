'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  linkText?: string;
  priority: string;
  createdAt: string;
  read: boolean;
  source: string;
}

const READ_KEY = 'dor101-read-notifications';

function loadRead(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveRead(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)));
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        const read = loadRead();
        const next = (data.notifications || []).map((n: Notification) => ({ ...n, read: read.has(n.id) }));
        setItems(next);
        setUnread(next.filter((n: Notification) => !n.read).length);
      } catch {
        /* keep empty */
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  const mark = (id: string) => {
    const read = loadRead();
    read.add(id);
    saveRead(read);
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((n) => Math.max(0, n - 1));
  };

  const markAll = () => {
    const read = new Set(items.map((n) => n.id));
    saveRead(read);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-[var(--surface)]"
        aria-label={`Notifications: ${unread} unread`}
      >
        <Bell className="w-4 h-4 text-[var(--muted)]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 bg-[var(--red)] text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-[min(22rem,calc(100vw-1.5rem))] max-h-[70vh] overflow-hidden bg-[var(--surface)] border border-[var(--ink)] shadow-lg">
            <div className="px-3 py-2 border-b border-[var(--line)] flex items-center justify-between">
              <p className="text-sm font-bold">Notices</p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAll} className="text-xs underline">Mark read</button>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {items.length === 0 && (
                <p className="p-6 text-sm text-[var(--muted)]">No notices.</p>
              )}
              {items.map((n) => {
                const external = n.link?.startsWith('http');
                return (
                  <div key={n.id} className={cn('px-3 py-3 border-b border-[var(--line)]', !n.read && 'bg-[var(--paper)]')}>
                    <div className="flex justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      {!n.read && (
                        <button onClick={() => mark(n.id)} aria-label="Mark read"><Check className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">{n.message}</p>
                    <div className="flex justify-between mt-2 text-[10px] text-[var(--muted)]">
                      <span>{n.source}</span>
                      {n.link && (external ? (
                        <a href={n.link} target="_blank" rel="noreferrer" className="underline" onClick={() => mark(n.id)}>
                          {n.linkText || 'Open'}
                        </a>
                      ) : (
                        <Link href={n.link} className="underline" onClick={() => { mark(n.id); setOpen(false); }}>
                          {n.linkText || 'Open'}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
