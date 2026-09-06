'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff } from 'lucide-react';
import { useI18n } from '@/i18n/hook';
import { useOnline } from '@/hooks/useOnline';

/**
 * Offline notice.
 *
 * It names what still works and what does not, because "you are offline" is not
 * actionable on its own: the saved pages and the printed list are fine, the
 * arrival times are not, and a resident who does not know that will stand at a
 * stop expecting the number on their screen to be current.
 */
export function OfflineBanner() {
  const { t } = useI18n();
  const online = useOnline();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          role="status"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 0.84, 0.44, 1] }}
          className="overflow-hidden border-b border-[var(--color-accent-amber)]/30 bg-[var(--color-accent-amber)]/12"
        >
          <div className="mx-auto flex w-full max-w-[86rem] items-center gap-2 px-4 py-2 text-xs text-[var(--color-text-primary)] sm:px-6 lg:px-8">
            <CloudOff className="w-4 h-4 shrink-0 text-[var(--color-accent-amber)]" aria-hidden="true" />
            <span className="flex-1">{t('offline.banner')}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
