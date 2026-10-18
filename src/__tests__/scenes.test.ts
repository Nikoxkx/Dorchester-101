/**
 * Theme scenes: the seasonal calendar (in Boston time, not the visitor's
 * timezone) and the store defaults that keep a first visit Classic.
 */
import { describe, expect, it } from 'vitest';
import { isInSeason, resolveScene, seasonalScene } from '@/lib/scenes';
import { DEFAULT_HOME_LAYOUT, HOME_SECTION_ORDER } from '@/stores/appStore';

describe('seasonal scene (Boston calendar)', () => {
  const at = (iso: string) => new Date(iso);

  it('October is Halloween, including the evening of the 31st', () => {
    expect(seasonalScene(at('2026-10-01T09:00:00-04:00'))).toBe('halloween');
    expect(seasonalScene(at('2026-10-31T21:00:00-04:00'))).toBe('halloween');
  });

  it('winter months are First Snow; September and November are Autumn', () => {
    expect(seasonalScene(at('2026-12-15T12:00:00-05:00'))).toBe('first-snow');
    expect(seasonalScene(at('2027-02-02T12:00:00-05:00'))).toBe('first-snow');
    expect(seasonalScene(at('2026-09-20T12:00:00-04:00'))).toBe('autumn');
    expect(seasonalScene(at('2026-11-20T12:00:00-05:00'))).toBe('autumn');
  });

  it('summer evenings are Harbor Sunset; spring stays Classic', () => {
    expect(seasonalScene(at('2026-07-04T20:00:00-04:00'))).toBe('harbor-sunset');
    expect(seasonalScene(at('2026-04-15T12:00:00-04:00'))).toBe('classic');
  });

  it('uses Boston time at month boundaries, not UTC', () => {
    // 2026-11-01T03:30Z is still Oct 31, 11:30 PM in Dorchester.
    expect(seasonalScene(at('2026-11-01T03:30:00Z'))).toBe('halloween');
    // And Nov 1, 12:30 AM Boston is autumn even though UTC says the 1st too.
    expect(seasonalScene(at('2026-11-01T04:30:00Z'))).toBe('autumn');
  });

  it('resolveScene only consults the calendar for `auto`', () => {
    const july = at('2026-07-04T12:00:00-04:00');
    expect(resolveScene('auto', july)).toBe('harbor-sunset');
    expect(resolveScene('halloween', july)).toBe('halloween');
    expect(resolveScene('classic', july)).toBe('classic');
  });

  it('isInSeason drives the Settings badge and excludes classic/auto', () => {
    const oct = at('2026-10-15T12:00:00-04:00');
    expect(isInSeason('halloween', oct)).toBe(true);
    expect(isInSeason('first-snow', oct)).toBe(false);
    expect(isInSeason('classic', oct)).toBe(false);
    expect(isInSeason('auto', oct)).toBe(false);
  });
});

describe('homepage layout defaults', () => {
  it('starts with every section visible in the shipped order', () => {
    expect(DEFAULT_HOME_LAYOUT.order).toEqual(HOME_SECTION_ORDER);
    expect(DEFAULT_HOME_LAYOUT.hidden).toEqual([]);
    expect(DEFAULT_HOME_LAYOUT.cardStyle).toBe('match');
    // The emergency banner is not furniture: it can never be a slot.
    expect(HOME_SECTION_ORDER).not.toContain('emergency');
  });
});
