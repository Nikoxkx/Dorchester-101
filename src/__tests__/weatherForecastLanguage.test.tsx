import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { LANGUAGES, languageMeta } from '@/i18n/config';
import { makeTranslator } from '@/i18n/runtime';
import { translateWeatherPeriod } from '@/i18n/weatherPeriod';
import { localizeShortForecast } from '@/i18n/weatherForecast';
import { localizeWindDirection, localizeWindSpeed } from '@/i18n/weatherWind';
import { formatDecimal, formatNumber } from '@/i18n/formatters';
import { formatWeekdayIndex } from '@/lib/hours';
import { useAppStore } from '@/stores/appStore';

const payload = vi.hoisted(() => ({
  status: 'live', fetchedAt: '2026-10-31T12:00:00Z', current: null, days: [],
  source: { name: 'nws', url: 'https://weather.gov/', office: null, grid: null },
  point: { lat: 42.3, lon: -71.07, city: 'Boston', state: 'MA', timeZone: 'America/New_York' },
  alerts: [], alertsStatus: 'live', astronomy: null,
  hourly: [{
    start: '2026-11-02T00:00:00Z', end: '2026-11-02T01:00:00Z', isDay: false,
    tempF: 48, feelsLikeF: 48, kind: 'rain', shortForecast: 'Chance Rain Showers',
    precipChance: null, humidity: null, dewpointF: null, windMph: null, windText: '5 to 10 mph', windDir: 'NW',
  }],
  daily: [{
    name: 'Monday Night', start: '2026-11-03T00:00:00Z', end: '2026-11-03T12:00:00Z', isDay: false,
    tempF: 45, kind: 'rain', shortForecast: 'Chance Rain Showers', detailedForecast: 'A chance of rain after midnight.',
    precipChance: 40, windText: '5 to 10 mph', windDir: 'NW',
  }, {
    name: 'New Publisher Label', start: '2026-11-04T00:00:00Z', end: '2026-11-04T12:00:00Z', isDay: false,
    tempF: 46, kind: 'unknown', shortForecast: '', detailedForecast: '',
    precipChance: null, windText: '', windDir: null,
  }],
}));
vi.mock('@/hooks/useWeather', () => ({ useWeather: () => ({ data: payload, loading: false, unavailable: false, refresh: vi.fn() }) }));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));

import WeatherPageView from '@/app/weather/WeatherPageView';
import { PrecipBars, SunArc, TempCurve, WindCompass } from '@/components/weather/WeatherVisuals';
import { tipText } from '@/components/weather/shared';
import type { HourlyPeriod } from '@/lib/weather';

beforeEach(() => {
  useAppStore.getState().resetAll();
  useAppStore.getState().setWeatherEnabled(true);
  useAppStore.getState().setWeatherLayout({ order: ['hourly', 'daily'], hidden: [] });
  useAppStore.getState().setAccessibility('reduceMotion', 'on');
});

