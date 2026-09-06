'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAppStore } from '@/stores/appStore';

/**
 * One `aria-live` region for the whole app.
 *
 * Screen readers only announce changes inside a region that existed *before*
 * the change, so the region mounts with the document and the text is swapped in.
 * Two elements, not one, because a failed refresh and a "3 new stories" note
 * genuinely differ in urgency: `assertive` interrupts, `polite` waits.
 *
 * The visitor's "Announce updates" switch is honoured here rather than at each
 * call site, so a person who turned it off is silent everywhere at once.
 */

interface LiveRegionApi {
  announce: (message: string, politeness?: 'polite' | 'assertive') => void;
  clear: () => void;
  enabled: boolean;
}

const LiveRegionContext = createContext<LiveRegionApi>({
  announce: () => {},
  clear: () => {},
  enabled: true,
});

const LINGER_MS = 6000;

export function LiveRegionProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const enabled = useAppStore((s) => s.accessibility.announceUpdates);
  const lastAnnouncement = useAppStore((s) => s.lastAnnouncement);
  const seenId = useRef(0);
  const timer = useRef<number | null>(null);

  const push = useCallback(
    (message: string, politeness: 'polite' | 'assertive') => {
      if (!message.trim()) return;
      // Clear first: an identical string written twice is not a change, and
      // some screen readers then say nothing at all.
      setPolite('');
      setAssertive('');
      if (timer.current) window.clearTimeout(timer.current);
      window.setTimeout(() => {
        if (politeness === 'assertive') setAssertive(message);
        else setPolite(message);
        timer.current = window.setTimeout(() => {
          setPolite('');
          setAssertive('');
        }, LINGER_MS);
      }, 60);
    },
    []
  );

  const announce = useCallback(
    (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
      if (!enabled) return;
      push(message, politeness);
    },
    [enabled, push]
  );

  // Anything that called `useAppStore.getState().announce(...)` lands here.
  useEffect(() => {
    if (!lastAnnouncement || lastAnnouncement.id === seenId.current) return;
    seenId.current = lastAnnouncement.id;
    if (!enabled) return;
    // Defer one tick: screen readers need the region to be empty then filled,
    // and React's lint rule (rightly) flags a synchronous setState in an effect.
    const id = window.setTimeout(() => push(lastAnnouncement.message, lastAnnouncement.politeness), 0);
    return () => window.clearTimeout(id);
  }, [lastAnnouncement, enabled, push]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const value = useMemo<LiveRegionApi>(
    () => ({
      announce,
      clear: () => {
        setPolite('');
        setAssertive('');
      },
      enabled,
    }),
    [announce, enabled]
  );

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {polite}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {assertive}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useLiveRegion(): LiveRegionApi {
  return useContext(LiveRegionContext);
}

/** `const announce = useAnnounce(); announce(t('settings.refreshed'))` */
export function useAnnounce() {
  return useLiveRegion().announce;
}
