import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dictionaries } from '@/i18n';
import { makeTranslator } from '@/i18n/runtime';
import { formatClockMinutesForLocale } from '@/lib/hours';
import { useAppStore } from '@/stores/appStore';

vi.mock('@/lib/mbta', () => ({ fetchAlerts: vi.fn() }));
vi.mock('@/hooks/useLivePolling', () => ({ useLivePolling: () => ({ enabled: false, intervalMs: 300_000 }) }));
vi.mock('@/components/providers/LiveRegion', () => ({ useAnnounce: () => () => {} }));

import { fetchAlerts } from '@/lib/mbta';
import { GET } from '@/app/api/notifications/route';
import { NotificationPanel } from '@/components/layout/NotificationPanel';

beforeEach(() => {
  useAppStore.getState().resetAll();
  localStorage.removeItem('dor101:read-notifications');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('live notification language and hours', () => {
  it('calculates the hotline closing time in Boston, independent of server timezone', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-04T22:30:00Z')); // Friday 6:30 PM in Boston
    vi.mocked(fetchAlerts).mockResolvedValue({ alerts: [], fetchedAt: '2026-09-04T22:29:00Z', source: 'mbta-live', status: 'ok' } as never);
    const response = await GET(new Request('http://localhost/api/notifications?categories=food'));
    const body = await response.json();
    const hotline = body.notifications.find((item: { id: string }) => item.id === 'open-bostons-food-district');
    expect(hotline).toMatchObject({
      kind: 'closing-soon',
      sourceKey: 'map.food',
      params: { minutes: 30, closesAtMinutes: 19 * 60 },
      expiresAt: '2026-09-04T23:00:00.000Z',
    });
    expect(body.notifications.find((item: { id: string }) => item.id === 'open-dorchester-food-coop')).toBeUndefined();

    vi.setSystemTime(new Date('2026-09-04T23:01:00Z')); // after 7 PM Boston
    const later = await (await GET(new Request('http://localhost/api/notifications?categories=food'))).json();
    expect(later.notifications.find((item: { id: string }) => item.id === 'open-bostons-food-district')).toBeUndefined();
  });

  it('does not emit an open or closing alert for the holiday-sensitive library', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-06T21:30:00Z')); // branch closed early at 4 PM
    const body = await (await GET(new Request('http://localhost/api/notifications?categories=school&transit=0'))).json();
    expect(body.notifications.find((item: { id: string }) => item.id === 'open-grove-hall-library')).toBeUndefined();
  });

  it('does not claim a 24-hour line closes at midnight', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-05T03:45:00Z')); // 11:45 PM Friday Boston
    vi.mocked(fetchAlerts).mockResolvedValue({ alerts: [], fetchedAt: '2026-09-05T03:44:00Z', source: 'mbta-live', status: 'ok' } as never);
    const body = await (await GET(new Request('http://localhost/api/notifications?categories=community'))).json();
    expect(body.notifications.find((item: { id: string }) => item.id === 'open-boston-language-access')).toBeUndefined();
  });

  it('returns matching alerts and respects disabled and partial feeds', async () => {
    const alerts = [
      { id: 'red', header: 'Red delay', effect: 'DELAY', severity: 'minor', routeIds: ['Red'], lastModified: null, validUntil: null },
      { id: 'rail', header: 'Fairmount delay', effect: 'DELAY', severity: 'minor', routeIds: ['CR-Fairmount'], lastModified: null, validUntil: null },
    ];
    vi.mocked(fetchAlerts).mockResolvedValue({ alerts, fetchedAt: '2026-09-04T22:29:00Z', source: 'mbta-live', status: 'partial' } as never);
    const filtered = await (await GET(new Request('http://localhost/api/notifications?lines=CR-Fairmount'))).json();
    expect(filtered.alertsSource).toBe('partial');
    expect(filtered.notifications.filter((n: { kind: string }) => n.kind === 'transit').map((n: { id: string }) => n.id)).toEqual(['mbta-rail']);
    const all = await (await GET(new Request('http://localhost/api/notifications'))).json();
    expect(all.notifications.filter((n: { kind: string }) => n.kind === 'transit')).toHaveLength(2);
    vi.mocked(fetchAlerts).mockClear();
    const disabled = await (await GET(new Request('http://localhost/api/notifications?transit=0'))).json();
    expect(disabled.alertsSource).toBe('disabled');
    expect(disabled.notifications.some((n: { kind: string }) => n.kind === 'transit')).toBe(false);
    expect(fetchAlerts).not.toHaveBeenCalled();
  });

  it('requests the selected official alert language and propagates its language tag', async () => {
    vi.mocked(fetchAlerts).mockResolvedValue({
      alerts: [{ id: 'red', header: 'Retraso en la Línea Roja', headerLanguage: 'es-MX', effect: 'DELAY', severity: 'minor', routeIds: ['Red'], lastModified: null, validUntil: null }],
      fetchedAt: '2026-09-04T22:29:00Z', source: 'mbta-live', status: 'ok',
    } as never);
    const body = await (await GET(new Request('http://localhost/api/notifications?lang=es'))).json();
    expect(fetchAlerts).toHaveBeenLastCalledWith('es');
    expect(body.notifications.find((item: { kind: string }) => item.kind === 'transit')).toMatchObject({
      contentLanguage: 'es-MX', params: { header: 'Retraso en la Línea Roja' },
    });
  });

  it('does not call an official Spanish alert English', async () => {
    useAppStore.getState().setLanguage('es');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      notifications: [{ id: 'transit-es', kind: 'transit', titleKey: 'notifications.transitAlert', params: { header: 'Retraso en la Línea Roja' }, contentLanguage: 'es-MX', href: '/map', priority: 'high', occurredAt: '2026-09-04T22:30:00Z', sourceLabel: 'MBTA' }],
      total: 1, status: 'ok', alertsSource: 'mbta',
    }) }));
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: dictionaries.es['notifications.label'].replace('{count}', '0') }));
    const headline = await screen.findByText('Retraso en la Línea Roja');
    expect(headline.getAttribute('lang')).toBe('es-MX');
    expect(screen.queryByText(dictionaries.es['notifications.transitOriginal'])).toBeNull();
  });

  it('sends route ids rather than feed ids when only commuter-rail notices are enabled', async () => {
    useAppStore.getState().setEnabledTransitFeeds(['mbta-cr']);
    const request = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notifications: [], total: 0, status: 'quiet', alertsSource: 'mbta' }) });
    vi.stubGlobal('fetch', request);
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Updates, 0 unread' }));
    await screen.findByText(dictionaries.en['notifications.emptyTransit']);
    expect(request.mock.calls[0][0]).toContain('lines=CR-Fairmount');
    expect(request.mock.calls[0][0]).not.toContain('lines=mbta-cr');
  });

  it('localizes category and clock while clearly marking the original transit alert', async () => {
    const notifications = [
      { id: 'transit-1', kind: 'transit', titleKey: 'notifications.transitAlert', params: { header: 'Shuttle buses replace trains' }, href: '/map', priority: 'high', occurredAt: '2026-09-04T22:30:00Z', sourceLabel: 'MBTA' },
      { id: 'food-1', kind: 'closing-soon', titleKey: 'notifications.closingSoon', params: { name: 'Project Bread FoodSource Hotline', minutes: 30, closesAt: '7 PM', closesAtMinutes: 1140 }, href: '/food', priority: 'high', occurredAt: '2026-09-04T22:30:00Z', sourceLabel: 'Food help', sourceKey: 'map.food' },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ notifications, total: 2, status: 'ok', alertsSource: 'mbta' }) }));
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Updates, 0 unread' }));
    await screen.findByText('Shuttle buses replace trains');
    expect(screen.getByText('Shuttle buses replace trains').getAttribute('lang')).toBe('en');

    act(() => useAppStore.getState().setLanguage('es'));
    expect(screen.getByText(dictionaries.es['notifications.transitOriginal'])).toBeTruthy();
    const dialog = screen.getByRole('dialog', { name: dictionaries.es['notifications.title'] });
    expect(within(dialog).getByText(dictionaries.es['map.food'])).toBeTruthy();
    const expected = makeTranslator(dictionaries.es, 'es')('notifications.closingSoon', {
      name: 'Project Bread FoodSource Hotline', minutes: '30', closesAt: formatClockMinutesForLocale(1140, 'es-MX'),
    });
    expect(within(dialog).getByText(expected)).toBeTruthy();
    expect(within(dialog).queryByText('Food help')).toBeNull();

    act(() => useAppStore.getState().setLanguage('ar'));
    expect(screen.getByText(dictionaries.ar['notifications.transitOriginal'])).toBeTruthy();
    expect(screen.getByText('Shuttle buses replace trains').getAttribute('lang')).toBe('en');
  });

  it('warns if the alert feed fails even when other notifications exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      notifications: [{ id: 'review', kind: 'needs-review', titleKey: 'notifications.reviewBacklog', params: { count: 3 }, href: '/about', priority: 'low', occurredAt: '2026-09-04T22:30:00Z', sourceLabel: 'DOR101' }],
      total: 1, status: 'ok', alertsSource: 'unavailable',
    }) }));
    useAppStore.getState().setLanguage('es');
    render(<NotificationPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Avisos, 0 sin leer' }));
    expect(await screen.findByText(dictionaries.es['notifications.alertsUnavailable'])).toBeTruthy();
    expect(screen.queryByText(dictionaries.es['notifications.emptyTransit'])).toBeNull();
  });
});
