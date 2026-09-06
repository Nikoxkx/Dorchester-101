'use client';

import { useEffect, useState } from 'react';
import { Globe, Heart, RadioTower, Search } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { availableLanguages, useTranslation } from '@/lib/i18n';
import { useRealtime, type RealtimeStatus } from '@/hooks/useRealtime';
import { springNav } from '@/lib/motion';
import { GlassMenu } from '@/components/glass/GlassMenu';
import { NotificationPanel } from './NotificationPanel';
import { useSavedSheet } from '@/stores/uiStore';
import { useCommandPalette } from '@/stores/uiStore';

const STATUS_LABEL: Record<RealtimeStatus, string> = {
  connecting: 'connecting',
  live: 'live',
  polling: 'polling',
  offline: 'offline',
};

/**
 * Header — glass control layer, floating over content.
 * Shrinks slightly on scroll down, expands on scroll up (iOS 26 behavior).
 * Also carries the global entry points: command palette (⌘K), saved items,
 * language switcher, and the realtime notification center.
 */
export function Header({ onMenu }: { onMenu?: () => void }) {
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();
  const condensed = useScrollCondense();
  const openSavedSheet = useSavedSheet((s) => s.setOpen);
  const realtime = useRealtime(undefined, ['__none__']);

  return (
    <motion.header
      className="glass glass-regular glass-edge fixed top-0 end-0 start-0 md:start-[var(--sidebar-w)] z-30 no-print"
      animate={{ height: condensed ? 48 : 56 }}
      initial={false}
      transition={reduce ? { duration: 0 } : springNav}
      style={{ borderRadius: 0 }}
    >
      <div className="flex h-full items-center gap-2 min-w-0 px-3 md:px-4">
        {onMenu && (
          <button
            onClick={onMenu}
            className="md:hidden glass glass-clear glass-edge rounded-full w-9 h-9 grid place-items-center text-1 shrink-0"
            aria-label={t('nav.openMenu')}
          >
            <span className="flex flex-col gap-[3px]" aria-hidden>
              <span className="block w-3.5 h-[1.5px] bg-current rounded-full" />
              <span className="block w-3.5 h-[1.5px] bg-current rounded-full" />
            </span>
          </button>
        )}

        <SearchTrigger label={t('common.search')} />

        <div className="flex items-center gap-1.5 ms-auto shrink-0">
          <span
            className={cn(
              'hidden lg:inline-flex items-center gap-1.5 text-caption2 font-semibold uppercase tracking-wider text-text-3 me-1',
            )}
          >
            <RadioTower
              className={cn('w-3 h-3', realtime.status === 'live' && 'text-success')}
              aria-hidden
            />
            <span role="status">{t('common.realtime')} · {STATUS_LABEL[realtime.status]}</span>
          </span>

          <button
            onClick={() => openSavedSheet(true)}
            className="glass glass-clear glass-edge rounded-full w-9 h-9 grid place-items-center text-1 hover:bg-[var(--glass-clear-hover)] transition-colors"
            aria-label={t('saved.title')}
            title={t('saved.title')}
          >
            <Heart className="w-4 h-4" strokeWidth={2} aria-hidden />
          </button>

          <GlassMenu
            label={t('settings.language')}
            value={language}
            onChange={(v) => setLanguage(v as typeof language)}
            options={availableLanguages.map((l) => ({
              value: l.code,
              label: l.nativeName,
              hint: l.name,
            }))}
            triggerClassName={cn(
              'glass glass-clear glass-edge rounded-full h-9 px-2.5 inline-flex items-center gap-1.5',
              'text-caption font-bold text-1 hover:bg-[var(--glass-clear-hover)] transition-colors',
            )}
            trigger={
              <>
                <Globe className="w-4 h-4" strokeWidth={2} aria-hidden />
                <span className="hidden sm:inline uppercase tracking-wide">{language}</span>
              </>
            }
            width="w-60"
          />

          <NotificationPanel />
        </div>
      </div>
    </motion.header>
  );
}

function SearchTrigger({ label }: { label: string }) {
  const setPaletteOpen = useCommandPalette((s) => s.setOpen);
  return (
    <button
      onClick={() => setPaletteOpen(true)}
      className={cn(
        'glass glass-clear glass-edge flex items-center gap-2 rounded-full h-9 px-3',
        'text-subhead text-text-2 hover:text-1 hover:bg-[var(--glass-clear-hover)] transition-colors',
        'max-w-40 sm:max-w-64 md:max-w-md w-full min-w-0',
      )}
      aria-label={label}
      aria-keyshortcuts="Meta+K Control+K"
    >
      <Search className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden />
      <span className="truncate hidden sm:inline">{label}</span>
      <kbd className="ms-auto hidden md:inline-flex items-center text-caption2 font-mono text-text-3 border border-separator rounded-md px-1.5 py-0.5">
        ⌘K
      </kbd>
    </button>
  );
}

/** True once the page is scrolled down; drives header shrink. */
function useScrollCondense(): boolean {
  const [condensed, setCondensed] = useState(false);
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const next = window.scrollY > 40;
      setCondensed((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return condensed;
}
