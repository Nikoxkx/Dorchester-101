'use client';

import { useEffect, useState } from 'react';
import { X } from '@/components/ui/icons';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem('dor101-install-dismissed')) setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setShow(false));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show || !promptEvent) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[min(420px,92vw)] bg-[var(--surface)] border border-[var(--line)] p-4 shadow-[0_10px_36px_var(--shadow)]">
      <button
        className="absolute top-2 right-2 p-1"
        onClick={() => {
          setShow(false);
          localStorage.setItem('dor101-install-dismissed', 'true');
        }}
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="font-display font-semibold">Keep DOR101 on this phone</p>
      <p className="text-xs text-[var(--muted)] mt-1 mb-3">Works without an app store. Preferences stay on the device.</p>
      <button
        className="bg-[var(--blue)] text-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.06em] hover:bg-[var(--blue-dark)]"
        onClick={async () => {
          await promptEvent.prompt();
          setShow(false);
        }}
      >
        Install
      </button>
    </div>
  );
}
