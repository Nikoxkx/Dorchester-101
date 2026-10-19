'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Lightbulb, Moon, Shirt, Sun, Sunrise, Sunset } from 'lucide-react';
import { buildStyleTips, dayPhase, pickSpotlightTip, type DaySummary, type HourlyPeriod, type WeatherPayload } from '@/lib/weather';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/hook';
import { useReduceMotion } from '@/stores/appStore';
import { SCOPE_KEY, TIP_ICON, tempText, tipText, tipsNeedCoat, type TempUnit } from './shared';
import { skyGradient } from './WeatherVisuals';

/**
 * "What to wear", one moment at a time.
 *
 * The old section listed four tips at once (Today… Tonight… Tonight…),
 * which reads like homework. This shows exactly one: the tip for the part
 * of the day the reader is standing in, at the temperature it is right
 * now (`pickSpotlightTip`, re-derived every minute). The day-phase rail
 * underneath shows where in the day that advice sits, and the arrows step
 * through the remaining moments one by one — the same single tip the
 * corner pop-up carries, so the site never gives two answers.
 */

const PHASES = [
  { id: 'morning', icon: Sunrise },
  { id: 'midday', icon: Sun },
  { id: 'evening', icon: Sunset },
  { id: 'night', icon: Moon },
] as const;

const PHASE_KEY = { morning: 'weather.today', midday: 'weather.today', evening: 'weather.tonight', night: 'weather.tonight' } as const;