describe('weather period language', () => {
  it.each(LANGUAGES)('translates recognized period names without guessing unknown ones in $nativeName', ({ code }) => {
    const t = makeTranslator(dictionaries[code], code);
    const weekday = formatWeekdayIndex(0, languageMeta(code).intlLocale);
    expect(translateWeatherPeriod(' Monday  Night ', code, t)).toEqual({ text: t('weather.periodNight', { day: weekday }), language: code });
    expect(translateWeatherPeriod('Monday', code, t)).toEqual({ text: weekday, language: code });
    expect(translateWeatherPeriod('Tonight', code, t)).toEqual({ text: t('weather.tonight'), language: code });
    expect(translateWeatherPeriod('This Afternoon', code, t)).toEqual({ text: t('weather.thisAfternoon'), language: code });
    expect(translateWeatherPeriod('New Publisher Label', code, t)).toEqual({ text: 'New Publisher Label', language: 'en' });
    expect(translateWeatherPeriod('toString', code, t)).toEqual({ text: 'toString', language: 'en' });
  });

  it.each(LANGUAGES)('localizes only known wind forms in $nativeName', ({ code }) => {
    const t = makeTranslator(dictionaries[code], code);
    const number = (value: number) => formatNumber(value, code);
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;
    for (const direction of directions) {
      expect(localizeWindDirection(direction.toLowerCase(), code, t)).toEqual({
        text: t('weather.windFrom', { direction: t(`weather.direction.${direction}`) }), language: code,
      });
    }
    expect(localizeWindSpeed('5 to 10 mph', code, t, number)).toEqual({
      text: t('weather.windMph', { speed: `${number(5)}–${number(10)}` }), language: code,
    });
    expect(localizeWindSpeed('0 mph', code, t, number)).toEqual({ text: t('weather.windMph', { speed: number(0) }), language: code });
    expect(localizeWindSpeed('Calm', code, t, number)).toEqual({ text: t('weather.windCalm'), language: code });
    for (const source of ['5 mph gusting 20 mph', '10 km/h', '5.5 mph', '15 mph becoming 25 mph']) {
      expect(localizeWindSpeed(source, code, t, number)).toEqual({ text: source, language: 'en' });
    }
    expect(localizeWindDirection('Northwest, shifting east', code, t)).toEqual({ text: 'Northwest, shifting east', language: 'en' });
    expect(localizeWindDirection(null, code, t)).toBeNull();
    const tip = tipText(t, { kind: 'windbreaker', scope: 'today', priority: 1, values: { gustMph: 23 } }, 'F', {
      number, percent: () => '', time: () => '',
    });
    expect(tip).toContain(t('weather.windMph', { speed: number(23) }));
  });

  it.each(LANGUAGES)('translates exact short forecasts in $nativeName, but never guesses a compound', ({ code }) => {
    const known = localizeShortForecast('Chance Rain Showers', code);
    expect(known.language).toBe(code);
    expect(known.text.trim()).toBeTruthy();
    const slight = localizeShortForecast('Slight Chance Rain Showers', code);
    expect(slight.language).toBe(code);
    expect(slight.text).not.toBe(known.text);
    for (const source of ['Chance Rain Showers then Snow', 'Heavy Rain and Windy', 'toString']) {
      expect(localizeShortForecast(source, code)).toEqual({ text: source, language: 'en' });
    }
  });

  it('translates common wind and exact forecast wording in hourly and daily rows', () => {
    useAppStore.getState().setLanguage('es');
    render(<WeatherPageView />);
    const t = makeTranslator(dictionaries.es, 'es');
    const speed = t('weather.windMph', { speed: '5–10' });
    const direction = t('weather.windFrom', { direction: t('weather.direction.NW') });
    expect(screen.getAllByText(speed)).toHaveLength(2);
    expect(screen.getAllByText(direction)).toHaveLength(2);
    for (const node of screen.getAllByText(direction)) expect(node.getAttribute('lang')).toBe('es');
    for (const node of screen.getAllByText(localizeShortForecast('Chance Rain Showers', 'es').text)) expect(node.getAttribute('lang')).toBe('es');
  });

  it('preserves and discloses unfamiliar wind wording instead of guessing', () => {
    useAppStore.getState().setLanguage('es');
    const source = payload.hourly[0].windText;
    const direction = payload.hourly[0].windDir;
    payload.hourly[0].windText = '5 mph gusting 20 mph';
    payload.hourly[0].windDir = 'Variable and shifting';
    try {
      render(<WeatherPageView />);
      expect(screen.getByText('5 mph gusting 20 mph').getAttribute('lang')).toBe('en');
      expect(screen.getByText('Variable and shifting').getAttribute('lang')).toBe('en');
      expect(screen.getByText(`(${dictionaries.es['weather.windEnglish']})`)).toBeTruthy();
    } finally {
      payload.hourly[0].windText = source;
      payload.hourly[0].windDir = direction;
    }
  });

  it('localizes current wind, source disclosure and precise visibility and pressure', () => {
    useAppStore.getState().setLanguage('es');
    useAppStore.getState().setWeatherLayout({ order: ['current', 'hourly', 'daily'], hidden: [] });
    Object.assign(payload, { current: {
      observedAt: '2026-10-31T12:00:00Z', stationId: 'station', stationName: 'Boston Logan', text: 'Light Rain',
      kind: 'rain', isDay: true, tempF: 54, feelsLikeF: 52, windChillF: null, heatIndexF: null,
      humidity: 90, dewpointF: null, windMph: 12, windGustMph: 22, windDir: 'NW', pressureInHg: 29.92, visibilityMi: 7.6,
    } });
    try {
      render(<WeatherPageView />);
      const t = makeTranslator(dictionaries.es, 'es');
      expect(screen.getByText('Lluvia ligera').getAttribute('lang')).toBe('es');
      expect(screen.getByText(dictionaries.es['weather.shortTranslationNote'])).toBeTruthy();
      expect(screen.getByText(t('weather.windMph', { speed: '12' }))).toBeTruthy();
      expect(screen.getByText(t('weather.milesValue', { value: formatDecimal(7.6, 'es', 1) }))).toBeTruthy();
      expect(screen.getByText(t('weather.pressureValue', { value: formatDecimal(29.92, 'es', 2) }))).toBeTruthy();
      expect(screen.queryByText(/30 pulgadas de mercurio/)).toBeNull();
    } finally { Object.assign(payload, { current: null }); }
  });

  it('localizes compass labels and does not invent an arrow for unknown direction', () => {
    useAppStore.getState().setLanguage('es');
    const { container, rerender } = render(<WindCompass dir={null} />);
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.textContent).toContain(dictionaries.es['weather.direction.W']);
    expect(svg.querySelector('g')).toBeNull();
    rerender(<WindCompass dir="NW" />);
    expect(svg.querySelector('g')?.getAttribute('transform')).toBe('rotate(135 48 48)');
  });

  it('localizes daylight duration in the chart accessible name', () => {
    useAppStore.getState().setLanguage('vi');
    const t = makeTranslator(dictionaries.vi, 'vi');
    render(<SunArc sunrise="2026-10-31T11:00:00Z" sunset="2026-10-31T21:30:00Z" nowMs={Date.parse('2026-10-31T16:00:00Z')} />);
    const expected = `${t('weather.daylight')} ${t('map.arrivalHours', { hours: '10', minutes: '30' })}`;
    expect(screen.getByRole('img', { name: expected })).toBeTruthy();
  });

  it('switches recognized short forecasts while keeping detailed prose in English', () => {
    render(<WeatherPageView />);
    for (const { code } of LANGUAGES) {
      act(() => useAppStore.getState().setLanguage(code));
      const t = makeTranslator(dictionaries[code], code);
      const weekday = formatWeekdayIndex(0, languageMeta(code).intlLocale);
      const heading = screen.getByRole('heading', { name: t('weather.periodNight', { day: weekday }) });
      expect(heading.getAttribute('lang')).toBe(code);
      expect(screen.getByText('New Publisher Label').getAttribute('lang')).toBe('en');
      const short = localizeShortForecast('Chance Rain Showers', code);
      for (const text of screen.getAllByText(short.text)) expect(text.getAttribute('lang')).toBe(short.language);
      expect(screen.getByText('A chance of rain after midnight.').getAttribute('lang')).toBe('en');
      expect(screen.getAllByText(t('weather.forecastTextNote')).length).toBe(2);
    }
  });

  it('keeps the chart value and recognized forecast localized for screen readers', () => {
    useAppStore.getState().setLanguage('es');
    const hours = [payload.hourly[0], { ...payload.hourly[0], start: '2026-11-02T01:00:00Z', tempF: 45, precipChance: 40 }];
    render(<TempCurve hours={hours as HourlyPeriod[]} timeFor={() => '12:00'} labelFor={(temp) => `${temp}°F`} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuetext')).not.toContain('Chance Rain Showers');
    const status = screen.getByRole('status');
    const forecast = status.querySelector('[lang="es"]');
    expect(forecast?.textContent).toBe(localizeShortForecast('Chance Rain Showers', 'es').text);
    expect(slider.getAttribute('aria-describedby')).toBe(status.id);
  });

  it('does not turn a missing precipitation probability into zero', () => {
    useAppStore.getState().setLanguage('es');
    render(<PrecipBars hours={payload.hourly as HourlyPeriod[]} timeFor={() => '12:00'} />);
    const t = makeTranslator(dictionaries.es, 'es');
    const button = screen.getByRole('button', { name: `12:00 · ${t('weather.precipChance')}: ${t('market.unavailable')}` });
    expect(button.textContent).toContain('—');
    expect(button.getAttribute('aria-label')).not.toContain('0%');
    fireEvent.focus(button);
    expect(screen.getByRole('status').textContent).toContain(t('market.unavailable'));
    expect(screen.getByRole('status').textContent).not.toContain('0%');
    expect(screen.getByText(localizeShortForecast('Chance Rain Showers', 'es').text).getAttribute('lang')).toBe('es');
  });
});
