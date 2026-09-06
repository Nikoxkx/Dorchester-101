'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { APP_EVENTS, SHORTCUT_LIST } from '@/hooks/useKeyboardShortcuts';

/**
 * The shortcut sheet, opened with `?`.
 *
 * It listens for the same custom event the global handler fires, so the key
 * works even when the Header is scrolled out of view, and it closes on Escape,
 * on backdrop click and on its own button. Focus is moved into the dialog and
 * returned to the opener afterwards; without the return step, a keyboard user
 * is dropped at the top of the document.
 */
export function ShortcutHelp() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function onShow() {
      opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        setOpen(false);
      }
    }
    window.addEventListener(APP_EVENTS.SHORTCUT_HELP_EVENT, onShow);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener(APP_EVENTS.SHORTCUT_HELP_EVENT, onShow);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const first = dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      first?.focus();
    } else {
      opener.current?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label={t('common.close')}
            className="absolute inset-0 bg-[var(--color-scrim)] backdrop-blur-[2px] cursor-default"
            onClick={() => setOpen(false)}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcut-help-title"
            initial={{ y: 12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 8, scale: 0.99, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 0.84, 0.44, 1] }}
            className="relative w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-5 shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
                <h2 id="shortcut-help-title" className="font-display text-lg font-bold">
                  {t('a11y.keyboardMap')}
                </h2>
              </div>
              <button
                type="button"
                data-autofocus
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-sm text-[var(--color-text-muted)] mt-2">{t('a11y.shortcutsIntro')}</p>

            <ul className="mt-4 space-y-2">
              {SHORTCUT_LIST.map(({ key, labelKey }) => (
                <li key={key} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-[var(--color-text-secondary)]">{t(labelKey)}</span>
                  <kbd className="font-mono text-xs px-2 py-1 rounded-[var(--radius-hair)] border border-[var(--color-border-strong)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                    {key}
                  </kbd>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Button that opens the sheet; the Header and the footer both use this. */
export function ShortcutHelpButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(APP_EVENTS.SHORTCUT_HELP_EVENT))}
      className={className}
    >
      <Keyboard className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}
