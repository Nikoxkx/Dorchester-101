'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Clear all caches on load
      const clearCache = async () => {
        if ('caches' in window) {
          const names = await caches.keys();
          await Promise.all(names.map(name => caches.delete(name)));
        }
      };

      // Register fresh service worker
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('DOR101 Service Worker registered:', registration.scope);
        
        // Clear cache when new service worker activates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - clear cache and reload
                clearCache().then(() => {
                  window.location.reload();
                });
              }
            });
          }
        });

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'RELOAD_PAGE') {
            window.location.reload();
          }
        });
      }).catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }

    // Clear localStorage cache keys on mount
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('dor101-'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  return null;
}