'use client';

import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import {
  CloudOff,
  Droplets,
  ExternalLink,
  Eye,
  Gauge,
  RefreshCw,
  SunMoon,
  Sunrise,
  Sunset,
  Thermometer,
  TriangleAlert,
  Umbrella,
  Wind,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProjectNote } from '@/components/layout/ProjectNote';
import { useWeather } from '@/hooks/useWeather';
import { useI18n } from '@/i18n/hook';
import { translateWeatherPeriod } from '@/i18n/weatherPeriod';
import { localizeWindDirection, localizeWindSpeed } from '@/i18n/weatherWind';
import { localizeShortForecast } from '@/i18n/weatherForecast';
import { ForecastText } from '@/components/weather/ForecastText';
import { ConditionIcon, TempUnitToggle, TIP_ICON, tempText, tipText, useTempUnit, type TempUnit } from '@/components/weather/shared';
import { StyleTips } from '@/components/weather/StyleTips';
import { MoonDisc, PrecipBars, SunArc, sunArcPoint, TempCurve, TempRangeBar, WindCompass } from '@/components/weather/WeatherVisuals';
import { WeatherDisclosure } from '@/components/weather/WeatherDisclosure';
import { MOON_PHASE_KEYS, moonPhase, nextFullMoon, nextNewMoon } from '@/lib/moon';
import { motion } from 'framer-motion';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import { useNow } from '@/hooks/useNow';
import { coldSignal, pickSpotlightTip, type WeatherAlert, type WeatherPayload } from '@/lib/weather';
import { useAppStore, type WeatherBlockId } from '@/stores/appStore';

/**
 * A quick-read forecast first, with instrument readings, full hourly data,
 * day/night periods and extra clothing tips available in collapsible details.
 * Official NWS warning text remains verbatim; only recognized short labels
 * are translated.
 */

const card = 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow)] md:p-6';

