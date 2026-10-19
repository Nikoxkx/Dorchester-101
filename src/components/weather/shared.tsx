'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudHail,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Footprints,
  Hand,
  Layers,
  Moon,
  Shirt,
  Snowflake,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Umbrella,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { fToC, type ConditionKind, type StyleTip, type TipKind } from '@/lib/weather';
import type { TranslationKey } from '@/i18n/en';

/**
 * Shared weather presentation: the °F/°C choice, temperature text, condition
 * and tip icons, and the tip sentence builder. One copy, so the homepage
 * the homepage panel and the weather page cannot drift apart.
 */

export type TempUnit = 'F' | 'C';
const UNIT_KEY = 'dor101-temp-unit';

const unitListeners = new Set<() => void>();
function readStoredUnit(): TempUnit {
  try {
    return window.localStorage.getItem(UNIT_KEY) === 'C' ? 'C' : 'F';
  } catch {
    return 'F';
  }
}

/**
 * Boston defaults to °F; the choice is the visitor's and sticks on device.
 * An external store (not an effect) so the server render says °F, the first
 * client render reads the saved unit without a hydration mismatch, and the
 * panel, pop-up and weather page all flip together.
 */
export function useTempUnit(): [TempUnit, (unit: TempUnit) => void] {
  const unit = useSyncExternalStore(
    useCallback((onChange: () => void) => {
      unitListeners.add(onChange);
      window.addEventListener('storage', onChange);
      return () => {
        unitListeners.delete(onChange);
        window.removeEventListener('storage', onChange);
      };
    }, []),
    readStoredUnit,
    () => 'F' as TempUnit
  );
  const choose = useCallback((next: TempUnit) => {
    try {
      window.localStorage.setItem(UNIT_KEY, next);
    } catch {
      /* private mode; listeners still carry it for this session */
    }
    unitListeners.forEach((notify) => notify());
  }, []);
  return [unit, choose];
}

export function tempText(tempF: number, unit: TempUnit, formatNumber: (v: number) => string): string {
  return unit === 'F' ? `${formatNumber(Math.round(tempF))}°F` : `${formatNumber(Math.round(fToC(tempF)))}°C`;
}

export function TempUnitToggle({ unit, onChange }: { unit: TempUnit; onChange: (u: TempUnit) => void }) {
  return (
    <span className="inline-flex overflow-hidden rounded-full border border-[var(--color-border)] text-[11px] font-heading font-bold" role="group" aria-label="Temperature unit">
      {(['F', 'C'] as const).map((u) => (
        <button
          key={u}
          type="button"
          aria-pressed={unit === u}
          onClick={() => onChange(u)}
          className={
            unit === u
              ? 'bg-[var(--color-accent-primary)] px-2 py-1 text-white'
              : 'bg-[var(--color-bg-raised)] px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
          }
        >
          °{u}
        </button>
      ))}
    </span>
  );
}

const COND_ICON_DAY: Record<ConditionKind, LucideIcon> = {
  clear: Sun,
  partly: CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  sleet: CloudHail,
  ice: CloudHail,
  wind: Wind,
  unknown: Cloud,
};

export function ConditionIcon({ kind, isDay, className, animated = false }: { kind: ConditionKind; isDay: boolean; className?: string; animated?: boolean }) {
  const Icon = !isDay && kind === 'clear' ? Moon : !isDay && kind === 'partly' ? CloudMoon : COND_ICON_DAY[kind];
  const icon = <Icon className={className ?? 'h-5 w-5'} aria-hidden="true" />;
  if (!animated) return icon;
  return (
    <span className={`wx-cond wx-cond-animated wx-cond-${kind}`} aria-hidden="true">
      {icon}
    </span>
  );
}

export const TIP_ICON: Record<TipKind, LucideIcon> = {
  heavyCoat: ThermometerSnowflake,
  coat: Shirt,
  lightJacket: Shirt,
  layers: Layers,
  hatGloves: Hand,
  windbreaker: Wind,
  umbrella: Umbrella,
  rainShell: CloudRain,
  waterproofShoes: Footprints,
  snowBoots: Footprints,
  heatLight: ThermometerSun,
  sunHat: Sun,
  eveningLayer: Moon,
  morningChill: Sunrise,
  coldWeek: ThermometerSnowflake,
  heatWave: ThermometerSun,
  wetWeek: CloudRain,
  snowWeek: Snowflake,
  swingWeek: Thermometer,
  mild: CloudSun,
  storm: CloudLightning,
  freezingRain: CloudHail,
  darkReflective: Sunset,
  humid: Droplets,
};

export const SCOPE_KEY: Record<StyleTip['scope'], TranslationKey> = {
  now: 'weather.now',
  today: 'weather.today',
  tonight: 'weather.tonight',
  week: 'weather.thisWeek',
};

type Translate = (key: TranslationKey, tokens?: Record<string, string | number>) => string;
type Formatters = {
  number: (v: number) => string;
  percent: (v: number, digits?: number) => string;
  time: (v: string | number | Date) => string;
};

/** Render one tip sentence with the live values that produced it. */
export function tipText(t: Translate, tip: StyleTip, unit: TempUnit, format: Formatters): string {
  const v = tip.values;
  const tokens: Record<string, string> = {};
  if (v.tempF !== undefined) tokens.temp = tempText(v.tempF, unit, format.number);
  if (v.highF !== undefined) tokens.high = tempText(v.highF, unit, format.number);
  if (v.lowF !== undefined) tokens.low = tempText(v.lowF, unit, format.number);
  if (v.chance !== undefined) tokens.chance = format.percent(v.chance / 100, 0);
  if (v.gustMph !== undefined) tokens.speed = `${format.number(Math.round(v.gustMph))} mph`;
  if (v.timeIso) tokens.time = format.time(v.timeIso);
  return t(`weather.tip.${tip.kind}` as TranslationKey, tokens);
}

/** True when at least one tip says a real coat is needed — shows the coat CTA. */
export function tipsNeedCoat(tips: StyleTip[]): boolean {
  return tips.some((t) => ['heavyCoat', 'coat', 'coldWeek', 'hatGloves', 'snowBoots'].includes(t.kind));
}
