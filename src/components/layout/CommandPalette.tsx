'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, CornerDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSheet } from '@/lib/motion';
import { useCommandPalette } from '@/stores/uiStore';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { navItems } from './Sidebar';
import type { TranslationKey } from '@/lib/i18n';

interface SearchHit {
  id: string;
  title: string;
  snippet?: string;
  href: string;
  category?: string;
}

interface SectionHit {
  id: string;
  title: string;
  href: string;
  category: string;
  snippet: string | undefined;
}

/**
 * CommandPalette — global fuzzy search across every section and resource.
 * Opens with Cmd/Ctrl+K (bound in MainLayout). Sections are matched locally
 * for instant feedback; resources and organizations come from /api/search.
 * Full keyboard navigation with visible active state.
 */
export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const router = useRouter();
  const reduce = useReducedMotion();

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset when the palette closes — the documented render-time state
  // adjustment pattern (no cascading effect renders).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) {
      setQuery('');
      setHits([]);
      setActive(0);
    }
  }

  // Local section matches — instant, no network.
  const sectionHits = useMemo<SectionHit[]>(() => {
    const q = query.trim().toLowerCase();
    const all = navItems.map((n) => ({
      id: `sec-${n.href}`,
      title: t(n.labelKey),
      href: n.href,
      category: 'Section',
      snippet: undefined,
    }));
    if (!q) return all.slice(0, 6);
    return all.filter((n) => n.title.toLowerCase().includes(q));
  }, [query, t]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const id = window.setTimeout(async () => {
      if (q.length < 2) {
        setHits([]);
        return;
      }
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = (await res.json()) as { hits?: SearchHit[] };
        setHits(data.hits ?? []);
      } catch {
        setHits([]);
      }
    }, 160);
    return () => window.clearTimeout(id);
  }, [query, open]);

  const results = useMemo(() => [...sectionHits, ...hits], [sectionHits, hits]);

  const [prevResultCount, setPrevResultCount] = useState(results.length);
  if (results.length !== prevResultCount) {
    setPrevResultCount(results.length);
    setActive(0);
  }

  if (!open) return null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active].href);
    }
  };

  return (
    <AnimatePresence>
      <div className="no-print fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
        <motion.button
          aria-label={t('common.close')}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setOpen(false)}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t('common.search')}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
          transition={springSheet}
          className="glass glass-regular glass-edge glass-specular squircle relative z-10 w-full max-w-xl overflow-visible"
          style={{ borderRadius: 'var(--radius-lg)' }}
        >
          <div
            className="flex items-center gap-3 px-5 border-b border-separator"
            onKeyDown={onKeyDown}
          >
            <Search className="w-4.5 h-4.5 text-text-3 shrink-0" strokeWidth={2} aria-hidden />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.search')}
              aria-label={t('common.search')}
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-results"
              className="w-full bg-transparent border-0 outline-none py-4 text-body text-1 placeholder:text-text-3"
            />
            <kbd className="hidden sm:inline-flex text-caption2 font-mono text-text-3 border border-separator rounded-md px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <div
            ref={listRef}
            id="command-palette-results"
            role="listbox"
            aria-label={t('common.search')}
            className="max-h-[46vh] overflow-y-auto p-2"
          >
            {results.length === 0 && query.trim().length >= 2 && (
              <p className="px-4 py-8 text-center text-subhead text-text-2">{t('search.noResults')}</p>
            )}
            {results.map((hit, i) => (
              <button
                key={hit.id}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(hit.href)}
                className={cn(
                  'w-full flex items-center gap-3 text-start rounded-[12px] px-3 py-2.5',
                  'transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-current',
                  i === active ? 'bg-[var(--glass-clear-hover)]' : '',
                )}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-subhead font-medium text-1 truncate">{hit.title}</span>
                  {hit.snippet && (
                    <span className="block text-caption text-text-2 truncate">{hit.snippet}</span>
                  )}
                </span>
                {hit.category && (
                  <span className="text-caption2 font-semibold uppercase tracking-wider text-text-3 shrink-0">
                    {hit.category}
                  </span>
                )}
                {i === active && (
                  <CornerDownLeft className="w-3.5 h-3.5 text-text-3 shrink-0" aria-hidden />
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