export default function WeatherPageView() {
  const { t, format, lang } = useI18n();
  const { data, loading, unavailable, fromCacheAt, refresh } = useWeather();
  const [unit, setUnit] = useTempUnit();
  const weatherEnabled = useAppStore((s) => s.weatherEnabled);
  const setWeatherEnabled = useAppStore((s) => s.setWeatherEnabled);
  const weatherLayout = useAppStore((s) => s.weatherLayout);

  // The page's blocks in the resident's own arrangement (Settings →
  // Weather): rendered in their order, hidden ones skipped. Active
  // alerts are pinned above the blocks and are not themselves a block —
  // safety is not furniture, on this page or the homepage.
  const blocks: Record<WeatherBlockId, ReactNode> | null = data
    ? {
        current: <CurrentSection payload={data} unit={unit} />,
        spotlight: <SpotlightSection payload={data} unit={unit} />,
        tips: (
          <>
            <WeatherDisclosure label={t('weather.tipsTitle')} className={card} contentClassName="mt-3">
              <StyleTips payload={data} unit={unit} headingLevel={3} showHeading={false} showSubtitle={false} showCoatLink={false} />
            </WeatherDisclosure>
            {coldSignal(data) && <ColdCta />}
          </>
        ),
        hourly: <HourlySection payload={data} unit={unit} />,
        daily: <DailySection payload={data} unit={unit} />,
        method: (
          <section className={card} aria-labelledby="wx-method">
            <h2 id="wx-method" className="font-heading text-base font-bold">{t('weather.methodTitle')}</h2>
            <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weather.methodBody')}</p>
          </section>
        ),
      }
    : null;

  return (
    <MainLayout>
      <div className="flex flex-col gap-5 pb-10">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-extrabold leading-tight sm:text-3xl">{t('weather.title')}</h1>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weather.subtitle')}</p>
            {weatherEnabled && data && (
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {fromCacheAt
                  ? t('weather.stale', { time: format.time(fromCacheAt) })
                  : `${t('weather.updated', { time: format.time(data.fetchedAt) })} · ${data.status === 'fallback' ? t('weather.sourceFallback') : t('weather.sourceNws')}`}
              </p>
            )}
          </div>
          {weatherEnabled && (
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
          )}
        </header>

        {!weatherEnabled ? (
          <>
            {data && <AlertsSection payload={data} />}
            <section className={`${card} border-dashed`} aria-labelledby="wx-off">
              <h2 id="wx-off" className="flex items-center gap-2 font-heading text-base font-bold">
                <CloudOff className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
                {t('weather.offTitle')}
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('weather.offBody')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setWeatherEnabled(true)} className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-[var(--color-bg-primary)] transition-transform active:scale-[0.98]">
                  {t('weather.offEnable')}
                </button>
                <Link href="/settings#weather" className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 font-heading text-sm font-bold">
                  {t('settings.title')}
                </Link>
              </div>
            </section>
          </>
        ) : (
          <>
        {loading && !data && (
          <div className={`${card} space-y-3`} aria-busy="true" aria-label={t('weather.loading')}>
            <div className="h-20 w-56 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
            <div className="h-40 animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-tertiary)]" />
          </div>
        )}

        {unavailable && (
          <div className={`${card} border-dashed`}>
            <p className="text-sm text-[var(--color-text-secondary)]">{t('weather.unavailable')}</p>
            <button type="button" onClick={refresh} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-[var(--color-bg-primary)]">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> {t('weather.retry')}
            </button>
          </div>
        )}

        {data && blocks && (
          <>
            <AlertsSection payload={data} />
            {weatherLayout.order
              .filter((id) => !weatherLayout.hidden.includes(id))
              .map((id) => (
                <Fragment key={id}>{blocks[id]}</Fragment>
              ))}
            {lang !== 'en' && (data.hourly.some((hour) => hour.shortForecast) || data.daily.some((period) => period.shortForecast)) && (
              <p className="text-xs text-[var(--color-text-muted)]">{t('weather.forecastTextNote')}</p>
            )}
          </>
        )}
          </>
        )}

        <ProjectNote sources={['nws', 'openmeteo', 'bostongov']} />
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
  const { t, lang } = useI18n();
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
        <h3 className="font-heading text-base font-extrabold" lang="en" dir="auto">{alert.event}</h3>
        <span className={`rounded-full px-2 py-0.5 font-heading text-[11px] font-bold ${urgent ? 'bg-[var(--color-accent-secondary)] text-[var(--color-bg-primary)]' : 'bg-amber-500/25 text-[var(--color-text-primary)]'}`}>
          {t(`weather.severity.${alert.severity}`)}
        </span>
        {ends && <span className="text-xs font-semibold text-[var(--color-text-secondary)]">{t('weather.alertEnds', { time: dayTime(ends) })}</span>}
      </div>
      {lang !== 'en' && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{t('weather.alertEnglish')}</p>}
      {alert.headline && <p className="mt-1 text-sm font-semibold leading-snug" lang="en" dir="auto">{alert.headline}</p>}
      {alert.areas && <p className="mt-1 text-xs text-[var(--color-text-muted)]" lang="en" dir="auto">{alert.areas}</p>}
      {alert.instruction && (
        <div className="mt-3 rounded-[var(--radius-sm)] bg-[var(--color-bg-card)] p-3">
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-accent-primary)]">{t('weather.alertWhatToDo')}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed" lang="en" dir="auto">{alert.instruction}</p>
        </div>
      )}
      <details className="mt-3">
        <summary className="cursor-pointer font-heading text-sm font-bold text-[var(--color-accent-primary)]">{t('weather.alertDetails')}</summary>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]" lang="en" dir="auto">{alert.description}</p>
        <a href={alert.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 font-heading text-sm font-bold text-[var(--color-accent-primary)] hover:underline">
          weather.gov <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </details>
    </li>
  );
}

function SpotlightSection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const now = useNow(60_000);
  const tip = pickSpotlightTip(payload, new Date(now));
  if (!tip) return null;
  const Icon = TIP_ICON[tip.kind];

  return (
    <section className={card} aria-labelledby="wx-spotlight">
      <h2 id="wx-spotlight" className="flex items-center gap-2 font-heading text-base font-bold">
        <Icon className="h-4 w-4 text-[var(--color-accent-primary)]" aria-hidden="true" />
        {t('weather.wearToday')}
      </h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{tipText(t, tip, unit, format)}</p>
    </section>
  );
}

