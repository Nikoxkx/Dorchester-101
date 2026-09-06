'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { springSheet } from '@/lib/motion';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

/** Electron auto-update banner — glass, non-blocking, restart on user's terms. */
export function UpdateNotifier() {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();

  useEffect(() => {
    const api = window.electron;
    if (!api) return;
    api.onUpdateAvailable(() => setAvailable(true));
    api.onUpdateDownloaded(() => {
      setAvailable(false);
      setReady(true);
    });
  }, []);

  return (
    <AnimatePresence>
      {(available || ready) && (
        <motion.div
          role="status"
          className="glass glass-regular glass-edge squircle fixed bottom-20 md:bottom-6 end-4 z-50 w-[min(22rem,calc(100vw-2rem))] p-4 no-print"
          style={{ borderRadius: 'var(--radius-md)' }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={springSheet}
        >
          <p className="kicker">{t('update.desktop')}</p>
          {available && (
            <>
              <p className="text-subhead font-bold text-1 mt-1">{t('update.downloading')}</p>
              <p className="text-caption text-text-2 mt-1">{t('update.nextRestart')}</p>
            </>
          )}
          {ready && (
            <>
              <p className="text-subhead font-bold text-1 mt-1">{t('update.ready')}</p>
              <p className="text-caption text-text-2 mt-1">{t('update.restartHint')}</p>
              <button
                className="mt-3 inline-flex items-center gap-2 bg-ink text-canvas rounded-full px-4 py-2 text-subhead font-semibold hover:opacity-85 transition-opacity"
                onClick={() => window.electron?.restartApp()}
              >
                <RefreshCw className="w-4 h-4" strokeWidth={2} aria-hidden />
                {t('update.restartNow')}
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
