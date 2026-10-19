'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, LocateFixed, RefreshCw, TriangleAlert } from 'lucide-react';
import { useReduceMotion } from '@/stores/appStore';
import { useWeather } from '@/hooks/useWeather';
import { useNow } from '@/hooks/useNow';
import { useI18n } from '@/i18n/hook';
import { pickSpotlightTip, type HourlyPeriod, type WeatherPayload } from '@/lib/weather';
import { ConditionIcon, TempUnitToggle, tempText, tipText, useTempUnit, type TempUnit } from './shared';
import { PrecipBars, SkyBackdrop, TempCurve, TempRangeBar } from './WeatherVisuals';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { WearSpotlight } from './WearSpotlight';

/**
 * The homepage weather section in its full Apple-Weather composition:
 * one living sky (SkyBackdrop — sun/moon at tonight's real phase,
 * twinkling stars, drifting clouds, falling rain or snow for the live
 * condition) washed in the resident's own palette (the site aurora
 * recipe, via .wx-sky-host) and carrying frosted-glass modules — the
 * hero (count-up temperature, condition, H/L, one what-to-wear line)
 * with the hour-by-hour strip, then the 24-hour temperature curve,
 * precipitation bars and 7-day list beside the what-to-wear spotlight.
 * `/weather` remains the deep end (sun & moon cycle, 48 hourly rows,
 * every instrument tile, the full tips list). Every number is the
 * shared NWS payload (`useWeather`), the same one driving the storm
 * banner and the NowBar chip, so the site can never show two weathers.
 *
 * Honesty rules unchanged: cached readings are labelled with their age,
 * the publisher is named, and total failure shows a retry box, not numbers.
 */
export function WeatherPanel() {
  const { t, format } = useI18n();
  const { data, loading, unavailable, fromCacheAt, refresh } = useWeather();
  const [unit, setUnit] = useTempUnit();
  const now = useNow(60_000);

  const updatedLine = data
    ? fromCacheAt
      ? t('weather.stale', { time: format.time(fromCacheAt) })
      : `${t('weather.updated', { time: format.time(data.fetchedAt) })} · ${data.status === 'fallback' ? t('weather.sourceFallback') : t('weather.sourceNws')}`
    : null;

  const backdropHour = data ? nextHours(data, now, 1)[0] : undefined;
  const skyKind = data?.current?.kind ?? backdropHour?.kind ?? 'unknown';
  const skyIsDay = data?.current?.isDay ?? backdropHour?.isDay ?? true;

  return (
    <section
      aria-labelledby="home-weather-title"
      className={`wx-sky-host relative overflow-hidden rounded-[2rem] shadow-[var(--shadow-lg)] ring-1 ring-[var(--color-border)] ${data ? 'text-white' : 'bg-[var(--color-bg-card)]'}`}
    >
      {data && <SkyBackdrop key={`${skyKind}-${skyIsDay ? 'day' : 'night'}`} kind={skyKind} isDay={skyIsDay} />}
      <div className={data ? 'wx-glass-scope relative' : 'relative'}>
      {loading && !data && (
        <div className="space-y-3 p-6" aria-busy="true" aria-label={t('weather.loading')}>
          <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
          <div className="h-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
        </div>
      )}

      {unavailable && (
        <div className="p-6">
          <h2 id="home-weather-title" className="font-heading text-xl font-extrabold tracking-tight">{t('weather.homeTitle')}</h2>
          <div className="mt-3 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-4">
            <p className="text-sm text-[var(--color-text-secondary)]">{t('weather.unavailable')}</p>
            <button type="button" onClick={refresh} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-sm font-bold text-white">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('weather.retry')}
            </button>
          </div>
        </div>
      )}

      {data && (
        <>
          <SkyHero payload={data} unit={unit} now={now} />

          {data.alerts.length > 0 ? (
            <div className="px-4 pt-3 sm:px-5 md:px-6">
              <Link href="/weather#alerts" className="flex items-start gap-2 rounded-2xl bg-red-500/30 px-3 py-2.5 text-sm font-semibold text-white ring-1 ring-white/35 backdrop-blur-md transition-colors hover:bg-red-500/40">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                <span>{t('weather.alertsTitle')}: {data.alerts.map((a) => a.event).join(' · ')}</span>
              </Link>
            </div>
          ) : data.alertsStatus === 'unavailable' ? (
            <p className="mx-4 mt-3 rounded-2xl bg-white/12 px-3 py-2 text-xs text-white/85 ring-1 ring-white/25 backdrop-blur-md sm:mx-5 md:mx-6">
              {t('weather.alertsUnavailable')}
            </p>
          ) : null}

          <div className="grid gap-3 px-4 pt-4 sm:gap-4 sm:px-5 md:px-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-3 sm:space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="wx-module p-4"
              >
                <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">{t('weather.tempNext24')}</h3>
                <div className="mt-1.5">
                  <TempCurve hours={nextHours(data, now, 24)} labelFor={(f) => tempText(f, unit, format.number)} timeFor={(iso) => format.time(iso)} />
                </div>
              </motion.div>
              {(data.days[0]?.precipChanceMax ?? 0) >= 10 && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.55, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="wx-module p-4"
                >
                  <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">{t('weather.precipNext24')}</h3>
                  <PrecipBars hours={nextHours(data, now, 24)} timeFor={(iso) => format.time(iso)} labelFor={(f) => tempText(f, unit, format.number)} />
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="wx-module p-4"
              >
                <WeekList payload={data} unit={unit} />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.09, ease: [0.22, 1, 0.36, 1] }}
            >
              <WearSpotlight payload={data} unit={unit} variant="glass" />
            </motion.div>
          </div>

          <div className="flex items-center justify-between gap-2 px-5 pb-5 pt-3 md:px-6">
            <p className="text-xs text-white/75">{updatedLine}</p>
            <div className="flex items-center gap-2">
              <TempUnitToggle unit={unit} onChange={setUnit} />
              <button
                type="button"
                onClick={refresh}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-[var(--color-bg-tertiary)]"
                aria-label={t('weather.retry')}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
              <Link href="/weather" className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,var(--wx-accent),var(--wx-accent-2))] px-3.5 py-1.5 font-heading text-sm font-bold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03] active:scale-95">
                {t('weather.viewFull')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}
      </div>
    </section>
  );
}