function CurrentSection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format, lang } = useI18n();
  const now = useNow(60_000);
  const cur = payload.current;
  const animatedTemp = useAnimatedNumber(cur?.tempF ?? 0);
  if (!cur) return null;

  const windDirection = localizeWindDirection(cur.windDir, lang, t);
  const observation = localizeShortForecast(cur.text, lang);
  const windSpeed = cur.windMph != null ? t('weather.windMph', { speed: format.number(Math.round(cur.windMph)) }) : null;
  const tile = 'rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-4 shadow-[var(--shadow-sm)]';
  const tileTitle = 'flex items-center gap-1.5 text-[11px] font-heading font-bold uppercase tracking-wide text-[var(--color-text-muted)]';
  const hasExtraReadings = cur.dewpointF != null || cur.visibilityMi != null || cur.pressureInHg != null || payload.astronomy != null;

  return (
    <section aria-labelledby="wx-current" className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-lg)]">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-7">
        <div className="min-w-0">
          <h2 id="wx-current" className="font-heading text-xl font-bold">Dorchester, Boston</h2>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-secondary)]" lang={cur.text ? observation.language : lang} dir="auto">
            {cur.text ? observation.text : t(`weather.cond.${cur.kind}` as never)}
          </p>
          {cur.text && lang !== 'en' && observation.language === 'en' && <p className="text-xs text-[var(--color-text-muted)]">{t(`weather.cond.${cur.kind}` as never)} · {t('weather.observationEnglish')}</p>}
          {cur.text && lang !== 'en' && observation.language === lang && <p className="text-xs text-[var(--color-text-muted)]">{t('weather.shortTranslationNote')}</p>}
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">{t('weather.observedAt', { station: cur.stationName, time: format.time(cur.observedAt) })}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ConditionIcon kind={cur.kind} isDay={cur.isDay} className="h-9 w-9 text-[var(--color-accent-primary)]" />
          <p className="font-display text-6xl font-light leading-none tracking-tight text-[var(--color-accent-primary)] sm:text-7xl" aria-label={tempText(cur.tempF, unit, format.number)}>
            {format.number(Math.round(unit === 'F' ? animatedTemp : ((animatedTemp - 32) * 5) / 9))}°
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 p-4 md:gap-3 md:p-5 lg:grid-cols-3">
        <div className={tile}>
          <p className={tileTitle}><Thermometer className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.feelsLike', { temp: '' }).trim() || t('weather.conditions')}</p>
          <p className="mt-1 font-heading text-3xl font-extrabold">{tempText(cur.feelsLikeF, unit, format.number)}</p>
          {cur.windChillF != null && <p className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)]">{t('weather.windChill')}: {tempText(cur.windChillF, unit, format.number)}</p>}
          {cur.heatIndexF != null && <p className="mt-1 text-xs leading-snug text-[var(--color-text-secondary)]">{t('weather.heatIndex')}: {tempText(cur.heatIndexF, unit, format.number)}</p>}
        </div>

        <div className={tile}>
          <p className={tileTitle}><Wind className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.wind')}</p>
          <div className="mt-1 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <WindCompass dir={cur.windDir} />
            <div className="min-w-0">
              <p className="break-words font-heading text-xl font-extrabold leading-tight sm:text-2xl">{windSpeed ?? '—'}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {windDirection && <span lang={windDirection.language} dir="auto">{windDirection.text}</span>}
                {cur.windGustMph ? `${windDirection ? ' · ' : ''}${t('weather.gusts', { speed: t('weather.windMph', { speed: format.number(Math.round(cur.windGustMph)) }) })}` : ''}
              </p>
              {windDirection && windDirection.language !== lang && <p className="text-[10px] text-[var(--color-text-muted)]">{t('weather.windEnglish')}</p>}
            </div>
          </div>
        </div>

        <div className={tile}>
          <p className={tileTitle}><Droplets className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.humidity')}</p>
          <p className="mt-1 font-heading text-3xl font-extrabold">{cur.humidity != null ? format.percent(cur.humidity / 100, 0) : '—'}</p>
          {cur.humidity != null && (
            <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg-tertiary)]" aria-hidden="true">
              <span className="block h-full rounded-full bg-[var(--color-accent-primary)]" style={{ width: `${cur.humidity}%` }} />
            </span>
          )}
        </div>
      </div>

      {hasExtraReadings && (
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <WeatherDisclosure label={t('common.moreInfo')} className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-raised)] p-2" contentClassName="px-3 pb-3">
            {(cur.dewpointF != null || cur.visibilityMi != null || cur.pressureInHg != null) && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cur.dewpointF != null && (
                  <div className={tile}>
                    <p className={tileTitle}>{t('weather.dewpoint')}</p>
                    <p className="mt-1 font-heading text-xl font-extrabold">{tempText(cur.dewpointF, unit, format.number)}</p>
                  </div>
                )}
                {cur.visibilityMi != null && (
                  <div className={tile}>
                    <p className={tileTitle}><Eye className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.visibility')}</p>
                    <p className="mt-1 break-words font-heading text-lg font-extrabold leading-tight">{t('weather.milesValue', { value: format.decimal(cur.visibilityMi, 1) })}</p>
                  </div>
                )}
                {cur.pressureInHg != null && (
                  <div className={tile}>
                    <p className={tileTitle}><Gauge className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.pressure')}</p>
                    <p className="mt-1 break-words font-heading text-lg font-extrabold leading-tight">{t('weather.pressureValue', { value: format.decimal(cur.pressureInHg, 2) })}</p>
                  </div>
                )}
              </div>
            )}
            {payload.astronomy && (
              <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                <h3 className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]"><SunMoon className="h-3.5 w-3.5" aria-hidden="true" /> {t('weather.sunMoon')}</h3>
                <SunMoonCycle astronomy={payload.astronomy} nowMs={now} />
              </div>
            )}
          </WeatherDisclosure>
        </div>
      )}
    </section>
  );
}


