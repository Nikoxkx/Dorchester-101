import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppStore } from '@/stores/appStore';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';

const alert = vi.hoisted(() => ({
  id: 'nws-1', event: 'Winter Storm Warning', severity: 'Severe', certainty: null, urgency: null,
  headline: 'Heavy snow expected', description: 'Avoid travel.', instruction: 'Stay inside.',
  senderName: null, areas: null, onset: null, ends: null, expires: null, url: 'https://weather.gov/',
}));
vi.mock('@/hooks/useWeather', () => ({
  useWeather: () => ({ data: { alerts: [alert], alertsStatus: 'live', hourly: [], days: [], current: null }, loading: false, unavailable: false, refresh: vi.fn() }),
}));
vi.mock('@/components/layout/MainLayout', () => ({ MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock('@/components/layout/ProjectNote', () => ({ ProjectNote: () => null }));

import WeatherPageView from '@/app/weather/WeatherPageView';
import { WeatherAlertBanner } from '@/components/weather/WeatherAlertBanner';

beforeEach(() => {
  useAppStore.getState().setLanguage('es');
  useAppStore.getState().setWeatherEnabled(false);
});

describe('weather alert language', () => {
  it('translates severity while retaining and labeling the official alert text', () => {
    render(<WeatherPageView />);
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByText(t('weather.severity.Severe'))).toBeTruthy();
    expect(screen.getByText(t('weather.alertEnglish'))).toBeTruthy();
    expect(screen.getByText('Winter Storm Warning').getAttribute('lang')).toBe('en');
    expect(screen.getByText('Stay inside.').getAttribute('lang')).toBe('en');
  });

  it('labels official English alert copy on the site-wide banner', () => {
    render(<WeatherAlertBanner />);
    const t = makeTranslator(dictionaries.es, 'es');
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText(t('weather.alertEnglish'))).toBeTruthy();
    expect(screen.getByText('Heavy snow expected').getAttribute('lang')).toBe('en');
  });
});