export function WearSpotlight({ payload, unit, variant = 'sky' }: { payload: WeatherPayload; unit: TempUnit; variant?: 'sky' | 'glass' }) {
  const { t, format } = useI18n();
  const reduceMotion = useReduceMotion();
  const now = useNow(60_000);
  const at = useMemo(() => new Date(now), [now]);

  const tips = useMemo(() => buildStyleTips(payload, at), [payload, at]);
  const spotlight = useMemo(() => pickSpotlightTip(payload, at), [payload, at]);
  const phase = dayPhase(payload, at);

  // Null = "follow the moment": the spotlight re-aims itself whenever the
  // forecast, the day phase, or the temperature band changes. Stepping the
  // arrows pins a kind; if that tip disappears from the new forecast the
  // derivation falls back to the moment's tip on its own.
  const [chosenKind, setChosenKind] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const spotlightIndex = Math.max(0, tips.findIndex((tip) => tip.kind === spotlight?.kind));
  const chosenIndex = tips.findIndex((tip) => tip.kind === chosenKind);
  const index = chosenIndex >= 0 ? chosenIndex : spotlightIndex;


  // "Did you know?" — small rotating facts for the space under the tip.
  // Most are computed from the same live payload (tonight's sunset, the
  // week's warmest afternoon, the wettest hour), so they are never stale;
  // two are evergreen Dorchester history. They crossfade every few
  // seconds, pausing while the tab is hidden.
  // Hoisted out of the memo: the compiler treats deep reads of `payload`
  // inside a memo like ref access, so the slices are named first.
  const astro = payload.astronomy;
  const factDays = payload.days;
  const factHours = payload.hourly;
  const windMphNow = payload.current?.windMph;
  const windDirNow = payload.current?.windDir;
  const facts = useMemo<string[]>(() => {
    const out: string[] = [];
    const today = factDays[0];
    if (astro?.sunset) out.push(t('weather.fact.sunset', { time: format.time(astro.sunset) }));
    if (today && today.highF != null && today.lowF != null && today.highF - today.lowF >= 12) {
      out.push(t('weather.fact.swing', { low: tempText(today.lowF, unit, format.number), high: tempText(today.highF, unit, format.number) }));
    }
    const warmest = factDays.reduce<DaySummary | null>(
      (best, d) => (d.highF != null && (best?.highF == null || d.highF > best.highF) ? d : best),
      null
    );
    if (warmest?.highF != null) {
      out.push(t('weather.fact.warmest', { day: format.weekday(new Date(`${warmest.date}T12:00:00`)), temp: tempText(warmest.highF, unit, format.number) }));
    }
    const coldest = factDays.reduce<DaySummary | null>(
      (best, d) => (d.lowF != null && (best?.lowF == null || d.lowF < best.lowF) ? d : best),
      null
    );
    if (coldest?.lowF != null) {
      out.push(t('weather.fact.coldest', { day: format.weekday(new Date(`${coldest.date}T12:00:00`)), temp: tempText(coldest.lowF, unit, format.number) }));
    }
    const wetHour = factHours.slice(0, 24).reduce<HourlyPeriod | null>(
      (best, h) => ((h.precipChance ?? 0) > (best?.precipChance ?? 0) ? h : best),
      null
    );
    if (wetHour && (wetHour.precipChance ?? 0) >= 30) {
      out.push(t('weather.fact.rainPeak', { time: format.time(wetHour.start), chance: format.percent((wetHour.precipChance ?? 0) / 100, 0) }));
    }
    if (windMphNow != null && windMphNow >= 8) {
      out.push(t('weather.fact.windNow', { wind: `${windDirNow ?? ''} ${format.number(Math.round(windMphNow))} mph`.trim() }));
    }
    if (astro?.sunrise) out.push(t('weather.fact.sunrise', { time: format.time(astro.sunrise) }));
    out.push(t('weather.fact.history'), t('weather.fact.redline'));
    return out;
  }, [astro, factDays, factHours, windMphNow, windDirNow, t, format, unit]);

  const [factIndex, setFactIndex] = useState(0);
  useEffect(() => {
    if (facts.length < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setFactIndex((i) => (i + 1) % facts.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [facts.length]);
  const fact = facts[Math.min(factIndex, Math.max(0, facts.length - 1))];

  if (!tips.length || !spotlight) return null;
  const tip = tips[Math.min(index, tips.length - 1)] ?? spotlight;
  const Icon = TIP_ICON[tip.kind];
  const kind = payload.current?.kind ?? payload.hourly[0]?.kind ?? 'unknown';
  const isDay = payload.current?.isDay ?? payload.hourly[0]?.isDay ?? true;
  const feels = payload.current?.feelsLikeF ?? payload.hourly[0]?.feelsLikeF;
  const today = payload.days[0];
  const nextTip = tips[(index + 1) % tips.length];

  const step = (dir: 1 | -1) => {
    setDirection(dir);
    setChosenKind(tips[(index + dir + tips.length) % tips.length]?.kind ?? null);
  };

  return (
    <section
      aria-label={t('weather.wearToday')}
      className={variant === 'glass' ? 'wx-sky-host wx-module relative overflow-hidden text-white' : 'wx-sky-host relative overflow-hidden rounded-[1.4rem] text-white shadow-[var(--shadow)] ring-1 ring-[var(--color-border)]'}
      style={variant === 'glass' ? undefined : { background: skyGradient(kind, isDay) }}
    >
      {variant === 'sky' && <div className="wx-sky-aurora" aria-hidden="true" />}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(130%_100%_at_90%_-20%,rgba(255,255,255,0.3),transparent_55%)]" aria-hidden="true" />
      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-[0.08em]">
            <Shirt className="h-4 w-4" aria-hidden="true" /> {t('weather.wearToday')}
          </h3>
          {feels !== undefined && (
            <span className="rounded-full bg-white/18 px-2.5 py-1 font-heading text-xs font-bold ring-1 ring-white/25 backdrop-blur-sm">
              {t('weather.feelsLike', { temp: tempText(feels, unit, format.number) })}
            </span>
          )}
        </div>

        <div className="relative mt-4 min-h-[8.5rem]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={`${tip.kind}-${tip.scope}`}
              initial={{ opacity: 0, x: reduceMotion ? 0 : direction * 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduceMotion ? 0 : direction * -26 }}
              transition={{ duration: reduceMotion ? 0.08 : 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-start gap-3.5">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/18 shadow-inner ring-1 ring-white/30 backdrop-blur-md">
                  <Icon className="h-8 w-8 drop-shadow" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">{t(SCOPE_KEY[tip.scope])}</p>
                  <p className="mt-1 text-[1.05rem] font-semibold leading-snug drop-shadow-sm">{tipText(t, tip, unit, format)}</p>
                  {today && today.highF != null && today.lowF != null && (
                    <p className="mt-1.5 text-sm font-medium text-white/85">
                      {tempText(today.lowF, unit, format.number)} → {tempText(today.highF, unit, format.number)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The day at a glance: where this advice sits in it. */}
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-black/14 px-3 py-2 ring-1 ring-white/15 backdrop-blur-sm" aria-hidden="true">
          {PHASES.map(({ id, icon: PhaseIcon }) => (
            <span key={id} className={`flex items-center gap-1.5 font-heading text-[11px] font-bold ${phase === id ? 'text-white' : 'text-white/50'}`}>
              <PhaseIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(PHASE_KEY[id])}</span>
              {phase === id && <span className="h-1.5 w-1.5 rounded-full bg-white shadow" />}
            </span>
          ))}
        </div>

        {fact && (
          <div className="mt-3 min-h-[2.6rem] overflow-hidden rounded-2xl bg-white/12 px-3 py-2 ring-1 ring-white/20 backdrop-blur-sm" aria-live="off">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={fact}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-2 text-[13px] font-medium leading-snug text-white/95"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-white/90" aria-hidden="true" />
                <span><strong className="font-heading">{t('weather.fact.title')}</strong> {fact}</span>
              </motion.p>
            </AnimatePresence>
            {facts.length > 1 && (
              <span className="mt-1.5 flex justify-end gap-1" aria-hidden="true">
                {facts.map((f, i) => (
                  <span key={f.slice(0, 24) + i} className={`h-1 rounded-full transition-all ${i === Math.min(factIndex, facts.length - 1) ? 'w-3 bg-white' : 'w-1 bg-white/40'}`} />
                ))}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tipsNeedCoat(tips) && (
            <Link href="/winter-clothing" className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--wx-accent),var(--wx-accent-2))] px-3.5 py-2 font-heading text-sm font-extrabold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03] active:scale-[0.97]">
              {t('weather.noCoatShort')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Link>
          )}
          <div className="ms-auto flex items-center gap-1.5">
            {tips.length > 1 && nextTip && (
              <span className="me-1 hidden text-[11px] font-medium text-white/75 sm:inline">
                {t('weather.wearNext')}: {t(SCOPE_KEY[nextTip.scope])}
              </span>
            )}
            <button type="button" onClick={() => step(-1)} disabled={tips.length < 2} aria-label="Previous tip" className="grid h-8 w-8 place-items-center rounded-full bg-white/16 ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/28 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
            <span className="flex gap-1" aria-hidden="true">
              {tips.map((tp, i) => (
                <span key={tp.kind} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/45'}`} />
              ))}
            </span>
            <button type="button" onClick={() => step(1)} disabled={tips.length < 2} aria-label="Next tip" className="grid h-8 w-8 place-items-center rounded-full bg-white/16 ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/28 disabled:opacity-40">
              <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