/**
 * The sun & moon module: today's sun path (the moon rides the same arc at
 * night), then tonight's moon drawn at its real phase — computed
 * astronomy (`@/lib/moon`), so it is exact for the reader's instant with
 * no extra API. The week strip previews the next seven nights. The
 * moon's position on the night arc is the one schematic part (sunset→
 * sunrise), and the caption says so; the phase itself is never faked.
 */
function SunMoonCycle({ astronomy, nowMs }: { astronomy: WeatherPayload['astronomy']; nowMs: number }) {
  const { t, format } = useI18n();
  const now = new Date(nowMs);
  const moon = moonPhase(now);
  const rise = astronomy ? new Date(astronomy.sunrise).getTime() : null;
  const set = astronomy ? new Date(astronomy.sunset).getTime() : null;
  const daylightMin = rise != null && set != null && set > rise ? Math.round((set - rise) / 60_000) : null;

  let moonPt: { xPct: number; yPct: number } | null = null;
  if (rise != null && set != null) {
    const DAY = 86_400_000;
    if (nowMs > set) moonPt = sunArcPoint((nowMs - set) / (rise + DAY - set));
    else if (nowMs < rise) moonPt = sunArcPoint((nowMs - (set - DAY)) / (rise - (set - DAY)));
  }

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(nowMs + i * 86_400_000);
    return { date: d, fraction: moonPhase(d).fraction };
  });

  return (
    <div>
      {astronomy && (
        <>
          <div className="relative mx-auto w-full max-w-[26rem]">
            <SunArc sunrise={astronomy.sunrise} sunset={astronomy.sunset} nowMs={nowMs} />
            {moonPt && (
              <span
                className="pointer-events-none absolute"
                style={{ left: `${moonPt.xPct}%`, top: `${moonPt.yPct}%`, transform: 'translate(-50%, -50%)' }}
                aria-hidden="true"
              >
                <MoonDisc fraction={moon.fraction} size={20} />
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs font-semibold">
            <span className="inline-flex items-center gap-1"><Sunrise className="h-3.5 w-3.5" aria-hidden="true" /> {format.time(astronomy.sunrise)}</span>
            {daylightMin != null && (
              <span className="text-[var(--color-text-muted)]">{t('weather.daylight')} {t('map.arrivalHours', { hours: format.number(Math.floor(daylightMin / 60)), minutes: format.number(daylightMin % 60) })}</span>
            )}
            <span className="inline-flex items-center gap-1"><Sunset className="h-3.5 w-3.5" aria-hidden="true" /> {format.time(astronomy.sunset)}</span>
          </div>
        </>
      )}

      <div className="mt-3 flex items-center gap-3.5 border-t border-[var(--color-border)] pt-3.5">
        <span className="shrink-0 drop-shadow-sm">
          <MoonDisc fraction={moon.fraction} size={48} />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('weather.moonTonight')}</p>
          <p className="font-heading text-xl font-extrabold leading-tight">{t(MOON_PHASE_KEYS[moon.phaseIndex] as never)}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {t('weather.moonIllumination')} {format.percent(moon.illumination, 0)} · {t('weather.moonAgeDays', { days: format.number(Math.floor(moon.ageDays) + 1) })}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {t('weather.nextFullMoon', { date: format.date(nextFullMoon(now)) })} · {t('weather.nextNewMoon', { date: format.date(nextNewMoon(now)) })}
          </p>
        </div>
      </div>

      <p className="mt-3.5 text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">{t('weather.moonWeek')}</p>
      <div className="mt-1.5 flex items-start justify-between gap-1">
        {week.map((d) => (
          <span key={d.date.toISOString()} className="flex flex-col items-center gap-1">
            <MoonDisc fraction={d.fraction} size={26} />
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">{format.weekday(d.date)}</span>
          </span>
        ))}
      </div>
      <p className="mt-2.5 text-[10px] leading-snug text-[var(--color-text-muted)]">{t('weather.moonPathNote')}</p>
    </div>
  );
}

