import { describe, expect, it } from 'vitest';
import { GET as health } from '@/app/api/health/route';
import { GET as housing } from '@/app/api/housing/route';
import { GET as food } from '@/app/api/food/route';
import { GET as resources } from '@/app/api/resources/route';
import { GET as notifications } from '@/app/api/notifications/route';
import { POST as notificationsPost } from '@/app/api/notifications/route';
import { GET as market } from '@/app/api/market-data/route';
import { GET as map } from '@/app/api/map/route';
import { GET as faq } from '@/app/api/faq/route';

describe('API routes', () => {
  it('health reports ok', async () => {
    const res = await health();
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('housing returns BHA status and listings', async () => {
    const res = await housing();
    const data = await res.json();
    expect(data.bha.section8TenantBased).toBe('closed');
    expect(Array.isArray(data.listings)).toBe(true);
  });

  it('food returns sites', async () => {
    const res = await food();
    const data = await res.json();
    expect(Array.isArray(data.sites)).toBe(true);
    expect(data.sites.length).toBeGreaterThan(0);
  });

  it('resources lists organizations', async () => {
    const res = await resources(new Request('http://localhost/api/resources'));
    const data = await res.json();
    expect(data.resources.length).toBeGreaterThan(0);
  });

  it('notifications include BHA closed notice', async () => {
    const res = await notifications();
    const data = await res.json();
    expect(data.notifications.length).toBeGreaterThan(0);
    expect(data.unreadCount).toBeGreaterThan(0);
    expect(data.notifications.some((n: { id: string }) => n.id === 'bha-s8')).toBe(true);
  });

  it('notifications POST acknowledges read', async () => {
    const res = await notificationsPost();
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('market data wraps published estimates', async () => {
    const res = await market();
    const data = await res.json();
    expect(data.data.medianRent.twoBed.value).toBeGreaterThan(2000);
    expect(data.data.rentBurdenAnalysis.dorchesterMedianIncome).toBe(82953);
  });

  it('map returns pins', async () => {
    const res = await map();
    const data = await res.json();
    expect(data.locations.length).toBeGreaterThan(5);
  });

  it('faq returns categories', async () => {
    const res = await faq();
    const data = await res.json();
    expect(Array.isArray(data.categories)).toBe(true);
  });
});
