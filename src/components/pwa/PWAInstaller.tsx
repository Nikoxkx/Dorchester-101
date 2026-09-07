'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Monitor, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isDesktopApp } from '@/lib/desktop';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches);
  // The banner offers "install the app" plus a .exe download — both pointless
  // inside the desktop app itself. The service worker registration above still
  // runs; only the banner is suppressed.
  const [inDesktop] = useState(isDesktopApp);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[DOR101] Service worker registered:', reg.scope);
        })
        .catch((err) => {
          console.error('[DOR101] Service worker registration failed:', err);
        });
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('dor101-install-dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('dor101-install-dismissed', 'true');
  };

  if (installed || !showBanner || inDesktop) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-lg',
          'bg-[var(--color-bg-primary)] border border-[var(--color-border)]',
          'rounded-xl shadow-2xl p-5'
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--color-text-muted)]" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--color-accent-primary)]/10">
            <Monitor className="w-6 h-6 text-[var(--color-accent-primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-sm mb-1">
              Install DOR101 on your computer
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">
              Get one-click access from your desktop or Start menu. Works offline. No app store needed.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-medium',
                  'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/90 transition-colors'
                )}
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              {/* The real .exe, straight from the latest release. */}
              <a
                href="/api/download?get=installer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-medium border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] transition-colors"
              >
                <Monitor className="w-4 h-4" />
                Windows app (.exe)
              </a>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-sm font-heading text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] grid grid-cols-3 gap-2 text-[10px] text-[var(--color-text-muted)]">
          {[
            { icon: CheckCircle, text: 'Works offline' },
            { icon: CheckCircle, text: 'One-click launch' },
            { icon: CheckCircle, text: 'Auto-updates' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <item.icon className="w-3 h-3 text-[var(--color-accent-green)]" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
