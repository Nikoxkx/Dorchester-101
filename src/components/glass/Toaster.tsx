'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, TriangleAlert, OctagonAlert, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springSheet } from '@/lib/motion';
import { useToastStore, type ToastTone } from '@/stores/toastStore';
import { useTranslation } from '@/lib/i18n';
import { useAppStore } from '@/stores/appStore';

const toneIcon: Record<ToastTone, typeof Info> = {
  neutral: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: OctagonAlert,
};

const toneText: Record<ToastTone, string> = {
  neutral: 'text-1',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
};

/**
 * Toaster — glass-layer feedback for every user action (saved a favorite,
 * checked off a document, changed a setting). Rendered top-center so it
 * never collides with the mobile bottom tab bar. role="status" for SRs.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (toasts.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss(toasts[toasts.length - 1].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toasts, dismiss]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="no-print pointer-events-none fixed top-3 left-1/2 z-[120] flex w-[min(92vw,26rem)] -translate-x-1/2 flex-col items-center gap-2"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toneIcon[toast.tone];
          return (
            <motion.button
              key={toast.id}
              role="status"
              onClick={() => dismiss(toast.id)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.96 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.97 }}
              transition={reduce ? { duration: 0.15 } : springSheet}
              className={cn(
                'glass glass-regular glass-edge squircle pointer-events-auto',
                'flex w-full items-center gap-2.5 px-4 py-3 text-start',
                'text-subhead font-medium text-1',
              )}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <Icon className={cn('w-4.5 h-4.5 shrink-0', toneText[toast.tone])} aria-hidden />
              <span className="flex-1">{toast.message}</span>
              <span className="sr-only-x">{t('common.close')}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
