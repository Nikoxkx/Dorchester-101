'use client';

import Link from 'next/link';
import {
  CloudSun,
  Droplets,
  ExternalLink,
  Eye,
  Gauge,
  RefreshCw,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  TriangleAlert,
  Umbrella,
  Wind,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { ConditionIcon, TempUnitToggle, tempText, useTempUnit, type TempUnit } from '@/components/weather/shared';
import { StyleTips } from '@/components/weather/StyleTips';
import { coldSignal, type WeatherAlert, type WeatherPayload } from '@/lib/weather';

/**
 * The full Dorchester forecast: current conditions in detail, active NWS
 * warnings with their instructions verbatim, 48 hours hour by hour, the
 * 7-day day/night periods, and the same what-to-wear advice the homepage
 * shows (all six tips here).
 *
 * NWS alert and forecast prose is shown unedited (English — the note under
 * the periods says so) because re-wording a storm warning into nine
 * languages by hand would be exactly the kind of stale, unverifiable copy
 * this site refuses to publish; the site's own labels around it are fully
 * translated.
 */

const card = 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)] md:p-6';

export default function WeatherPageView() {
  const { t, format } = useI18n();
  const { data, loading, unavailable, fromCacheAt, refresh } = useWeather();
  const [unit, setUnit] = useTempUnit();

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
              <CloudSun className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.title')}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('weather.title')}</h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weather.subtitle')}</p>
            {data && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {fromCacheAt
                  ? t('weather.stale', { time: format.time(fromCacheAt) })
                  : `${t('weather.updated', { time: format.time(data.fetchedAt) })} · ${data.status === 'fallback' ? t('weather.sourceFallback') : t('weather.sourceNws')}`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TempUnitToggle unit={unit} onChange={setUnit} />
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3.5 py-1.5 font-heading text-sm font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" /> {t('weather.retry')}
            </button>
          </div>
        </header>

        {loading && !data && (
          <div className={`${card} space-y-3`} aria-busy="true" aria-label={t('weather.loading')}>
            <div className="h-20 w-56 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
            <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
          </div>
        )}

        {unavailable && (
          <div className={`${card} border-dashed`}>
            <p className="text-sm text-[var(--color-text-secondary)]">{t('weather.unavailable')}</p>
            <button type="button" onClick={refresh} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('weather.retry')}
            </button>
          </div>
        )}

        {data && (
          <>
            <AlertsSection payload={data} />
            <CurrentSection payload={data} unit={unit} />
            <section className={card} aria-labelledby="wx-tips">
              <StyleTips payload={data} unit={unit} headingLevel={2} />
            </section>
            {coldSignal(data) && <ColdCta />}
            <HourlySection payload={data} unit={unit} />
            <DailySection payload={data} unit={unit} />
            <section className={card} aria-labelledby="wx-method">
              <h2 id="wx-method" className="font-heading text-base font-bold">{t('weather.methodTitle')}</h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weather.methodBody')}</p>
            </section>
          </>
        )}

        <ProjectNote sources={['nws', 'openmeteo', 'bostongov']}>{t('weather.methodBody')}</ProjectNote>
      </div>
    </MainLayout>
  );
}

