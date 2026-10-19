/**
 * Moon phase math — the one piece of the sky no API needs to ship.
 *
 * The lunar cycle is deterministic astronomy: from a known new moon
 * (2000-01-06 18:14 UTC) and the mean synodic month (29.530588853 days),
 * the moon's age, illuminated fraction and phase name follow for any
 * instant, the same way sunrise tables do. Accuracy is a few hours over
 * decades — more than enough to draw tonight's moon honestly. (Rise/set
 * times need the moon's actual position, so they are deliberately not
 * computed here; the UI shows the phase, never invented times.)
 */

export const SYNODIC_MONTH_DAYS = 29.530588853;

/** A well-documented new moon: 2000-01-06 18:14 UTC. */
const NEW_MOON_EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14);

const DAY_MS = 86_400_000;

export interface MoonPhase {
  /** Position in the cycle, 0 = new moon, 0.5 = full moon, →1 = new again. */
  fraction: number;
  /** Days since the last new moon (0 … 29.53). */
  ageDays: number;
  /** Lit fraction of the disc as seen from Earth, 0…1. */
  illumination: number;
  /** True while the lit part is growing (new → full). */
  waxing: boolean;
  /** 0 new · 1 waxing crescent · 2 first quarter · 3 waxing gibbous ·
   *  4 full · 5 waning gibbous · 6 last quarter · 7 waning crescent. */
  phaseIndex: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function moonPhase(date: Date): MoonPhase {
  const days = (date.getTime() - NEW_MOON_EPOCH_MS) / DAY_MS;
  const cycles = days / SYNODIC_MONTH_DAYS;
  const fraction = cycles - Math.floor(cycles);
  const ageDays = fraction * SYNODIC_MONTH_DAYS;
  // The terminator sweeps as a cosine: dark at new, half at quarters, lit at full.
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const phaseIndex = (Math.round(fraction * 8) % 8) as MoonPhase['phaseIndex'];
  return { fraction, ageDays, illumination, waxing: fraction < 0.5, phaseIndex };
}

/** The next instant the cycle crosses `target` (0 = new, 0.5 = full). */
function nextCrossing(date: Date, target: number): Date {
  const { fraction } = moonPhase(date);
  let delta = target - fraction;
  if (delta <= 0) delta += 1;
  return new Date(date.getTime() + delta * SYNODIC_MONTH_DAYS * DAY_MS);
}

export const nextFullMoon = (date: Date): Date => nextCrossing(date, 0.5);
export const nextNewMoon = (date: Date): Date => nextCrossing(date, 0);

/** i18n keys for the eight named phases, in cycle order. */
export const MOON_PHASE_KEYS = [
  'weather.moon.new',
  'weather.moon.waxingCrescent',
  'weather.moon.firstQuarter',
  'weather.moon.waxingGibbous',
  'weather.moon.full',
  'weather.moon.waningGibbous',
  'weather.moon.lastQuarter',
  'weather.moon.waningCrescent',
] as const;
