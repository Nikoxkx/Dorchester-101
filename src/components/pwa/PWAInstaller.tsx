'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { springSheet } from '@/lib/motion';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** PWA install prompt — glass, dismissible, remembered locally. */
export function PWAInstaller() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const reduce = useReducedMotion();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem('dor101-install-dismissed')) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShow(false));
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', () => setShow(false));
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('dor101-install-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {show && promptEvent && (
        <motion.div
          role="dialog"
          aria-label={t('install.title')}
          className="glass glass-regular glass-edge squircle fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(420px,92vw)] p-4 no-print"
          style={{ borderRadius: 'var(--radius-md)' }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={springSheet}
        >
          <button
            className="absolute top-2 end-2 p-1.5 rounded-full text-text-2 hover:text-1"
            onClick={dismiss}
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
          <p className="text-subhead font-bold text-1 pe-6">{t('install.title')}</p>
          <p className="text-caption text-text-2 mt-1 mb-3">{t('install.body')}</p>
          <button
            className="inline-flex items-center gap-2 bg-ink text-canvas rounded-full px-4 py-2 text-subhead font-semibold hover:opacity-85 transition-opacity"
            onClick={async () => {
              await promptEvent.prompt();
              setShow(false);
            }}
          >
            <Download className="w-4 h-4" strokeWidth={2} aria-hidden />
            {t('install.action')}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
