'use client';

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { moonPhase } from '@/lib/moon';
import { useReduceMotion } from '@/stores/appStore';
import type { ConditionKind, HourlyPeriod } from '@/lib/weather';

/**
 * The Apple-Weather-style visual language, drawn entirely from the live
 * payload: condition sky gradients, the daily temperature-range bar, a
 * smooth 24-hour temperature curve with precipitation bars, a sun-path arc,
 * and a wind compass. These are presentational only — every number comes
 * from `src/lib/weather.ts`, and each visual has a text equivalent beside
 * it (the same values in the hourly/daily lists), so nothing is
 * communicated by colour or shape alone.
 *
 * Sky colours are literal gradients on purpose: a weather sky is not a
 * theme token, the same way MBTA route colours on the map are literal hex.
 * Everything else (text, borders, chips) keeps using the site tokens, so
 * all twelve palettes still own the page around the sky.
 */

const SKY: Record<string, { day: string; night: string }> = {
  clear: { day: 'linear-gradient(160deg,#2E7CD6 0%,#5EA9E8 45%,#BFE0F7 100%)', night: 'linear-gradient(160deg,#0B1D3A 0%,#173A6B 55%,#2C5A96 100%)' },
  partly: { day: 'linear-gradient(160deg,#3E84C9 0%,#7FB3E3 55%,#D5E9F8 100%)', night: 'linear-gradient(160deg,#101E36 0%,#21406E 55%,#3A6498 100%)' },
  cloudy: { day: 'linear-gradient(160deg,#5B7A99 0%,#8FABc4 55%,#C7D6E4 100%)', night: 'linear-gradient(160deg,#16202E 0%,#2C4159 55%,#47617F 100%)' },
  fog: { day: 'linear-gradient(160deg,#7E93A8 0%,#AABDD0 60%,#D9E3EC 100%)', night: 'linear-gradient(160deg,#1A2530 0%,#33465A 60%,#546B82 100%)' },
  drizzle: { day: 'linear-gradient(160deg,#4E7CA8 0%,#7FA8CC 55%,#BCD3E8 100%)', night: 'linear-gradient(160deg,#122238 0%,#27476E 55%,#3F6A9C 100%)' },
  rain: { day: 'linear-gradient(160deg,#38618F 0%,#6390BE 55%,#A8C4E2 100%)', night: 'linear-gradient(160deg,#0D1D33 0%,#1F3D63 55%,#356091 100%)' },
  storm: { day: 'linear-gradient(160deg,#2E3E66 0%,#4C5F94 55%,#8296C4 100%)', night: 'linear-gradient(160deg,#0A1226 0%,#1C2A52 55%,#33477E 100%)' },
  snow: { day: 'linear-gradient(160deg,#6E93BC 0%,#A5C4E2 55%,#E3F0FB 100%)', night: 'linear-gradient(160deg,#17263E 0%,#2E4D74 55%,#4C76A6 100%)' },
  sleet: { day: 'linear-gradient(160deg,#5A7FA8 0%,#90B2D4 55%,#CEDFF2 100%)', night: 'linear-gradient(160deg,#14243B 0%,#2A4A72 55%,#45709F 100%)' },
  ice: { day: 'linear-gradient(160deg,#4A6E9B 0%,#7CA2C9 55%,#C2D8EF 100%)', night: 'linear-gradient(160deg,#10203A 0%,#25456E 55%,#3D6A9E 100%)' },
  wind: { day: 'linear-gradient(160deg,#3E8AB5 0%,#73B7D6 55%,#C4E6F2 100%)', night: 'linear-gradient(160deg,#0E2438 0%,#1F4A68 55%,#35708F 100%)' },
  unknown: { day: 'linear-gradient(160deg,#4A7FB5 0%,#84B2DC 55%,#CADEf4 100%)', night: 'linear-gradient(160deg,#12233C 0%,#26476F 55%,#3E699C 100%)' },
};

export function skyGradient(kind: ConditionKind, isDay: boolean): string {
  const pair = SKY[kind] ?? SKY.unknown;
  return isDay ? pair.day : pair.night;
}

