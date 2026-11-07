import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { useAppStore } from '@/stores/appStore';

const payload = vi.hoisted(() => ({
  status: 'live',
  fetchedAt: '2099-01-01T00:00:00Z',
  issuedAt: null,
  source: { name: 'nws', url: 'https://weather.gov/', office: null, grid: null },
  point: { lat: 42.3, lon: -71.07, city: 'Boston', state: 'MA', timeZone: 'America/New_York' },
  current: null,
  hourly: Array.from({ length: 8 }, (_, i) => ({
    start: new Date(Date.UTC(2099, 0, 1, i)).toISOString(),
    end: new Date(Date.UTC(2099, 0, 1, i + 1)).toISOString(),
    isDay: true,
    tempF: 58 + i,
    feelsLikeF: 58 + i,
    kind: 'partly',
    shortForecast: 'Partly Cloudy',
    precipChance: null,
    humidity: 50,
    dewpointF: 40,
    windMph: 5,
    windText: '5 mph',
    windDir: 'NW',
  })),
  daily: [],
  days: Array.from({ length: 7 }, (_, i) => ({
    date: `2099-01-${String(i + 1).padStart(2, '0')}`,
    highF: 62 + i,
    lowF: 48 + i,
    precipChanceMax: i === 0 ? 20 : 0,
    kind: 'partly',
    hasSnow: false,
    hasRain: false,
  })),
  alerts: [],
  alertsStatus: 'live',
  astronomy: null,
}));

vi.mock('@/hooks/useWeather', () => ({
  useWeather: () => ({ data: payload, loading: false, unavailable: false, fromCacheAt: null, refresh: vi.fn() }),
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href as string} {...props}>{children}</a>,
}));
vi.mock('@/components/weather/WeatherVisuals', () => ({
  PrecipBars: () => <div data-testid="precip-chart" />,
  TempCurve: () => <div data-testid="temperature-chart" />,
  TempRangeBar: () => <span data-testid="temperature-range" />,
}));

import { WeatherPanel } from '@/components/weather/WeatherPanel';

beforeEach(() => {
  useAppStore.getState().resetAll();
  useAppStore.getState().setAccessibility('reduceMotion', 'on');
});

describe('concise homepage weather', () => {
  it('keeps eight upcoming hours and the week visible, with charts behind a disclosure', () => {
    const { container } = render(<WeatherPanel />);
    const t = dictionaries.en;
    const details = container.querySelector<HTMLDetailsElement>('details[data-weather-disclosure]');

    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    expect(container.querySelectorAll('.snap-x > div')).toHaveLength(8);
    expect(container.querySelectorAll('.wx-module ul > li')).toHaveLength(7);
    expect(screen.getByText(t['weather.daily'])).toBeTruthy();
    expect(details?.querySelector('[data-testid="temperature-chart"]')).not.toBeNull();

    fireEvent.click(details!.querySelector('summary')!);
    expect(details?.open).toBe(true);
    expect(details?.querySelector('summary')?.textContent).toContain(t['common.showLess']);
  });
});
