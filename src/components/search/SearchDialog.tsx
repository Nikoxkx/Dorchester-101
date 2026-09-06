'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Loader2, MapPin, Search as SearchIcon, TrainFront, X } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { cn } from '@/lib/utils';
import { useAnnounce } from '@/components/providers/LiveRegion';

/**
 * The header search, as a real combobox.
 *
 * `role="combobox"` + `aria-expanded` + `aria-activedescendant` is the shape a
 * screen reader expects from a type-ahead list; a plain list of `div`s with
 * `onClick` (what an unreviewed generation almost always emits) is silent.
 * Focus stays in the input and the arrow keys move a highlighted option, which
 * also means it works on a phone keyboard where Tab is awkward.
 */

interface Hit {
  id: string;
  kind: 'page' | 'organization' | 'stop' | 'route';
  title: string;
  subtitle: string;
  href: string;
  phone?: string;
  matchedOn?: string;
}

interface Payload {
  query: string;
  total: number;
  pages: Hit[];
  organizations: Hit[];
  stops: Hit[];
  routes: Hit[];
}

const RECENT_KEY = 'dor101:recent-search';
const RECENT_MAX = 5;

function readRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function SearchDialog() {
  const { t } = useI18n();
  const router = useRouter();
  const announce = useAnnounce();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const controller = useRef<AbortController | null>(null);
  const debounce = useRef<number | null>(null);

  const grouped = useMemo(() => {
    if (!payload) return [] as Array<{ label: string; items: Hit[]; icon: 'page' | 'org' | 'stop' | 'route' }>;
    return [
      { label: t('search.pages'), items: payload.pages, icon: 'page' as const },
      { label: t('search.organizations'), items: payload.organizations, icon: 'org' as const },
      { label: t('search.stops'), items: payload.stops, icon: 'stop' as const },
      { label: t('search.routes'), items: payload.routes, icon: 'route' as const },
    ].filter((section) => section.items.length > 0);
  }, [payload, t]);

  const flat = useMemo(() => grouped.flatMap((section) => section.items), [grouped]);

  const openSearch = useCallback(() => {
    setOpen(true);
    setRecent(readRecent());
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }, []);

  useEffect(() => {
    window.addEventListener(APP_EVENTS.SEARCH_EVENT, openSearch);
    return () => window.removeEventListener(APP_EVENTS.SEARCH_EVENT, openSearch);
  }, [openSearch]);

  useEffect(() => {
    function onClose() {
      setOpen(false);
    }
    window.addEventListener(APP_EVENTS.CLOSE_EVENT, onClose);
    return () => window.removeEventListener(APP_EVENTS.CLOSE_EVENT, onClose);
  }, []);

  // Debounced query. The abort controller matters: typing fast otherwise lets an
  // older, slower response land after the newer one.
  useEffect(() => {
    if (!open) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    if (term.trim().length < 2) {
      setPayload(null);
      setLoading(false);
      setFailed(false);
      return;
    }
    setLoading(true);
    debounce.current = window.setTimeout(async () => {
      controller.current?.abort();
      const ctrl = new AbortController();
      controller.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=16`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Payload;
        setPayload(json);
        setActive(0);
        setFailed(false);
        announce(t('common.results', { count: json.total }), 'polite');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setFailed(true);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [term, open, announce, t]);

  function commit(query: string) {
    const next = [query, ...readRecent().filter((r) => r !== query)].slice(0, RECENT_MAX);
    setRecent(next);
    try {
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* private mode: search still works, it just is not remembered */
    }
  }

  function go(hit: Hit) {
    commit(term || hit.title);
    setOpen(false);
    router.push(hit.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      return;
    }
    if (!flat.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (event.key === 'Home') {
      setActive(0);
    } else if (event.key === 'End') {
      setActive(flat.length - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const hit = flat[active];
      if (hit) go(hit);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        className={cn(
          'inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)]',
          'bg-[var(--color-bg-raised)] px-3 py-1.5 text-xs font-heading text-[var(--color-text-muted)]',
          'transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2'
        )}
        aria-label={t('search.open')}
        aria-keyshortcuts="/"
      >
        <SearchIcon className="w-4 h-4" aria-hidden="true" />
        <span className="hidden md:inline">{t('search.placeholderShort')}</span>
        <kbd className="hidden md:inline font-mono text-[10px] px-1.5 py-0.5 rounded-[var(--radius-hair)] border border-[var(--color-border)]">
          /
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          >
            <button type="button" aria-label={t('search.close')} className="absolute inset-0 bg-[var(--color-scrim)] cursor-default" onClick={() => setOpen(false)} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('search.label')}
              initial={{ y: -12, scale: 0.985, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 0.84, 0.44, 1] }}
              className="relative w-full max-w-xl overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
                {loading ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[var(--color-accent-primary)]" aria-hidden="true" />
                ) : (
                  <SearchIcon className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                )}
                <input
                  ref={inputRef}
                  role="combobox"
                  aria-expanded={flat.length > 0}
                  aria-controls={`${listId}-listbox`}
                  aria-activedescendant={flat.length ? `${listId}-opt-${active}` : undefined}
                  aria-autocomplete="list"
                  autoComplete="off"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={t('search.placeholder')}
                  className="flex-1 bg-transparent py-3 font-body text-base outline-none placeholder:text-[var(--color-text-muted)]"
                />
                {term && (
                  <button
                    type="button"
                    onClick={() => {
                      setTerm('');
                      inputRef.current?.focus();
                    }}
                    aria-label={t('search.clear')}
                    className="rounded-[var(--radius-sm)] p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div id={`${listId}-listbox`} role="listbox" aria-label={t('search.label')} className="max-h-[55vh] overflow-y-auto p-2">
                {term.trim().length < 2 ? (
                  <div className="p-3">
                    <p className="text-xs text-[var(--color-text-muted)]">{t('search.emptyHint')}</p>
                    {recent.length > 0 && (
                      <>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {t('search.recent')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRecent([]);
                              window.localStorage.removeItem(RECENT_KEY);
                            }}
                            className="text-[11px] font-heading text-[var(--color-accent-primary)] underline-offset-2 hover:underline"
                          >
                            {t('search.clearRecent')}
                          </button>
                        </div>
                        <ul className="mt-1.5 flex flex-wrap gap-1.5">
                          {recent.map((entry) => (
                            <li key={entry}>
                              <button
                                type="button"
                                onClick={() => setTerm(entry)}
                                className="rounded-[var(--radius-pill)] border border-[var(--color-border)] px-2.5 py-1 text-xs hover:bg-[var(--color-bg-tertiary)]"
                              >
                                {entry}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                ) : loading && !payload ? (
                  <p className="p-4 text-sm text-[var(--color-text-muted)]">{t('search.loading')}</p>
                ) : failed ? (
                  <p className="p-4 text-sm text-[var(--color-accent-secondary)]">{t('error.body')}</p>
                ) : flat.length === 0 ? (
                  <p className="p-4 text-sm text-[var(--color-text-muted)]">{t('search.noResults')}</p>
                ) : (
                  grouped.map((section) => (
                    <div key={section.label} className="mb-1">
                      <h3 className="px-2 pt-2 pb-1 text-[11px] font-heading font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {section.label}
                      </h3>
                      <ul>
                        {section.items.map((hit) => {
                          const index = flat.indexOf(hit);
                          const Icon =
                            section.icon === 'stop' ? TrainFront : section.icon === 'route' ? TrainFront : section.icon === 'org' ? MapPin : ArrowRight;
                          return (
                            <li key={hit.id}>
                              <button
                                type="button"
                                id={`${listId}-opt-${index}`}
                                role="option"
                                aria-selected={index === active}
                                onMouseEnter={() => setActive(index)}
                                onClick={() => go(hit)}
                                className={cn(
                                  'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-start',
                                  index === active ? 'bg-[var(--color-accent-primary)]/12' : 'hover:bg-[var(--color-bg-tertiary)]'
                                )}
                              >
                                <Icon className="w-4 h-4 shrink-0 text-[var(--color-accent-primary)]" aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-heading text-sm font-medium">{hit.title}</span>
                                  <span className="block truncate text-xs text-[var(--color-text-muted)]">
                                    {hit.phone ? `${hit.subtitle} · ${hit.phone}` : hit.subtitle}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-3 py-2 text-[11px] text-[var(--color-text-muted)]">
                <span>{t('search.keyboardHint')}</span>
                <span className="hidden sm:inline">{t('common.results', { count: payload?.total ?? 0 })}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
