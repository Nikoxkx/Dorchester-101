'use client';

import { useEffect, useState } from 'react';

export type ScrollDirection = 'up' | 'down' | 'top';

/**
 * Tracks scroll direction for the iOS-26-style nav behavior:
 * the bar shrinks slightly scrolling down and expands scrolling up.
 * Uses rAF throttling; treats near-top as its own state.
 */
export function useScrollDirection(threshold = 8): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>('top');

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const delta = y - lastY;

      if (y < 24) {
        setDirection('top');
      } else if (delta > threshold) {
        setDirection('down');
        lastY = y;
      } else if (delta < -threshold) {
        setDirection('up');
        lastY = y;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return direction;
}