/**
 * Which animated layers a condition gets. Pure so the mapping is testable:
 * a clear night must never rain, and a storm must always be allowed to
 * flicker. Densities are layer counts, tuned to stay decoration-quiet.
 */
export interface SkyLayers {
  sun: boolean;
  moon: boolean;
  stars: number;
  clouds: number;
  darkClouds: boolean;
  rain: number;
  snow: number;
  fog: number;
  flash: boolean;
  meteor: boolean;
}

export function skyLayers(kind: ConditionKind, isDay: boolean): SkyLayers {
  const base: SkyLayers = { sun: false, moon: false, stars: 0, clouds: 0, darkClouds: false, rain: 0, snow: 0, fog: 0, flash: false, meteor: false };
  switch (kind) {
    case 'clear':
      return isDay ? { ...base, sun: true, clouds: 1 } : { ...base, moon: true, stars: 42, clouds: 1, meteor: true };
    case 'partly':
      return isDay ? { ...base, sun: true, clouds: 3 } : { ...base, moon: true, stars: 22, clouds: 3, meteor: true };
    case 'cloudy':
      return { ...base, clouds: 5 };
    case 'fog':
      return { ...base, clouds: 2, fog: 4 };
    case 'drizzle':
      return { ...base, clouds: 4, rain: 14 };
    case 'rain':
      return { ...base, clouds: 4, darkClouds: true, rain: 34 };
    case 'storm':
      return { ...base, clouds: 5, darkClouds: true, rain: 30, flash: true };
    case 'snow':
      return { ...base, clouds: 3, snow: 30 };
    case 'sleet':
      return { ...base, clouds: 3, snow: 16, rain: 10 };
    case 'ice':
      return { ...base, clouds: 3, rain: 12 };
    case 'wind':
      return isDay ? { ...base, sun: true, clouds: 4 } : { ...base, moon: true, stars: 16, clouds: 4 };
    default:
      return isDay ? { ...base, sun: true, clouds: 2 } : { ...base, moon: true, stars: 18, clouds: 2 };
  }
}

const subscribeNoop = () => () => {};

/** Deterministic spread (same sky on every client, no hydration flicker). */
function seededSky(count: number, salt: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    const b = Math.sin(i * 269.5 + salt * 183.3) * 28001.8384;
    const c = Math.sin(i * 113.5 + salt * 271.9) * 12543.1234;
    const frac = (v: number) => v - Math.floor(v);
    return { x: frac(a) * 100, y: frac(b) * 62, d: -frac(c) * 26, dur: 2.6 + frac(a * 3) * 5, s: 0.6 + frac(b * 7) * 0.9 };
  });
}

/**
 * The living sky behind the weather modules: condition gradient + sun or
 * moon, twinkling stars, drifting clouds, falling rain/snow, fog bands and
 * a rare distant lightning flicker — the animated backdrop a phone
 * weather app is recognized by. Absolutely positioned; the parent owns
 * the clipping (`relative overflow-hidden`). Reduced motion gets the
 * still sky: gradient, sun/moon and clouds, nothing moving, no rain.
 */
