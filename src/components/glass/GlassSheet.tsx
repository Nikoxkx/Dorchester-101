'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSheet } from '@/lib/motion';
import { useIsMobile } from '@/hooks/useMediaQuery';

/**
 * GlassSheet — modals and bottom sheets. Regular-weight glass, spring
 * entrance, focus trapped inside, Escape closes, background inert.
 * Bottom sheet on mobile, centered panel on desktop — like iOS sheets.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function GlassSheet({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Close',
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));

    // Focus the panel itself first; a focusable child gets focus on Tab.
    panel.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === panel || activeEl === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && activeEl === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const slide = isMobile ? { y: '100%' } : { scale: 0.94, opacity: 0, y: 12 };
  const visible = isMobile ? { y: 0 } : { scale: 1, opacity: 1, y: 0 };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6 no-print">
          <motion.button
            aria-label={closeLabel}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={slide}
            animate={visible}
            exit={slide}
            transition={reduce ? { duration: 0 } : springSheet}
            className={cn(
              'glass glass-regular glass-edge glass-specular squircle relative z-10',
              'w-full max-w-lg outline-none',
              'max-h-[86dvh] flex flex-col',
              'rounded-b-none sm:rounded-b-[var(--radius-lg)]',
              className,
            )}
            style={{ borderRadius: 'var(--radius-lg)' }}
          >
            <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 shrink-0">
              {isMobile && (
                <span aria-hidden className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-separator-strong" />
              )}
              <h2 className="text-title3 font-bold text-1">{title}</h2>
              <button
                onClick={onClose}
                aria-label={closeLabel}
                className="glass glass-clear rounded-full w-8 h-8 inline-flex items-center justify-center text-2 hover:text-1 hover:bg-[var(--glass-clear-hover)] shrink-0"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-6 overscroll-contain">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
