'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * useRealtime — client side of the push channel.
 *
 * One shared EventSource per page (module singleton). On repeated failure or
 * when offline, degrades gracefully to interval polling of /api/notifications
 * — that is the Electron-offline and flaky-network path. Components subscribe
 * per event type; the hook exists to manage the connection, not the data.
 */

export type RealtimeStatus = 'connecting' | 'live' | 'polling' | 'offline';

export type RealtimeEventHandler = (payload: Record<string, unknown>) => void;

interface RealtimeState {
  status: RealtimeStatus;
  lastEventAt: string | null;
}

const POLL_FALLBACK_MS = 60_000;

// Module-level singleton so ten components share one connection.
let source: EventSource | null = null;
let refCount = 0;
const handlers = new Map<RealtimeEventHandler, { types: Set<string>; fn: RealtimeEventHandler }>();
const statusListeners = new Set<(s: RealtimeState) => void>();

let status: RealtimeState = { status: 'connecting', lastEventAt: null };
let failures = 0;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let fallbackFetchInFlight = false;

function setStatus(patch: Partial<RealtimeState>) {
  status = { ...status, ...patch };
  for (const fn of statusListeners) fn(status);
}

function dispatch(type: string, payload: Record<string, unknown>) {
  setStatus({ lastEventAt: new Date().toISOString() });
  for (const { types, fn } of handlers.values()) {
    if (types.has(type)) fn(payload);
  }
}

function connect() {
  if (typeof window === 'undefined' || source) return;
  if (!window.navigator.onLine) {
    startPolling();
    return;
  }

  try {
    source = new EventSource('/api/notifications/stream');
  } catch {
    startPolling();
    return;
  }

  const onOpen = () => {
    failures = 0;
    stopPolling();
    setStatus({ status: 'live' });
  };
  const onMbta = (e: MessageEvent) => dispatch('mbta', JSON.parse(e.data));
  const onNews = (e: MessageEvent) => dispatch('news', JSON.parse(e.data));
  const onData = (e: MessageEvent) => dispatch('data', JSON.parse(e.data));
  const onSnapshot = (e: MessageEvent) => {
    onOpen();
    dispatch('notifications', JSON.parse(e.data));
  };
  const onError = () => {
    failures += 1;
    if (failures >= 3 || (source?.readyState ?? 0) === EventSource.CLOSED) {
      source?.close();
      source = null;
      startPolling();
      // Retry SSE occasionally in case the network recovered.
      setTimeout(() => {
        if (pollTimer) {
          if (window.navigator.onLine) {
            stopPolling();
            connect();
          }
        }
      }, POLL_FALLBACK_MS * 5);
    }
  };

  source.addEventListener('open', onOpen);
  source.addEventListener('snapshot', onSnapshot);
  source.addEventListener('mbta', onMbta);
  source.addEventListener('news', onNews);
  source.addEventListener('data', onData);
  source.addEventListener('error', onError);
}

function startPolling() {
  if (pollTimer || typeof window === 'undefined') return;
  setStatus({ status: window.navigator.onLine ? 'polling' : 'offline' });
  pollTimer = setInterval(async () => {
    if (fallbackFetchInFlight) return;
    fallbackFetchInFlight = true;
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as { notifications?: unknown };
        dispatch('notifications', { notifications: json.notifications ?? [] });
        setStatus({ status: 'polling' });
      }
    } catch {
      setStatus({ status: 'offline' });
    } finally {
      fallbackFetchInFlight = false;
    }
  }, POLL_FALLBACK_MS);
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function useRealtime(onEvent?: RealtimeEventHandler, types: string[] = ['mbta', 'news', 'data', 'notifications']) {
  const [state, setState] = useState<RealtimeState>(status);
  const handlerRef = useRef<RealtimeEventHandler | undefined>(onEvent);

  useEffect(() => {
    handlerRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    statusListeners.add(setState);

    let entry: { types: Set<string>; fn: RealtimeEventHandler } | null = null;
    if (onEvent) {
      entry = {
        types: new Set(types),
        fn: (payload) => handlerRef.current?.(payload),
      };
      handlers.set(entry.fn, entry);
    }

    refCount += 1;
    connect();

    const onOnline = () => {
      if (!source) {
        stopPolling();
        connect();
      }
    };
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener('online', onOnline);
      if (entry) handlers.delete(entry.fn);
      refCount -= 1;
      if (refCount <= 0) {
        source?.close();
        source = null;
        stopPolling();
      }
      statusListeners.delete(setState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