export function SkyBackdrop({ kind, isDay }: { kind: ConditionKind; isDay: boolean }) {
  const reduceMotion = useReduceMotion();
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const layers = skyLayers(kind, isDay);
  const stars = useMemo(() => seededSky(layers.stars, 1), [layers.stars]);
  const drops = useMemo(() => seededSky(layers.rain, 2), [layers.rain]);
  const flakes = useMemo(() => seededSky(layers.snow, 3), [layers.snow]);
  const clouds = useMemo(() => seededSky(layers.clouds, 4), [layers.clouds]);

  return (
    <div className="wx-sky" style={{ background: skyGradient(kind, isDay) }} aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(130%_100%_at_85%_-15%,rgba(255,255,255,0.30),transparent_55%)]" />
      {layers.sun && <div className="wx-sky-sun-rays" />}
      {layers.sun && <div className="wx-sky-sun" />}
      {layers.moon && mounted && (
        <div className="wx-sky-moon">
          <MoonDisc fraction={moonPhase(new Date()).fraction} size={58} />
        </div>
      )}
      {layers.meteor && mounted && !reduceMotion && <span className="wx-sky-meteor" />}
      {mounted && stars.map((st, i) => (
        <span
          key={`star-${i}`}
          className="wx-sky-star"
          style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s * 2.4, height: st.s * 2.4, animationDelay: `${st.d}s`, animationDuration: `${st.dur}s` }}
        />
      ))}
      {clouds.map((c, i) => (
        <span
          key={`cloud-${i}`}
          className={`wx-sky-cloud${layers.darkClouds ? ' dark-cloud' : ''}`}
          style={{
            left: `${(c.x * 0.82).toFixed(1)}%`,
            top: `${(c.y * 0.5).toFixed(1)}%`,
            width: `${9 + c.s * 9}rem`,
            height: `${2.6 + c.s * 2.2}rem`,
            opacity: 0.5 + c.s * 0.3,
            animationDelay: `${c.d}s`,
            animationDuration: `${46 + c.dur * 9}s`,
            animationDirection: i % 2 ? 'alternate-reverse' : 'alternate',
          }}
        />
      ))}
      {mounted && !reduceMotion && drops.map((d, i) => (
        <span key={`rain-${i}`} className="wx-sky-rain" style={{ left: `${d.x}%`, animationDelay: `${d.d}s`, animationDuration: `${0.85 + d.s * 0.5}s` }} />
      ))}
      {mounted && !reduceMotion && flakes.map((f, i) => (
        <span
          key={`snow-${i}`}
          className="wx-sky-snowflake"
          style={{ left: `${f.x}%`, animationDelay: `${f.d}s`, animationDuration: `${5.5 + f.s * 4.5}s`, ['--wx-flake' as string]: `${0.3 + f.s * 0.3}rem` } as React.CSSProperties}
        />
      ))}
      {Array.from({ length: layers.fog }, (_, i) => (
        <span key={`fog-${i}`} className="wx-sky-fogband" style={{ top: `${34 + i * 15}%`, animationDelay: `${-i * 3.7}s`, animationDuration: `${11 + i * 3}s` }} />
      ))}
      {layers.flash && !reduceMotion && <div className="wx-sky-flash" />}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/14 to-transparent" />
    </div>
  );
}


/** Blue→green→yellow→orange→red, the scale every weather app reader knows. */
const TEMP_GRADIENT = 'linear-gradient(90deg,#3E8BDC 0%,#4FBE8C 35%,#F6D34A 62%,#F59A3C 82%,#E4572E 100%)';

/** One day's range placed inside the week's full range (Apple's 10-day row). */
export function TempRangeBar({
  low,
  high,
  weekLow,
  weekHigh,
  current,
}: {
  low: number;
  high: number;
  weekLow: number;
  weekHigh: number;
  /** A "you are here" dot, only on today's row. */
  current?: number;
}) {
  const span = Math.max(1, weekHigh - weekLow);
  const startPct = ((low - weekLow) / span) * 100;
  const widthPct = Math.max(3, ((high - low) / span) * 100);
  const dotPct = current !== undefined ? Math.min(100, Math.max(0, ((current - weekLow) / span) * 100)) : null;
  return (
    <span className="relative block h-1.5 w-full min-w-[5.5rem] rounded-full bg-[var(--color-bg-tertiary)]" aria-hidden="true">
      <span className="absolute inset-y-0 rounded-full" style={{ left: `${startPct}%`, width: `${widthPct}%`, background: TEMP_GRADIENT, backgroundSize: `${10000 / Math.max(1, widthPct)}% 100%`, backgroundPosition: `${startPct}% 0` }} />
      {dotPct !== null && (
        <span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--color-text-primary)] shadow" style={{ left: `${dotPct}%` }} />
      )}
    </span>
  );
}

/**
 * The width the chart is actually painted at, in CSS pixels. The first
 * version stretched a 720-wide viewBox into whatever box it landed in
 * (`preserveAspectRatio="none"`), which squished the curve AND the text
 * on phones. Now the SVG is drawn 1:1 at the measured container width —
 * and never narrower than 540px, scrolling sideways instead of
 * compressing, the way the Apple hourly graph behaves.
 */
const CURVE_H = 168;
const CURVE_PAD = { top: 26, bottom: 34, left: 14, right: 14 } as const;

