'use client';

import Link from 'next/link';
import { ArrowRight, CloudSun, Droplets, RefreshCw, TriangleAlert, Wind } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { ConditionIcon, TempUnitToggle, tempText, useTempUnit, type TempUnit } from './shared';
import { StyleTips } from './StyleTips';
import type { WeatherPayload } from '@/lib/weather';

/**
 * The homepage weather section: current conditions, the next 12 hours, the
 * week at a glance, and what to wear — all from the one shared payload that
 * also drives the warning banner, so nothing on the page disagrees.
 *
 * Honesty rules carried over from the feed: a cached payload is labelled with
 * its age, the publisher is always named, and total failure shows an honest
 * "unavailable" box with a retry button rather than stale numbers.
 */
export function WeatherPanel() {
  const { t, format } = useI18n();
  const { data, loading, unavailable, fromCacheAt, refresh } = useWeather();
  const [unit, setUnit] = useTempUnit();

  const updatedLine = data
    ? fromCacheAt
      ? t('weather.stale', { time: format.time(fromCacheAt) })
      : `${t('weather.updated', { time: format.time(data.fetchedAt) })} · ${data.status === 'fallback' ? t('weather.sourceFallback') : t('weather.sourceNws')}`
    : null;

  return (
    <section aria-labelledby="home-weather-title" className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)] md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="home-weather-title" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <CloudSun className="h-5 w-5 text-[var(--color-accent-primary)]" aria-hidden="true" />
          {t('weather.homeTitle')}
        </h2>
        <div className="flex items-center gap-2">
          <TempUnitToggle unit={unit} onChange={setUnit} />
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-[var(--color-border)] p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            aria-label={t('weather.retry')}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
          <Link href="/weather" className="inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline">
            {t('weather.viewFull')} <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {loading && !data && (
        <div className="mt-4 space-y-3" aria-busy="true" aria-label={t('weather.loading')}>
          <div className="h-16 w-48 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
          <div className="h-24 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
        </div>
      )}

      {unavailable && (
        <div className="mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-4">
          <p className="text-sm text-[var(--color-text-secondary)]">{t('weather.unavailable')}</p>
          <button type="button" onClick={refresh} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-3.5 py-1.5 font-heading text-sm font-bold text-white">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('weather.retry')}
          </button>
        </div>
      )}

      {data && (
        <>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{updatedLine}</p>
          {data.alerts.length > 0 ? (
            <Link
              href="/weather#alerts"
              className="mt-3 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-accent-secondary)]/40 bg-[var(--color-accent-secondary)]/10 px-3 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-accent-secondary)]/15"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent-secondary)]" aria-hidden="true" />
              <span>
                {t('weather.alertsTitle')}: {data.alerts.map((a) => a.event).join(' · ')}
              </span>
            </Link>
          ) : data.alertsStatus === 'unavailable' ? (
            <p className="mt-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              {t('weather.alertsUnavailable')}
            </p>
          ) : null}

          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <CurrentAndHours payload={data} unit={unit} />
            <StyleTips payload={data} unit={unit} limit={4} />
          </div>

          <WeekStrip payload={data} unit={unit} />
        </>
      )}
    </section>
  );
}

function CurrentAndHours({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  // Filter against the payload's own assembly time: pure, and correct —
  // "the next 12 hours" means from when this forecast was read.
  const now = new Date(payload.fetchedAt).getTime();
  const today = payload.days[0];
  const next12 = payload.hourly.filter((h) => new Date(h.end).getTime() > now).slice(0, 12);
  const cur = payload.current;
  const hour0 = next12[0];
  const displayTemp = cur?.tempF ?? hour0?.tempF;
  const displayFeels = cur?.feelsLikeF ?? hour0?.feelsLikeF;
  const displayKind = cur?.kind ?? hour0?.kind ?? 'unknown';
  const displayDay = cur?.isDay ?? hour0?.isDay ?? true;

  return (
    <div>
      <div className="flex items-center gap-4">
        <ConditionIcon kind={displayKind} isDay={displayDay} className="h-14 w-14 shrink-0 text-[var(--color-accent-primary)]" />
        <div>
          {displayTemp !== undefined && (
            <p className="font-heading text-5xl font-extrabold leading-none tracking-tight">{tempText(displayTemp, unit, format.number)}</p>
          )}
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {displayFeels !== undefined && `${t('weather.feelsLike', { temp: tempText(displayFeels, unit, format.number) })} · `}
            {t(`weather.cond.${displayKind}` as never)}
          </p>
          {today && today.highF != null && today.lowF != null && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('weather.highLow', { high: tempText(today.highF, unit, format.number), low: tempText(today.lowF, unit, format.number) })}
            </p>
          )}
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
            {cur?.windMph != null && (
              <span className="inline-flex items-center gap-1">
                <Wind className="h-3.5 w-3.5" aria-hidden="true" />
                {t('weather.wind')} {format.number(Math.round(cur.windMph))} mph{cur.windDir ? ` ${cur.windDir}` : ''}
                {cur.windGustMph ? ` · ${t('weather.gusts', { speed: `${format.number(Math.round(cur.windGustMph))} mph` })}` : ''}
              </span>
            )}
            {cur?.humidity != null && (
              <span className="inline-flex items-center gap-1">
                <Droplets className="h-3.5 w-3.5" aria-hidden="true" /> {format.percent(cur.humidity / 100, 0)}
              </span>
            )}
            {cur?.observedAt && <span>{t('weather.observedAt', { station: cur.stationName, time: format.time(cur.observedAt) })}</span>}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1" aria-label={t('weather.hourly')}>
        {next12.map((h) => (
          <div key={h.start} className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-2 text-center">
            <span className="whitespace-nowrap text-[11px] font-semibold text-[var(--color-text-secondary)]">{format.time(h.start)}</span>
            <ConditionIcon kind={h.kind} isDay={h.isDay} className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="font-heading text-sm font-bold">{tempText(h.tempF, unit, format.number)}</span>
            {(h.precipChance ?? 0) >= 10 && <span className="text-[10px] font-semibold text-[var(--color-accent-primary)]">{format.percent((h.precipChance ?? 0) / 100, 0)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekStrip({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const days = payload.days.slice(0, 7);
  if (!days.length) return null;
  return (
    <div className="mt-5 border-t border-[var(--color-border)] pt-4">
      <h3 className="sr-only">{t('weather.daily')}</h3>
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((d, i) => (
          <li key={d.date} className="flex flex-col items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] px-1 py-2.5 text-center">
            <span className="text-[11px] font-heading font-bold uppercase text-[var(--color-text-secondary)]">
              {i === 0 ? t('weather.today') : format.weekday(new Date(`${d.date}T12:00:00`))}
            </span>
            <ConditionIcon kind={d.kind} isDay className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="text-sm">
              <strong className="font-heading font-bold">{d.highF != null ? tempText(d.highF, unit, format.number) : '—'}</strong>{' '}
              <span className="text-[var(--color-text-muted)]">{d.lowF != null ? tempText(d.lowF, unit, format.number) : '—'}</span>
            </span>
            {(d.precipChanceMax ?? 0) >= 10 && (
              <span className="text-[10px] font-semibold text-[var(--color-accent-primary)]">{format.percent((d.precipChanceMax ?? 0) / 100, 0)}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
