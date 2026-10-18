'use client';

import { useSyncExternalStore } from 'react';
import { useResolvedPrefs } from '@/hooks/useResolvedPrefs';
import { SCENES } from '@/lib/scenes';

/**
 * Ambient scene decorations: the little animations that make a theme feel
 * like a place instead of a palette — bats crossing a Halloween sky,
 * snowfall, falling leaves, drifting sunset embers. Pure CSS keyframes
 * (globals.css `.scene-decor-*`), pointer-transparent, `aria-hidden`, and
 * completely absent for the Classic scene, for reduced-motion visitors,
 * and until the client has mounted (positions are seeded, but keeping the
 * server HTML clean avoids any flash of falling shapes over content).
 */

const subscribeNoop = () => () => {};

/** Deterministic pseudo-random spread, so every client renders the same sky. */
function seeded(count: number): Array<{ left: number; delay: number; duration: number; size: number; drift: number }> {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    const b = Math.sin(i * 269.5 + 183.3) * 28001.8384;
    const c = Math.sin(i * 113.5 + 271.9) * 12543.1234;
    return {
      left: (a - Math.floor(a)) * 100,
      delay: -((b - Math.floor(b)) * 24),
      duration: 14 + (c - Math.floor(c)) * 16,
      size: 0.7 + ((a * 7) % 1) * 0.7,
      drift: ((b * 5) % 1) * 60 - 30,
    };
  });
}

const BAT_PATH =
  'M12 10c-1-2-3-3-5-3C5 7 2 8 0 11c2-1 3-1 4 0 1-1 2-1 3 1 0 2 1 3 2 4l2-4c1-1 2-3 2-4zm0 0c1-2 3-3 5-3 2 0 5 1 7 4-2-1-3-1-4 0-1-1-2-1-3 1 0 2-1 3-2 4l-2-4c-1-1-2-3-2-4z';
const LEAF_PATH = 'M12 2C7 7 4 12 12 22c8-10 5-15 0-20zm0 18V6';
const FLAKE_PATH = 'M12 2v20M4 6l16 12M20 6L4 18M12 2l-2 3m2-3 2 3M12 22l-2-3m2 3 2-3';

export function SceneDecor() {
  const { scene, reduceMotion } = useResolvedPrefs();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const decor = SCENES[scene].decor;

  if (!mounted || decor === 'none' || reduceMotion) return null;

  const count = decor === 'snow' ? 26 : decor === 'bats' ? 7 : decor === 'leaves' ? 12 : 16;
  const items = seeded(count);

  return (
    <div className="scene-decor" aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={i}
          className={`scene-decor-item scene-decor-${decor}`}
          style={
            {
              left: `${it.left}%`,
              animationDelay: `${it.delay}s`,
              animationDuration: `${it.duration}s`,
              '--decor-size': `${it.size}rem`,
              '--decor-drift': `${it.drift}px`,
            } as React.CSSProperties
          }
        >
          {decor === 'bats' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d={BAT_PATH} /></svg>
          )}
          {decor === 'snow' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d={FLAKE_PATH} /></svg>
          )}
          {decor === 'leaves' && (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" opacity="0.9"><path d={LEAF_PATH} /></svg>
          )}
          {decor === 'embers' && <span className="scene-ember-dot" />}
        </span>
      ))}
    </div>
  );
}