function useElementWidth(min = 540): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(min);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) setWidth(Math.max(min, Math.floor(w)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [min]);
  return [ref, width];
}

/** Smooth 24-hour temperature curve (Catmull-Rom → bezier), true-scale. */
export function TempCurve({
  hours,
  labelFor,
  timeFor,
}: {
  hours: HourlyPeriod[];
  labelFor: (tempF: number) => string;
  timeFor?: (iso: string) => string;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [boxRef, width] = useElementWidth(540);
  // Apple-Weather scrubbing: hover/pen glides a crosshair along the curve,
  // a tap or click pins the readout, arrow keys walk it hour by hour.
  const [active, setActive] = useState<number | null>(null);
  const [pinned, setPinned] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);
  const reduceMotion = useReduceMotion();
  const [drawnIn, setDrawnIn] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    const id = requestAnimationFrame(() => setDrawnIn(true));
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);

  const drawn = useMemo(() => {
    if (hours.length < 2) return null;
    const temps = hours.map((h) => h.tempF);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const span = Math.max(1, max - min);
    const x = (i: number) => CURVE_PAD.left + (i / (hours.length - 1)) * (width - CURVE_PAD.left - CURVE_PAD.right);
    const y = (temp: number) =>
      CURVE_PAD.top + (1 - (temp - min + span * 0.15) / (span * 1.3)) * (CURVE_H - CURVE_PAD.top - CURVE_PAD.bottom);
    const coords = temps.map((temp, i) => ({ x: x(i), y: y(temp), temp }));
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[Math.max(0, i - 1)];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[Math.min(coords.length - 1, i + 2)];
      d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
    }
    return { d, coords, min, max, minIdx: temps.indexOf(min), maxIdx: temps.indexOf(max) };
  }, [hours, width]);

  if (!drawn) return null;
  const { d, coords, min, max, minIdx, maxIdx } = drawn;
  const n = hours.length;

  const indexFromPointer = (e: React.PointerEvent<HTMLDivElement>): number => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left + el.scrollLeft;
    const ratio = (px - CURVE_PAD.left) / Math.max(1, width - CURVE_PAD.left - CURVE_PAD.right);
    return Math.round(Math.min(1, Math.max(0, ratio)) * (n - 1));
  };

  const activeHour = active != null ? hours[active] : null;
  const activeCoord = active != null ? coords[active] : null;
  const readout = activeHour && timeFor
    ? `${timeFor(activeHour.start)} · ${labelFor(activeHour.tempF)}${activeHour.precipChance != null ? ` · ${activeHour.precipChance}%` : ''} · ${activeHour.shortForecast}`
    : activeHour
      ? `${labelFor(activeHour.tempF)} · ${activeHour.shortForecast}`
      : '';

  return (
    <div className="relative">
      <div
        ref={boxRef}
        role="slider"
        tabIndex={0}
        aria-label={`${labelFor(min)} – ${labelFor(max)}`}
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={active ?? 0}
        aria-valuetext={readout}
        className="cursor-crosshair overflow-x-auto pb-1 outline-none [scrollbar-width:thin] focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] rounded-lg"
        onScroll={(e) => { setScrollLeft(e.currentTarget.scrollLeft); setViewWidth(e.currentTarget.clientWidth); }}
        onPointerMove={(e) => {
          if (e.pointerType === 'touch' || pinned) return;
          setViewWidth(e.currentTarget.clientWidth);
          setActive(indexFromPointer(e));
        }}
        onPointerDown={(e) => {
          setViewWidth(e.currentTarget.clientWidth);
          const idx = indexFromPointer(e);
          if (pinned && idx === active) {
            setPinned(false);
            setActive(null);
          } else {
            setActive(idx);
            setPinned(true);
          }
        }}
        onPointerLeave={() => {
          if (!pinned) setActive(null);
        }}
        onKeyDown={(e) => {
          if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
          e.preventDefault();
          const dir = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : -1;
          setPinned(true);
          setActive((cur) => Math.min(n - 1, Math.max(0, (cur ?? 0) + dir)));
        }}
      >
        <svg width={width} height={CURVE_H} viewBox={`0 0 ${width} ${CURVE_H}`} className="block" aria-hidden="true">
          <defs>
            <linearGradient id={`tc-fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.26" />
              <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id={`tc-line-${gid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3E8BDC" />
              <stop offset="45%" stopColor="var(--color-accent-primary)" />
              <stop offset="100%" stopColor="#F59A3C" />
            </linearGradient>
          </defs>
          <path className={`wx-curve-fill${drawnIn || reduceMotion ? ' is-on' : ''}`} d={`${d} L ${coords[coords.length - 1].x} ${CURVE_H - CURVE_PAD.bottom} L ${coords[0].x} ${CURVE_H - CURVE_PAD.bottom} Z`} fill={`url(#tc-fill-${gid})`} />
          <path className={`wx-curve-line${drawnIn || reduceMotion ? ' is-on' : ''}`} pathLength={1} d={d} fill="none" stroke={`url(#tc-line-${gid})`} strokeWidth="3" strokeLinecap="round" />
          {coords.map((c, i) =>
            i % 3 === 0 || i === minIdx || i === maxIdx ? (
              <g key={i}>
                <circle cx={c.x} cy={c.y} r={i === minIdx || i === maxIdx ? 4.5 : 3} fill="var(--color-bg-card)" stroke="var(--color-accent-primary)" strokeWidth="2" />
                <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="12.5" fontWeight={i === minIdx || i === maxIdx ? 800 : 650} fill="var(--color-text-primary)">
                  {labelFor(c.temp)}
                </text>
                {timeFor && (
                  <text x={c.x} y={CURVE_H - 12} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">
                    {timeFor(hours[i].start)}
                  </text>
                )}
              </g>
            ) : null
          )}
          {activeCoord && (
            <g className="transition-all duration-100">
              <line x1={activeCoord.x} x2={activeCoord.x} y1={CURVE_PAD.top - 14} y2={CURVE_H - CURVE_PAD.bottom} stroke="var(--color-accent-primary)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.75" />
              <circle cx={activeCoord.x} cy={activeCoord.y} r="9" fill="var(--color-accent-primary)" opacity="0.18" />
              <circle cx={activeCoord.x} cy={activeCoord.y} r="5" fill="var(--color-accent-primary)" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>

      {activeHour && activeCoord && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-[var(--color-text-primary)] px-2.5 py-1.5 text-center text-[var(--color-bg-primary)] shadow-[var(--shadow-lg)]"
          style={{ left: Math.min(Math.max(activeCoord.x - scrollLeft, 64), Math.max(64, (viewWidth || width) - 64)) }}
        >
          <span className="block whitespace-nowrap font-heading text-[13px] font-extrabold leading-tight">
            {timeFor ? timeFor(activeHour.start) : ''} · {labelFor(activeHour.tempF)}
          </span>
          <span className="block max-w-[11rem] truncate text-[10px] font-medium opacity-85">
            {activeHour.shortForecast}
            {activeHour.precipChance != null && activeHour.precipChance > 0 ? ` · ${activeHour.precipChance}%` : ''}
          </span>
        </div>
      )}
      <span className="sr-only" role="status">{readout}</span>
    </div>
  );
}

/** Precipitation probability, hour by hour, as Apple-style bars. */
export function PrecipBars({ hours, timeFor, labelFor }: { hours: HourlyPeriod[]; timeFor: (iso: string) => string; labelFor?: (tempF: number) => string }) {
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReduceMotion();
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, [reduceMotion]);
  if (!hours.length) return null;
  const activeHour = active != null ? hours[active] : null;
  return (
    <div>
      <p role="status" className="mb-1 h-5 font-heading text-xs font-bold text-[var(--color-accent-primary)]">
        {activeHour
          ? `${timeFor(activeHour.start)} · ${activeHour.precipChance ?? 0}%${labelFor ? ` · ${labelFor(activeHour.tempF)}` : ''} · ${activeHour.shortForecast}`
          : ''}
      </p>
      <div className="overflow-x-auto pb-1 [scrollbar-width:thin]" onPointerLeave={() => setActive(null)}>
        <div className="min-w-[540px]">
          <div className="flex h-24 items-end gap-[3px]">
            {hours.map((h, i) => {
              const pct = Math.max(0, Math.min(100, h.precipChance ?? 0));
              const isActive = i === active;
              return (
                <button
                  key={h.start}
                  type="button"
                  aria-label={`${timeFor(h.start)}: ${pct}%`}
                  aria-pressed={isActive}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'touch') setActive(i);
                  }}
                  onClick={() => setActive(isActive ? null : i)}
                  onFocus={() => setActive(i)}
                  className={`flex h-full flex-1 flex-col items-center justify-end gap-1 rounded-t-md px-px transition-colors ${isActive ? 'bg-[var(--color-accent-primary)]/12' : 'hover:bg-[var(--color-bg-tertiary)]'}`}
                >
                  <span className={`text-[9px] font-semibold leading-none ${isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-accent-primary)]'}`}>{pct >= 20 || isActive ? `${pct}%` : ''}</span>
                  <span
                    className="w-full rounded-t bg-[var(--color-accent-primary)] transition-[height,opacity] duration-500 ease-out"
                    style={{
                      height: `${grown || reduceMotion ? Math.max(3, (pct / 100) * 64) + (isActive ? 4 : 0) : 2}px`,
                      opacity: isActive ? 1 : 0.35 + pct / 154,
                      transitionDelay: `${Math.min(i * 18, 420)}ms`,
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex gap-[3px]" aria-hidden="true">
            {hours.map((h, i) => (
              <span key={h.start} className={`flex-1 whitespace-nowrap text-center text-[10px] leading-none ${i === active ? 'font-bold text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                {i % 3 === 0 || i === active ? timeFor(h.start) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The sun's path today, with the current position if it is above the horizon. */
/**
 * Tonight's moon, drawn true: the lit region is the real terminator
 * geometry for `fraction` (0 = new, 0.5 = full) — a semicircle limb plus
 * the terminator semi-ellipse whose width is r·|cos 2πf|. Northern-
 * hemisphere view (waxing lit on the right), craters clipped to the lit
 * face, the dark side left as faint earthshine so crescents still read
 * as a whole moon. Decorative: the words next to it carry the facts.
 */
export function MoonDisc({ fraction, size = 44 }: { fraction: number; size?: number }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const clipId = `moonlit-${rawId}`;
  const gradId = `moongrad-${rawId}`;
  const r = 19;
  const c = 20;
  const cos = Math.cos(2 * Math.PI * fraction);
  const rx = Math.max(0.01, Math.abs(cos) * r);
  const waxing = fraction < 0.5;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (cos >= 0 ? 0 : 1) : cos >= 0 ? 1 : 0;
  const lit = `M ${c} ${c - r} A ${r} ${r} 0 0 ${limbSweep} ${c} ${c + r} A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${c} ${c - r} Z`;
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" className="block">
      <defs>
        <radialGradient id={gradId} cx="38%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor="#E9EFF8" />
          <stop offset="100%" stopColor="#C2D2E6" />
        </radialGradient>
        <clipPath id={clipId}>
          <path d={lit} />
        </clipPath>
      </defs>
      <circle cx={c} cy={c} r={r} fill="rgba(13, 22, 42, 0.5)" />
      <path d={lit} fill={`url(#${gradId})`} />
      <g clipPath={`url(#${clipId})`} fill="rgba(148, 166, 196, 0.38)">
        <circle cx="15" cy="14" r="3.1" />
        <circle cx="24.5" cy="21" r="2.2" />
        <circle cx="17.5" cy="27" r="1.7" />
        <circle cx="26" cy="11.5" r="1.3" />
      </g>
      <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.7" />
    </svg>
  );
}

const ARC_W = 260;
const ARC_H = 92;
const ARC_R = 108;

/** A point on the sun/moon arc as container percentages, for overlays. */
export function sunArcPoint(frac: number): { xPct: number; yPct: number } {
  const clamped = Math.min(1, Math.max(0, frac));
  const angle = Math.PI * (1 - clamped);
  const x = ARC_W / 2 + ARC_R * Math.cos(angle);
  const y = ARC_H - 8 - ARC_R * Math.sin(angle);
  return { xPct: (x / ARC_W) * 100, yPct: (y / ARC_H) * 100 };
}

/**
 * The sun's path today: a dawn-to-dusk gradient arc that draws itself in,
 * the travelled part solid, the rest dashed, and the sun riding it with a
 * pulsing halo and slowly turning rays. Below the horizon the arc dims —
 * the caller (SunMoonCycle) puts the moon on the same path at night.
 */
export function SunArc({ sunrise, sunset, nowMs }: { sunrise: string; sunset: string; nowMs: number }) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (Number.isNaN(rise) || Number.isNaN(set) || set <= rise) return null;
  const frac = (nowMs - rise) / (set - rise);
  const W = ARC_W;
  const H = ARC_H;
  const cx = W / 2;
  const cy = H - 8;
  const r = ARC_R;
  const up = frac >= 0 && frac <= 1;
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, frac)));
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);
  const daylightMin = Math.round((set - rise) / 60_000);
  const travelled = up ? `M ${cx - r} ${cy} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${sunX.toFixed(1)} ${sunY.toFixed(1)}` : null;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`${Math.floor(daylightMin / 60)}h ${daylightMin % 60}m`}>
        <defs>
          <linearGradient id={`sunarc-${gid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF9A56" />
            <stop offset="50%" stopColor="#FFC93B" />
            <stop offset="100%" stopColor="#FF7E47" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--color-border-strong)"
          strokeWidth="2"
          strokeDasharray="3 5"
          strokeLinecap="round"
          opacity={up ? 0.65 : 0.35}
        />
        <line x1="6" y1={cy} x2={W - 6} y2={cy} stroke="var(--color-border)" strokeWidth="1.5" />
        <circle cx={cx - r} cy={cy} r="2.6" fill="#FF9A56" opacity="0.9" />
        <circle cx={cx + r} cy={cy} r="2.6" fill="#FF7E47" opacity="0.9" />
        {travelled && (
          <path
            d={travelled}
            fill="none"
            stroke={`url(#sunarc-${gid})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            pathLength={1}
            className={`wx-arc-draw${mounted ? ' is-on' : ''}`}
          />
        )}
        {up && (
          <>
            <circle className="wx-sun-pulse" cx={sunX} cy={sunY} r="12" fill="#F6B93B" opacity="0.3" />
            <g className="wx-arc-rays" stroke="#F6B93B" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <line
                    key={deg}
                    x1={sunX + 8.5 * Math.cos(rad)}
                    y1={sunY + 8.5 * Math.sin(rad)}
                    x2={sunX + 12 * Math.cos(rad)}
                    y2={sunY + 12 * Math.sin(rad)}
                  />
                );
              })}
            </g>
            <circle cx={sunX} cy={sunY} r="6" fill="#FFD34D" stroke="#D9930D" strokeWidth="1.4" />
          </>
        )}
      </svg>
    </div>
  );
}

