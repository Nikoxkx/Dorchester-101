import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { useAppStore } from '@/stores/appStore';
import { PRIVACY_STORAGE_KEY, readAnalyticsChoice, usePrivacyStore } from '@/stores/privacyStore';

vi.mock('@vercel/analytics/next', () => ({ Analytics: () => <div data-testid="analytics-sdk" /> }));
vi.mock('@vercel/speed-insights/next', () => ({ SpeedInsights: () => <div data-testid="speed-sdk" /> }));

import { ConsentNotice } from '@/components/a11y/ConsentNotice';
import { PrivacyAnalytics, privacyFilteredEvent } from '@/components/providers/PrivacyAnalytics';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
  useAppStore.getState().setConsentSeen(false);
  usePrivacyStore.getState().choose('unset');
  usePrivacyStore.getState().markHydrated();
});

describe('optional analytics privacy choice', () => {
  it('does not treat a previous informational acknowledgement as consent', () => {
    useAppStore.getState().setConsentSeen(true);
    render(<ConsentNotice />);
    expect(screen.getByRole('dialog', { name: dictionaries.en['consent.title'] })).toBeTruthy();
    expect(screen.getByRole('link', { name: dictionaries.en['consent.policy'] }).getAttribute('href')).toBe('/privacy');
    expect(screen.getByRole('link', { name: dictionaries.en['consent.settingsLink'] }).getAttribute('href')).toBe('/settings#privacy');
    expect(screen.getByRole('link', { name: dictionaries.en['consent.permissions'] }).getAttribute('href')).toBe('/settings#permissions');
    fireEvent.click(screen.getByRole('button', { name: dictionaries.en['consent.decline'] }));
    expect(usePrivacyStore.getState().choice).toBe('decline');
    expect(readAnalyticsChoice(localStorage.getItem(PRIVACY_STORAGE_KEY))).toBe('decline');
  });

  it('does not mount either SDK until an explicit positive choice, and blocks sends on withdrawal', () => {
    render(<PrivacyAnalytics />);
    expect(screen.queryByTestId('analytics-sdk')).toBeNull();
    expect(screen.queryByTestId('speed-sdk')).toBeNull();
    const event = { type: 'pageview' as const, url: 'https://example.org/resources?search=private#details' };
    expect(privacyFilteredEvent(event)).toBeNull();
    act(() => usePrivacyStore.getState().choose('decline'));
    expect(screen.queryByTestId('analytics-sdk')).toBeNull();
    act(() => usePrivacyStore.getState().choose('allow'));
    expect(screen.getByTestId('analytics-sdk')).toBeTruthy();
    expect(screen.getByTestId('speed-sdk')).toBeTruthy();
    expect(privacyFilteredEvent(event)?.url).toBe('https://example.org/resources');
    act(() => usePrivacyStore.getState().choose('decline'));
    expect(screen.queryByTestId('analytics-sdk')).toBeNull();
    expect(privacyFilteredEvent(event)).toBeNull();
  });

  it('honors a choice changed or cleared in another tab', () => {
    usePrivacyStore.getState().choose('allow');
    render(<PrivacyAnalytics />);
    const event = { type: 'pageview' as const, url: 'https://example.org/' };
    expect(privacyFilteredEvent(event)).toBeTruthy();
    act(() => window.dispatchEvent(new StorageEvent('storage', {
      key: PRIVACY_STORAGE_KEY, newValue: JSON.stringify({ state: { choice: 'decline' }, version: 1 }), storageArea: localStorage,
    })));
    expect(usePrivacyStore.getState().choice).toBe('decline');
    expect(privacyFilteredEvent(event)).toBeNull();
    act(() => window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage })));
    expect(usePrivacyStore.getState().choice).toBe('unset');
    expect(privacyFilteredEvent(event)).toBeNull();
  });

  it('defaults invalid or missing storage to off', () => {
    expect(readAnalyticsChoice(null)).toBe('unset');
    expect(readAnalyticsChoice('{bad json')).toBe('unset');
    expect(readAnalyticsChoice('{"state":{"choice":"yes"}}')).toBe('unset');
    expect(readAnalyticsChoice('{"state":{"choice":"allow"}}')).toBe('allow');
  });
});