function AlertsSection({ payload }: { payload: WeatherPayload }) {
  const { t, format } = useI18n();
  return (
    <section id="alerts" className={card} aria-labelledby="wx-alerts">
      <h2 id="wx-alerts" className="flex items-center gap-2 font-heading text-base font-bold">
        <TriangleAlert className="h-4 w-4 text-[var(--color-accent-secondary)]" aria-hidden="true" />
        {t('weather.alertsTitle')}
      </h2>
      {payload.alertsStatus === 'unavailable' ? (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t('weather.alertsUnavailable')}</p>
      ) : payload.alerts.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{t('weather.noAlerts')}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {payload.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} dayTime={(iso) => `${format.weekday(new Date(iso))} ${format.time(iso)}`} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertCard({ alert, dayTime }: { alert: WeatherAlert; dayTime: (iso: string) => string }) {
  const { t } = useI18n();
  const urgent = alert.severity === 'Extreme' || alert.severity === 'Severe';
  const ends = alert.ends ?? alert.expires;
  return (
    <li
      className={`rounded-[var(--radius-md)] border p-4 ${
        urgent
          ? 'border-[var(--color-accent-secondary)]/50 bg-[var(--color-accent-secondary)]/8'
          : 'border-amber-500/40 bg-amber-500/8'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading text-base font-extrabold" dir="auto">{alert.event}</h3>
        <span className={`rounded-full px-2 py-0.5 font-heading text-[11px] font-bold ${urgent ? 'bg-[var(--color-accent-secondary)] text-white' : 'bg-amber-500/25 text-[var(--color-text-primary)]'}`}>
          {alert.severity}
        </span>
        {ends && <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t('weather.alertEnds', { time: dayTime(ends) })}</span>}
      </div>
      {alert.headline && <p className="mt-1 text-sm font-semibold leading-snug" dir="auto">{alert.headline}</p>}
      {alert.areas && <p className="mt-1 text-xs text-[var(--color-text-muted)]" dir="auto">{alert.areas}</p>}
      {alert.instruction && (
        <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-card)] p-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-accent-primary)]">{t('weather.alertWhatToDo')}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed" dir="auto">{alert.instruction}</p>
        </div>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer font-heading text-sm font-bold text-[var(--color-accent-primary)]">{t('weather.alertDetails')}</summary>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]" dir="auto">{alert.description}</p>
        <a href={alert.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline">
          weather.gov <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </details>
    </li>
  );
}

function CurrentSection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const cur = payload.current;
  const today = payload.days[0];
  if (!cur) return null;

  const stats: Array<{ icon: typeof Wind; label: string; value: string }> = [];
  if (cur.windMph != null) stats.push({ icon: Wind, label: t('weather.wind'), value: `${format.number(Math.round(cur.windMph))} mph${cur.windDir ? ` ${cur.windDir}` : ''}${cur.windGustMph ? ` · ${t('weather.gusts', { speed: `${format.number(Math.round(cur.windGustMph))} mph` })}` : ''}` });
  if (cur.humidity != null) stats.push({ icon: Droplets, label: t('weather.humidity'), value: format.percent(cur.humidity / 100, 0) });
  if (cur.dewpointF != null) stats.push({ icon: Thermometer, label: t('weather.dewpoint'), value: tempText(cur.dewpointF, unit, format.number) });
  if (cur.windChillF != null) stats.push({ icon: ThermometerSnowflake, label: t('weather.windChill'), value: tempText(cur.windChillF, unit, format.number) });
  if (cur.heatIndexF != null) stats.push({ icon: ThermometerSun, label: t('weather.heatIndex'), value: tempText(cur.heatIndexF, unit, format.number) });
  if (cur.pressureInHg != null) stats.push({ icon: Gauge, label: t('weather.pressure'), value: `${format.number(cur.pressureInHg)} inHg` });
  if (cur.visibilityMi != null) stats.push({ icon: Eye, label: t('weather.visibility'), value: `${format.number(cur.visibilityMi)} mi` });
  if (payload.astronomy) {
    stats.push({ icon: Sunrise, label: t('weather.sunrise'), value: format.time(payload.astronomy.sunrise) });
    stats.push({ icon: Sunset, label: t('weather.sunset'), value: format.time(payload.astronomy.sunset) });
  }

  return (
    <section className={card} aria-labelledby="wx-current">
      <h2 id="wx-current" className="font-heading text-base font-bold">{t('weather.conditions')}</h2>
      <div className="mt-3 flex flex-wrap items-center gap-5">
        <ConditionIcon kind={cur.kind} isDay={cur.isDay} className="h-16 w-16 text-[var(--color-accent-primary)]" />
        <div>
          <p className="font-heading text-6xl font-extrabold leading-none tracking-tight">{tempText(cur.tempF, unit, format.number)}</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {t('weather.feelsLike', { temp: tempText(cur.feelsLikeF, unit, format.number) })} · <span dir="auto">{cur.text}</span>
          </p>
          {today && today.highF != null && today.lowF != null && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {t('weather.highLow', { high: tempText(today.highF, unit, format.number), low: tempText(today.lowF, unit, format.number) })}
            </p>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">{t('weather.observedAt', { station: cur.stationName, time: format.time(cur.observedAt) })}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] px-3 py-2.5">
            <dt className="flex items-center gap-1.5 text-[11px] font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              <s.icon className="h-3.5 w-3.5" aria-hidden="true" /> {s.label}
            </dt>
            <dd className="mt-0.5 font-heading text-sm font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ColdCta() {
  const { t } = useI18n();
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary)]/8 p-5 md:p-6" aria-labelledby="wx-cold">
      <h2 id="wx-cold" className="font-heading text-base font-extrabold">{t('clothing.warmTitle')}</h2>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('clothing.warmBody')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/winter-clothing" className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-white transition-transform active:scale-[0.98]">
          {t('weather.noCoatCta')}
        </Link>
        <a href="https://www.boston.gov/cold" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-4 py-2 font-heading text-sm font-bold">
          {t('clothing.warmLink')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function HourlySection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const readAt = new Date(payload.fetchedAt).getTime();
  const rows = payload.hourly.filter((h) => new Date(h.end).getTime() > readAt).slice(0, 48);
  if (!rows.length) return null;
  return (
    <section className={card} aria-labelledby="wx-hourly">
      <h2 id="wx-hourly" className="font-heading text-base font-bold">{t('weather.hourly')}</h2>
      <ul className="mt-3 flex flex-col divide-y divide-[var(--color-border)]">
        {rows.map((h) => (
          <li key={h.start} className="grid grid-cols-[4.5rem_1.75rem_4.5rem_1fr] items-center gap-2 py-2 sm:grid-cols-[5rem_2rem_5rem_1fr_7rem]">
            <span className="whitespace-nowrap text-sm font-semibold">{format.time(h.start)}</span>
            <ConditionIcon kind={h.kind} isDay={h.isDay} className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="font-heading text-sm font-bold">
              {tempText(h.tempF, unit, format.number)}
              {h.feelsLikeF !== Math.round(h.tempF) && (
                <span className="block text-[10px] font-medium text-[var(--color-text-muted)]">{t('weather.feelsLike', { temp: tempText(h.feelsLikeF, unit, format.number) })}</span>
              )}
            </span>
            <span className="min-w-0 truncate text-xs text-[var(--color-text-secondary)]" dir="auto">
              {h.shortForecast}{h.windText ? ` · ${h.windText}${h.windDir ? ` ${h.windDir}` : ''}` : ''}
            </span>
            <span className="hidden items-center gap-1.5 sm:flex" aria-label={`${t('weather.precipChance')}: ${h.precipChance != null ? format.percent(h.precipChance / 100, 0) : '—'}`}>
              <Umbrella className="h-3.5 w-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]">
                <span className="block h-full rounded-full bg-[var(--color-accent-primary)]" style={{ width: `${Math.min(100, h.precipChance ?? 0)}%` }} />
              </span>
              <span className="text-[11px] font-semibold">{h.precipChance != null ? format.percent(h.precipChance / 100, 0) : '—'}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DailySection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  if (!payload.daily.length) return null;
  return (
    <section className={card} aria-labelledby="wx-daily">
      <h2 id="wx-daily" className="font-heading text-base font-bold">{t('weather.daily')}</h2>
      <ul className="mt-3 flex flex-col gap-2">
        {payload.daily.map((d) => (
          <li key={`${d.name}-${d.start}`} className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <ConditionIcon kind={d.kind} isDay={d.isDay} className="h-6 w-6 text-[var(--color-accent-primary)]" />
              <h3 className="font-heading text-sm font-extrabold" dir="auto">{d.name}</h3>
              <span className="font-heading text-base font-bold">{tempText(d.tempF, unit, format.number)}</span>
              <span className="text-sm text-[var(--color-text-secondary)]" dir="auto">{d.shortForecast}</span>
              {d.precipChance != null && d.precipChance >= 10 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent-primary)]">
                  <Umbrella className="h-3 w-3" aria-hidden="true" /> {format.percent(d.precipChance / 100, 0)}
                </span>
              )}
              {d.windText && <span className="text-[11px] text-[var(--color-text-muted)]">{d.windText}{d.windDir ? ` ${d.windDir}` : ''}</span>}
            </div>
            {d.detailedForecast && <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]" dir="auto">{d.detailedForecast}</p>}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('weather.forecastTextNote')}</p>
    </section>
  );
}