/**
 * The hour-by-hour ribbon: 24 hours side-scrolling on glass chips with
 * snap and mouse drag. Its controls live in a toolbar UNDER the strip —
 * arrow paging on larger screens (dimmed at the ends) and a "back to
 * now" pill once you have scrolled away from the present. Nothing ever
 * overlays a chip, and nothing is compressed to fit; it scrolls instead.
 */
function HourlyStrip({ hours, unit }: { hours: HourlyPeriod[]; unit: TempUnit }) {
  const { t, format } = useI18n();
  const reduceMotion = useReduceMotion();
  const scroller = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0 });
  // Scroll position drives the toolbar (buttons dim at the ends, the "Now"
  // pill appears once you have wandered off). |scrollLeft| because RTL
  // browsers run it negative; the toolbar lives UNDER the strip in normal
  // flow — the old overlay arrows sat on top of the first/last chips and
  // could cover a temperature, which is the one thing a control may never do.
  const [pos, setPos] = useState({ at: 0, max: 0 });
  const measure = () => {
    const el = scroller.current;
    if (el) setPos({ at: Math.abs(el.scrollLeft), max: Math.max(0, el.scrollWidth - el.clientWidth) });
  };
  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [hours.length]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const rtl = document.documentElement.dir === 'rtl';
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8) * (rtl ? -1 : 1), behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const arrowClass =
    'grid h-8 w-8 place-items-center rounded-full bg-[var(--color-bg-card)] text-white ring-1 ring-[var(--color-border)] backdrop-blur-md transition enabled:hover:bg-[var(--color-bg-tertiary)] disabled:opacity-35';

  return (
    <div className="mt-4">
      <div
        ref={scroller}
        onScroll={measure}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') return;
          drag.current = { down: true, startX: e.clientX, startLeft: scroller.current?.scrollLeft ?? 0 };
        }}
        onPointerMove={(e) => {
          if (drag.current.down && scroller.current) scroller.current.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerCancel={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
        className="flex cursor-grab snap-x gap-2 overflow-x-auto px-0.5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={t('weather.hourly')}
      >
        {hours.map((h, i) => (
          <div
            key={h.start}
            className={`flex w-[4.3rem] shrink-0 select-none snap-start flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-center shadow-sm backdrop-blur-md ring-1 ring-[var(--color-border)] ${i === 0 ? 'bg-[var(--color-bg-tertiary)]' : 'bg-[var(--color-bg-card)]'}`}
          >
            <span className="whitespace-nowrap text-[11px] font-semibold text-white/90">{i === 0 ? t('weather.now') : format.time(h.start)}</span>
            <ConditionIcon kind={h.kind} isDay={h.isDay} className="h-5 w-5" />
            <span className="font-heading text-sm font-bold">{tempText(h.tempF, unit, format.number)}</span>
            <span className={`text-[10px] font-semibold ${(h.precipChance ?? 0) >= 10 ? 'text-sky-100' : 'text-transparent'}`}>
              {(h.precipChance ?? 0) >= 10 ? format.percent((h.precipChance ?? 0) / 100, 0) : '0%'}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex h-8 items-center justify-between">
        <span className="flex items-center">
          {pos.at > 90 && (
            <button
              type="button"
              onClick={() => scroller.current?.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
              className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(135deg,var(--wx-accent),var(--wx-accent-2))] px-2.5 py-1 font-heading text-[11px] font-extrabold text-white shadow-[var(--shadow)] transition-transform active:scale-95"
            >
              <LocateFixed className="h-3 w-3" aria-hidden="true" /> {t('weather.now')}
            </button>
          )}
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <button type="button" onClick={() => page(-1)} disabled={pos.at <= 4} aria-label={t('weather.earlierHours')} className={arrowClass}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => page(1)} disabled={pos.at >= pos.max - 4} aria-label={t('weather.laterHours')} className={arrowClass}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </span>
      </div>
    </div>
  );
}
function nextHours(payload: WeatherPayload, now: number, count: number) {
  const readAt = Math.max(now, 0);
  return payload.hourly.filter((h) => new Date(h.end).getTime() > readAt - 1).slice(0, count);
}

function SkyHero({ payload, unit, now }: { payload: WeatherPayload; unit: TempUnit; now: number }) {
  const { t, format } = useI18n();
  const cur = payload.current;
  const hour0 = nextHours(payload, now, 1)[0];
  const temp = cur?.tempF ?? hour0?.tempF;
  const feels = cur?.feelsLikeF ?? hour0?.feelsLikeF;
  const kind = cur?.kind ?? hour0?.kind ?? 'unknown';
  const isDay = cur?.isDay ?? hour0?.isDay ?? true;
  const today = payload.days[0];
  const hours24 = nextHours(payload, now, 24);
  const topTip = pickSpotlightTip(payload, new Date(now));
  const animatedTemp = useAnimatedNumber(temp ?? 0);

  return (
    <div className="relative px-5 pb-2 pt-6 text-white md:px-6">
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="home-weather-title" className="font-heading text-lg font-bold leading-tight drop-shadow-sm">
              {t('weather.homeTitle')}
            </h2>
            <p className="text-xs font-medium text-white/85">{format.date(new Date(now), 'long')}</p>
          </div>
          <ConditionIcon kind={kind} isDay={isDay} animated className="h-11 w-11 drop-shadow" />
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-x-5 gap-y-1">
          {temp !== undefined && (
            <p className="font-heading text-[5.25rem] font-extralight leading-[0.95] tracking-tighter drop-shadow-md" aria-label={tempText(temp, unit, format.number)}>
              {format.number(Math.round(unit === 'F' ? animatedTemp : ((animatedTemp - 32) * 5) / 9))}°
            </p>
          )}
          <div className="pb-3">
            <p className="font-heading text-base font-bold drop-shadow-sm">{t(`weather.cond.${kind}` as never)}</p>
            {feels !== undefined && <p className="text-sm text-white/90">{t('weather.feelsLike', { temp: tempText(feels, unit, format.number) })}</p>}
            {today && today.highF != null && today.lowF != null && (
              <p className="text-sm font-semibold text-white/95">
                H: {tempText(today.highF, unit, format.number)}&nbsp;&nbsp;L: {tempText(today.lowF, unit, format.number)}
              </p>
            )}
          </div>
        </div>

        {topTip && (
          <p className="mt-1 max-w-xl text-sm font-medium leading-snug text-white/95 drop-shadow-sm">
            {tipText(t, topTip, unit, format)}
          </p>
        )}

        <HourlyStrip hours={hours24} unit={unit} />
      </div>
    </div>
  );
}

function WeekList({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const days = payload.days.slice(0, 7);
  if (!days.length) return null;
  const highs = days.map((d) => d.highF).filter((v): v is number => v != null);
  const lows = days.map((d) => d.lowF).filter((v): v is number => v != null);
  const weekHigh = highs.length ? Math.max(...highs) : 100;
  const weekLow = lows.length ? Math.min(...lows) : 0;
  const currentTemp = payload.current?.tempF;
  return (
    <div>
      <h3 className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white/75">{t('weather.daily')}</h3>
      <ul className="mt-1 divide-y divide-[var(--color-border)]">
        {days.map((d, i) => (
          <li key={d.date} className="grid grid-cols-[4.6rem_1.6rem_3rem_minmax(0,1fr)] items-center gap-2 py-1.5 sm:grid-cols-[5.5rem_1.75rem_3.2rem_2.8rem_minmax(0,1fr)_2.8rem]">
            <span className="font-heading text-sm font-semibold">{i === 0 ? t('weather.today') : format.weekday(new Date(`${d.date}T12:00:00`))}</span>
            <ConditionIcon kind={d.kind} isDay className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="text-[11px] font-semibold text-[var(--color-accent-primary)]">
              {(d.precipChanceMax ?? 0) >= 10 ? format.percent((d.precipChanceMax ?? 0) / 100, 0) : ''}
            </span>
            <span className="text-right font-heading text-sm text-[var(--color-text-muted)]">{d.lowF != null ? tempText(d.lowF, unit, format.number) : '—'}</span>
            <span className="hidden sm:block">
              {d.lowF != null && d.highF != null && <TempRangeBar low={d.lowF} high={d.highF} weekLow={weekLow} weekHigh={weekHigh} current={i === 0 ? currentTemp : undefined} />}
            </span>
            <span className="text-right font-heading text-sm font-bold">{d.highF != null ? tempText(d.highF, unit, format.number) : '—'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
