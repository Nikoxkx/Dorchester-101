'use client';

import { useEffect, useRef, useState } from 'react';
import { useReduceMotion } from '@/stores/appStore';

/**
 * Counts toward `value` with an ease-out curve — the way a phone weather
 * app lands on its big temperature instead of snapping to it. Animates
 * from whatever is on screen now, so a unit toggle or a fresh payload
 * glides rather than jumps. Reduced motion renders the value instantly.
 */
export function useAnimatedNumber(value: number, durationMs = 750): number {
  const reduceMotion = useReduceMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduceMotion || typeof window === 'undefined') {
      // No state sync needed: the return below reads `value` directly
      // whenever motion is reduced.
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    if (from === value) return;
    const start = performance.now();
    const tick = (nowMs: number) => {
      const t = Math.min(1, (nowMs - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (value - from) * eased;
      fromRef.current = current;
      setDisplay(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, durationMs, reduceMotion]);

  return reduceMotion ? value : display;
}
