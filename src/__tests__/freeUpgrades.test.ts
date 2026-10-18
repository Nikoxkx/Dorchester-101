import { describe, expect, it, beforeEach } from 'vitest';
import { buildIcs, googleCalendarUrl } from '@/lib/calendar';
import { BADGES } from '@/lib/badges';
import { useBadgeStore } from '@/stores/badgeStore';

describe('calendar helpers', () => {
  it('generates a valid RFC 5545 VCALENDAR with escaped text and UTC timestamps', () => {
    const ics = buildIcs({
      title: 'Metrolist Lottery: Dot Block, Phase 2',
      description: 'Check eligibility; bring income docs',
      location: '1203 Dorchester Ave, Dorchester, MA',
      url: 'https://www.boston.gov/metrolist',
      start: '2026-11-01T14:00:00.000Z',
      end: '2026-11-01T15:00:00.000Z',
    });

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART:20261101T140000Z');
    expect(ics).toContain('DTEND:20261101T150000Z');
    expect(ics).toContain('SUMMARY:Metrolist Lottery: Dot Block\\, Phase 2');
    expect(ics).toContain('URL:https://www.boston.gov/metrolist');
    expect(ics).toContain('END:VCALENDAR');
  });

  it('builds a Google Calendar template URL', () => {
    const url = new URL(
      googleCalendarUrl({
        title: 'Metrolist Check-in',
        description: 'Weekly lottery check',
        start: '2026-11-01T14:00:00.000Z',
        end: '2026-11-01T15:00:00.000Z',
      }),
    );
    expect(url.hostname).toBe('calendar.google.com');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Metrolist Check-in');
    expect(url.searchParams.get('dates')).toBe('20261101T140000Z/20261101T150000Z');
  });
});

describe('Explorer badges', () => {
  beforeEach(() => {
    useBadgeStore.getState().reset();
  });

  it('defines 9 distinct badges and records earned timestamps once', () => {
    expect(BADGES).toHaveLength(9);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(9);

    useBadgeStore.getState().earn('first-visit');
    const firstStamp = useBadgeStore.getState().earned['first-visit'];
    expect(firstStamp).toBeTruthy();

    useBadgeStore.getState().earn('first-visit');
    expect(useBadgeStore.getState().earned['first-visit']).toBe(firstStamp);
  });
});
