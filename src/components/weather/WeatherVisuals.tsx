'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
          <path d={`${d} L ${coords[coords.length - 1].x} ${CURVE_H - CURVE_PAD.bottom} L ${coords[0].x} ${CURVE_H - CURVE_PAD.bottom} Z`} fill={`url(#tc-fill-${gid})`} />
          <path d={d} fill="none" stroke={`url(#tc-line-${gid})`} strokeWidth="3" strokeLinecap="round" />
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
                    className="w-full rounded-t bg-[var(--color-accent-primary)] transition-all duration-150"
                    style={{ height: `${Math.max(3, (pct / 100) * 64) + (isActive ? 4 : 0)}px`, opacity: isActive ? 1 : 0.35 + pct / 154 }}
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
export function SunArc({ sunrise, sunset, nowMs }: { sunrise: string; sunset: string; nowMs: number }) {
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (Number.isNaN(rise) || Number.isNaN(set) || set <= rise) return null;
  const frac = (nowMs - rise) / (set - rise);
  const W = 260;
  const H = 92;
  const cx = W / 2;
  const cy = H - 8;
  const r = 108;
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, frac)));
  const sunX = cx + r * Math.cos(angle);
  const sunY = cy - r * Math.sin(angle);
  const daylightMin = Math.round((set - rise) / 60_000);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${Math.floor(daylightMin / 60)}h ${daylightMin % 60}m`} style={{ height: 84 }}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--color-border-strong)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
        <line x1="6" y1={cy} x2={W - 6} y2={cy} stroke="var(--color-border)" strokeWidth="1.5" />
        {frac >= 0 && frac <= 1 && (
          <>
            <circle cx={sunX} cy={sunY} r="11" fill="#F6B93B" opacity="0.3" />
            <circle cx={sunX} cy={sunY} r="6" fill="#F6B93B" stroke="#D9930D" strokeWidth="1.4" />
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