function ColdCta() {
  const { t } = useI18n();
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary)]/8 p-5 md:p-6" aria-labelledby="wx-cold">
      <h2 id="wx-cold" className="font-heading text-base font-extrabold">{t('clothing.warmTitle')}</h2>
      <p className="mt-1 max-w-prose text-sm leading-relaxed text-[var(--color-text-secondary)]">{t('clothing.warmBody')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/winter-clothing" className="rounded-full bg-[var(--color-accent-primary)] px-4 py-2 font-heading text-sm font-bold text-[var(--color-bg-primary)] transition-transform active:scale-[0.98]">
          {t('weather.noCoatCta')}
        </Link>
        <a href="https://www.boston.gov/cold" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-4 py-2 font-heading text-sm font-bold">
          {t('clothing.warmLink')} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

/** Keep unrecognized source wording intact and identify its language. */
function ForecastWind({ speed, direction }: { speed: string; direction: string | null }) {
  const { t, lang, format } = useI18n();
  const speedText = localizeWindSpeed(speed, lang, t, format.number);
  const directionText = localizeWindDirection(direction, lang, t);
  if (!speedText && !directionText) return null;
  const fallback = (speedText && speedText.language !== lang) || (directionText && directionText.language !== lang);
  return <>
    {speedText && <span lang={speedText.language} dir="auto">{speedText.text}</span>}
    {speedText && directionText && ' · '}
    {directionText && <span lang={directionText.language} dir="auto">{directionText.text}</span>}
    {fallback && <span className="ms-1 text-[10px] text-[var(--color-text-muted)]">({t('weather.windEnglish')})</span>}
  </>;
}

function HourlySection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, format } = useI18n();
  const readAt = new Date(payload.fetchedAt).getTime();
  const rows = payload.hourly.filter((h) => new Date(h.end).getTime() > readAt).slice(0, 24);
  if (!rows.length) return null;
  const preview = rows.slice(0, 8);

  return (
    <motion.section className={card} aria-labelledby="wx-hourly" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <h2 id="wx-hourly" className="font-heading text-base font-bold">{t('weather.hourly')}</h2>
      <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8" aria-label={t('weather.hourly')}>
        {preview.map((h, i) => (
          <li key={h.start} className="flex min-w-0 flex-col items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-2.5 text-center">
            <span className="whitespace-nowrap text-[11px] font-semibold text-[var(--color-text-secondary)]">{i === 0 ? t('weather.now') : format.time(h.start)}</span>
            <ConditionIcon kind={h.kind} isDay={h.isDay} className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="font-heading text-sm font-bold">{tempText(h.tempF, unit, format.number)}</span>
            {h.precipChance != null && h.precipChance >= 10 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent-primary)]">
                <Umbrella className="h-3 w-3" aria-hidden="true" /> {format.percent(h.precipChance / 100, 0)}
              </span>
            )}
          </li>
        ))}
      </ul>

      <WeatherDisclosure label={t('common.moreInfo')} className="mt-3" contentClassName="space-y-4">
        <div>
          <h3 className="font-heading text-sm font-bold">{t('weather.tempNext24')}</h3>
          <TempCurve hours={rows} labelFor={(f) => tempText(f, unit, format.number)} timeFor={(iso) => format.time(iso)} />
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">{t('weather.precipNext24')}</h3>
          <div className="mt-1"><PrecipBars hours={rows} timeFor={(iso) => format.time(iso)} labelFor={(f) => tempText(f, unit, format.number)} /></div>
        </div>
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
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
              <span className="min-w-0 text-xs leading-snug text-[var(--color-text-secondary)]">
                {h.shortForecast && <ForecastText text={h.shortForecast} />}
                {h.shortForecast && (h.windText || h.windDir) && ' · '}
                <ForecastWind speed={h.windText} direction={h.windDir} />
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
      </WeatherDisclosure>
    </motion.section>
  );
}

