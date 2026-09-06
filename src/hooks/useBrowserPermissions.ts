'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * The three optional browser capabilities DOR101 can use, surfaced in one place
 * so the site can ask for them plainly instead of each feature firing its own
 * surprise prompt:
 *
 *  - notifications — a system notification for urgent transit/food notices;
 *  - geolocation   — one-shot, only ever read when a resident taps Locate or
 *                    asks for door-to-door transit directions;
 *  - storage       - `navigator.storage.persist()` so the offline copies of the
 *                    resource list, news snapshot and map tiles survive the
 *                    browser's eviction pressure.
 *
 * Every one of these is optional. The point of the hook is to *report* state
 * truthfully (granted / denied / not asked / unsupported), not to nag.
 */

export type PermissionValue = 'granted' | 'denied' | 'prompt' | 'unsupported' | 'unknown';
export type PermissionStates = {
  notifications: PermissionValue;
  location: PermissionValue;
  storage: 'granted' | 'denied' | 'prompt' | 'unsupported' | 'unknown';
};

const DISMISS_KEY = 'dor101:permissions-dismissed';

export function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeDismissed(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    /* storage blocked — the card just comes back next visit */
  }
}

function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

function locationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

function storageSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.storage !== 'undefined' && typeof navigator.storage.persist === 'function';
}

export function useBrowserPermissions() {
  const [states, setStates] = useState<PermissionStates>({ notifications: 'unknown', location: 'unknown', storage: 'unknown' });
  const [busy, setBusy] = useState<Partial<Record<keyof PermissionStates, boolean>>>({});

  // Read the browser's own current verdicts (they can change from the address
  // bar at any time, so this also refreshes when the tab regains focus).
  const refresh = useCallback(() => {
    setStates({
      notifications: notificationsSupported() ? (Notification.permission as PermissionValue) : 'unsupported',
      location: locationSupported() ? 'prompt' : 'unsupported',
      storage: storageSupported() ? 'prompt' : 'unsupported',
    });
    if (storageSupported()) {
      navigator.storage
        .persisted()
        .then((persisted) => setStates((prev) => ({ ...prev, storage: persisted ? 'granted' : prev.storage === 'unknown' ? 'prompt' : prev.storage })))
        .catch(() => undefined);
    }
    if (locationSupported() && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => setStates((prev) => ({ ...prev, location: status.state as PermissionValue })))
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    // Deferred a tick so the initial state read happens outside the effect
    // body (React 19's set-state-in-effect rule); focus re-reads stay direct.
    const kick = window.setTimeout(refresh, 0);
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearTimeout(kick);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const requestNotifications = useCallback(async (): Promise<'granted' | 'denied' | 'unsupported'> => {
    if (!notificationsSupported()) {
      setStates((prev) => ({ ...prev, notifications: 'unsupported' }));
      return 'unsupported';
    }
    setBusy((prev) => ({ ...prev, notifications: true }));
    try {
      const result = await Notification.requestPermission();
      setStates((prev) => ({ ...prev, notifications: result as PermissionValue }));
      return result === 'granted' ? 'granted' : 'denied';
    } finally {
      setBusy((prev) => ({ ...prev, notifications: false }));
    }
  }, []);

  const requestLocation = useCallback((): Promise<boolean> => {
    if (!locationSupported()) {
      setStates((prev) => ({ ...prev, location: 'unsupported' }));
      return Promise.resolve(false);
    }
    setBusy((prev) => ({ ...prev, location: true }));
    // One-shot read; the coordinates are used for nothing here — the point is
    // only to raise (and remember) the browser's own permission question.
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => {
          setStates((prev) => ({ ...prev, location: 'granted' }));
          setBusy((prev) => ({ ...prev, location: false }));
          resolve(true);
        },
        (error) => {
          setStates((prev) => ({ ...prev, location: error.code === error.PERMISSION_DENIED ? 'denied' : 'prompt' }));
          setBusy((prev) => ({ ...prev, location: false }));
          resolve(false);
        },
        { timeout: 10_000, maximumAge: 600_000 }
      );
    });
  }, []);

  const requestStorage = useCallback(async (): Promise<boolean> => {
    if (!storageSupported()) {
      setStates((prev) => ({ ...prev, storage: 'unsupported' }));
      return false;
    }
    setBusy((prev) => ({ ...prev, storage: true }));
    try {
      const granted = await navigator.storage.persist();
      setStates((prev) => ({ ...prev, storage: granted ? 'granted' : 'denied' }));
      return granted;
    } finally {
      setBusy((prev) => ({ ...prev, storage: false }));
    }
  }, []);

  return { states, busy, refresh, requestNotifications, requestLocation, requestStorage };
}

/**
 * Fire a system notification for an urgent notice, if (and only if) the visitor
 * granted permission. Returns false silently otherwise — a denied permission is
 * not an error and must never log noise.
 */
export function notifyIfAllowed(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    const notification = new Notification(title, { icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', ...options });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}