const COMPASS_DEG: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
};

/** Wind direction dial; the arrow points where the wind is going. */
export function WindCompass({ dir, speedText }: { dir: string | null; speedText: string }) {
  const from = dir ? COMPASS_DEG[dir.toUpperCase()] : undefined;
  // Meteorological direction is "from"; the air moves toward the opposite side.
  const towards = from !== undefined ? (from + 180) % 360 : 0;
  return (
    <svg viewBox="0 0 96 96" className="h-24 w-24" role="img" aria-label={speedText}>
      <circle cx="48" cy="48" r="42" fill="none" stroke="var(--color-border)" strokeWidth="2" />
      {['N', 'E', 'S', 'W'].map((label, i) => {
        const a = (i * Math.PI) / 2;
        const x = 48 + 33 * Math.sin(a);
        const y = 48 - 33 * Math.cos(a) + 4;
        return (
          <text key={label} x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--color-text-muted)">
            {label}
          </text>
        );
      })}
      <g transform={`rotate(${towards} 48 48)`}>
        <path d="M48 16 L54 44 L48 39 L42 44 Z" fill="var(--color-accent-primary)" />
        <line x1="48" y1="44" x2="48" y2="76" stroke="var(--color-accent-primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      </g>
      <circle cx="48" cy="48" r="4" fill="var(--color-text-muted)" />
    </svg>
  );
}