function DailySection({ payload, unit }: { payload: WeatherPayload; unit: TempUnit }) {
  const { t, lang, format } = useI18n();
  if (!payload.days.length) return null;
  const days = payload.days.slice(0, 7);
  const highs = days.map((d) => d.highF).filter((v): v is number => v != null);
  const lows = days.map((d) => d.lowF).filter((v): v is number => v != null);
  const weekHigh = highs.length ? Math.max(...highs) : 100;
  const weekLow = lows.length ? Math.min(...lows) : 0;

  return (
    <motion.section className={card} aria-labelledby="wx-daily" initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <h2 id="wx-daily" className="font-heading text-base font-bold">{t('weather.daily')}</h2>
      <ul className="mt-2 divide-y divide-[var(--color-border)]">
        {days.map((d, i) => (
          <li key={d.date} className="grid grid-cols-[5rem_1.75rem_3.2rem_2.9rem_minmax(0,1fr)_2.9rem] items-center gap-2 py-1.5">
            <span className="font-heading text-sm font-semibold">{i === 0 ? t('weather.today') : format.weekday(new Date(`${d.date}T12:00:00`))}</span>
            <ConditionIcon kind={d.kind} isDay className="h-5 w-5 text-[var(--color-accent-primary)]" />
            <span className="text-[11px] font-semibold text-[var(--color-accent-primary)]">
              {(d.precipChanceMax ?? 0) >= 10 ? format.percent((d.precipChanceMax ?? 0) / 100, 0) : ''}
            </span>
            <span className="text-right font-heading text-sm text-[var(--color-text-muted)]">{d.lowF != null ? tempText(d.lowF, unit, format.number) : '—'}</span>
            {d.lowF != null && d.highF != null ? (
              <TempRangeBar low={d.lowF} high={d.highF} weekLow={weekLow} weekHigh={weekHigh} current={i === 0 ? payload.current?.tempF : undefined} />
            ) : <span />}
            <span className="text-right font-heading text-sm font-bold">{d.highF != null ? tempText(d.highF, unit, format.number) : '—'}</span>
          </li>
        ))}
      </ul>

      {payload.daily.length > 0 && (
        <WeatherDisclosure label={t('common.moreInfo')} className="mt-3">
          <ul className="flex flex-col gap-2">
            {payload.daily.map((d) => {
              const period = translateWeatherPeriod(d.name, lang, t);
              return (
                <li key={`${d.name}-${d.start}`} className="rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] p-3.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <ConditionIcon kind={d.kind} isDay={d.isDay} className="h-6 w-6 text-[var(--color-accent-primary)]" />
                    <h3 className="font-heading text-sm font-extrabold" lang={period.language} dir="auto">{period.text}</h3>
                    <span className="font-heading text-base font-bold">{tempText(d.tempF, unit, format.number)}</span>
                    <ForecastText className="text-sm text-[var(--color-text-secondary)]" text={d.shortForecast} />
                    {d.precipChance != null && d.precipChance >= 10 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent-primary)]">
                        <Umbrella className="h-3 w-3" aria-hidden="true" /> {format.percent(d.precipChance / 100, 0)}
                      </span>
                    )}
                    {(d.windText || d.windDir) && <span className="text-[11px] text-[var(--color-text-muted)]"><ForecastWind speed={d.windText} direction={d.windDir} /></span>}
                  </div>
                  {d.detailedForecast && <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]" lang="en" dir="auto">{d.detailedForecast}</p>}
                </li>
              );
            })}
          </ul>
        </WeatherDisclosure>
      )}
    </motion.section>
  );
}
