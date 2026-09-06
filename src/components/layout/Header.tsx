'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CloudOff, Globe2, Languages, Menu, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/i18n/hook';
import { LANGUAGES, languageMeta } from '@/i18n/config';
import { localeCoverage, TOTAL_KEYS } from '@/i18n';
import { SearchDialog } from '@/components/search/SearchDialog';
import { NotificationPanel } from './NotificationPanel';
import { A11yQuickPanel, ReadAloudButton } from '@/components/a11y';
import { Breadcrumbs } from './Breadcrumbs';
import { useOnline } from '@/hooks/useOnline';
import { APP_EVENTS } from '@/hooks/useKeyboardShortcuts';
import { useAnnounce } from '@/components/providers/LiveRegion';

/**
 * Top bar.
 *
 * Two things residents actually use from any page are here: search, and the
 * language switch that carries them through an appointment. The offline chip is
 * a real `navigator.onLine` reading, not a design flourish, and it names which
 * features stop working rather than showing a grey icon.
 */
export function Header() {
  const { t, lang, dir } = useI18n();
  const online = useOnline();
  const toggleMobileNav = useAppStore((s) => s.toggleMobileNav);
  const mobileNavOpen = useAppStore((s) => s.mobileNavOpen);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const announce = useAnnounce();
  const [langOpen, setLangOpen] = useState(false);
  const langAnchor = useRef<HTMLDivElement>(null);
  const langButton = useRef<HTMLButtonElement>(null);
  const meta = languageMeta(lang);
  const coverage = localeCoverage(lang);

  useEffect(() => {
    if (!langOpen) return;
    function onPointer(event: MouseEvent) {
      if (langAnchor.current && !langAnchor.current.contains(event.target as Node)) setLangOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLangOpen(false);
        langButton.current?.focus();
      }
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    const close = () => setLangOpen(false);
    window.addEventListener(APP_EVENTS.CLOSE_EVENT, close);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener(APP_EVENTS.CLOSE_EVENT, close);
    };
  }, [langOpen]);

  function choose(code: (typeof LANGUAGES)[number]['code']) {
    setLanguage(code);
    setLangOpen(false);
    announce(t('lang.changedTo', { name: languageMeta(code).nativeName }), 'polite');
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b border-[var(--color-border)]',
        'bg-[color-mix(in_oklab,var(--color-bg-primary)_88%,transparent)] backdrop-blur-md'
      )}
    >
      <div className="flex h-[var(--header-height)] items-center gap-2 px-3 sm:px-5">
        <button
          type="button"
          onClick={toggleMobileNav}
          aria-label={mobileNavOpen ? t('nav.close') : t('nav.menu')}
          aria-expanded={mobileNavOpen}
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-2 text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
        >
          <Menu className="w-4 h-4" aria-hidden="true" />
        </button>

        <Breadcrumbs />

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          {!online && (
            <span
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 text-[11px] font-heading text-[var(--color-text-secondary)]"
              title={t('offline.banner')}
            >
              {dir === 'rtl' ? <Wifi className="w-3.5 h-3.5" aria-hidden="true" /> : <CloudOff className="w-3.5 h-3.5 text-[var(--color-accent-secondary)]" aria-hidden="true" />}
              <span className="hidden sm:inline">{t('offline.title')}</span>
            </span>
          )}

          <SearchDialog />

          <div className="relative" ref={langAnchor}>
            <button
              ref={langButton}
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-expanded={langOpen}
              aria-haspopup="menu"
              aria-label={t('lang.change')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-2.5 py-1.5',
                'border-[var(--color-border)] bg-[var(--color-bg-raised)] text-[var(--color-text-secondary)]',
                'hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2',
                langOpen && 'border-[var(--color-accent-primary)]'
              )}
            >
              <Languages className="w-4 h-4" aria-hidden="true" />
              <span className="font-heading text-xs font-semibold">{meta.nativeName}</span>
              <span className="hidden font-mono text-[10px] text-[var(--color-text-muted)] sm:inline">{meta.code2}</span>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  role="menu"
                  aria-label={t('lang.choose')}
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.99 }}
                  transition={{ duration: 0.16, ease: [0.16, 0.84, 0.44, 1] }}
                  className="absolute end-0 top-[calc(100%+8px)] z-[70] w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] shadow-[var(--shadow-lg)]"
                >
                  <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2 text-[11px] font-heading uppercase tracking-wide text-[var(--color-text-muted)]">
                    <Globe2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('lang.choose')}
                  </div>
                  <ul className="max-h-[60vh] overflow-y-auto py-1">
                    {LANGUAGES.map((option) => {
                      const active = option.code === lang;
                      const optionCoverage = localeCoverage(option.code);
                      return (
                        <li key={option.code}>
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            onClick={() => choose(option.code)}
                            lang={option.intlLocale}
                            dir={option.dir}
                            className={cn(
                              'flex w-full items-center gap-3 px-3 py-2 text-start transition-colors',
                              active ? 'bg-[var(--color-accent-primary)]/12 text-[var(--color-accent-primary)]' : 'hover:bg-[var(--color-bg-tertiary)]',
                              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent-primary)]'
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block font-heading text-sm font-medium leading-tight">{option.nativeName}</span>
                              <span className="block text-[11px] text-[var(--color-text-muted)]">
                                {option.name}
                                {optionCoverage.percent < 100 && (
                                  <span className="ms-1.5 font-mono">
                                    {t('lang.coverageValue', { percent: optionCoverage.percent, total: TOTAL_KEYS })}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-[var(--color-text-muted)]">{option.code2}</span>
                            {active && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[11px] leading-relaxed text-[var(--color-text-muted)]">
                    {coverage.percent < 100
                      ? t('lang.untranslated', { language: meta.nativeName })
                      : t('lang.note')}
                    <span className="ms-1 font-mono">
                      {t('lang.coverageValue', { percent: coverage.percent, total: TOTAL_KEYS })}
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <A11yQuickPanel />
          <div className="hidden lg:block">
            <ReadAloudButton compact />
          </div>
          <NotificationPanel />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] md:hidden">
        <Breadcrumbs compact />
      </div>
    </header>
  );
}
