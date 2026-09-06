'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import type { SearchHit } from '@/data/search';

export function SearchDialog({
  open,
  onClose,
  initialQuery = '',
}: {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, initialQuery]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const id = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setHits(data.hits || []);
      } catch {
        setHits([]);
      }
    }, 180);
    return () => window.clearTimeout(id);
  }, [q]);

  return (
    <Modal open={open} onClose={onClose} title="Search" wide>
      <div className="flex items-center gap-2 px-3 border-b border-[var(--line)]">
        <Search className="w-4 h-4 text-[var(--muted)]" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Housing, SNAP, Fields Corner, GBLS…"
          className="flex-1 py-3 bg-transparent outline-none text-sm"
          aria-label="Search DOR101"
        />
        <button onClick={onClose} className="p-2" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      <ul className="max-h-[60vh] overflow-y-auto">
        {hits.map((hit) => (
          <li key={`${hit.kind}-${hit.id}`}>
            <Link
              href={hit.href}
              onClick={onClose}
              className="block px-4 py-3 border-b border-[var(--line)] hover:bg-[var(--paper)]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-sm">{hit.title}</span>
                <span className="kicker">{hit.kind}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">{hit.blurb}</p>
            </Link>
          </li>
        ))}
        {q.trim().length >= 2 && hits.length === 0 && (
          <li className="px-4 py-8 text-sm text-[var(--muted)]">Nothing matched “{q}”.</li>
        )}
        {q.trim().length < 2 && (
          <li className="px-4 py-6 text-sm text-[var(--muted)]">Type at least two letters.</li>
        )}
      </ul>
    </Modal>
  );
}

export function SearchTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <div className={cn('relative flex-1 max-w-xl', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
        <input
          type="search"
          placeholder="Search housing, food, SNAP…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className="w-full pl-9 pr-12 py-2 bg-[var(--surface)] border border-[var(--line)] text-sm outline-none focus:border-[var(--ink)]"
          aria-label="Search"
        />
        <kbd className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] border border-[var(--line)] px-1.5 py-0.5">
          ⌘K
        </kbd>
      </div>
      <SearchDialog open={open} onClose={() => setOpen(false)} initialQuery={q} />
    </>
  );
}
