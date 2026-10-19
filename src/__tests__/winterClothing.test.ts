/**
 * The winter-clothing dataset is advice a cold person may act on, so its
 * shape is guarded like the directory's: every record complete, every
 * check date real, seasonal math right, and no program quietly posing as
 * a walk-in when coats only move through partners.
 */
import { describe, expect, it } from 'vitest';
import {
  CLOTHING_LOCATORS,
  CLOTHING_PLACES,
  WINTER_CLOTHING,
  clothingCheckLevel,
  clothingCheckedAge,
  inSeason,
} from '@/data/winterClothing';

describe('winter clothing dataset', () => {
  it('every record is complete enough to act on', () => {
    for (const place of WINTER_CLOTHING) {
      expect(place.id, place.name).toBeTruthy();
      expect(place.name).toBeTruthy();
      expect(place.website).toMatch(/^https:\/\//);
      expect(place.summary.en.length).toBeGreaterThan(40);
      expect(place.howToGet.length).toBeGreaterThan(40);
      expect(place.audiences.length).toBeGreaterThan(0);
      expect(place.offers.length).toBeGreaterThan(0);
      expect(place.verification.source).toBeTruthy();
      expect(Number.isNaN(new Date(place.verification.checkedOn).getTime())).toBe(false);
      // Something a person can actually do: a place to go, a number to
      // call, or a through-partners program whose steps are the action
      // (a seasonal drive like Coats for Kids has no desk or phone line of
      // its own — inventing one would be worse than none).
      expect(
        Boolean(place.address || place.phone || place.kind === 'locator' || place.kind === 'seasonal' || place.kind === 'referral'),
        place.id
      ).toBe(true);
    }
  });

  it('ids are unique and the locators are the never-stale backstops', () => {
    const ids = WINTER_CLOTHING.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CLOTHING_PLACES.length + CLOTHING_LOCATORS.length).toBe(WINTER_CLOTHING.length);
    expect(CLOTHING_LOCATORS.map((p) => p.id)).toContain('mass-211');
  });

  it('partner-only programs are not labelled walk-in', () => {
    const cradles = WINTER_CLOTHING.find((p) => p.id === 'cradles-to-crayons');
    expect(cradles?.kind).toBe('referral');
    const antons = WINTER_CLOTHING.find((p) => p.id === 'antons-coats-for-kids');
    expect(antons?.kind).toBe('seasonal');
  });

  it('season math follows the published drive dates', () => {
    const antons = WINTER_CLOTHING.find((p) => p.id === 'antons-coats-for-kids')!;
    expect(inSeason(antons, new Date('2026-10-18'))).toBe(true);
    expect(inSeason(antons, new Date('2026-09-01'))).toBe(false);
    expect(inSeason(antons, new Date('2027-02-01'))).toBe(false);
    const abcd = WINTER_CLOTHING.find((p) => p.id === 'abcd-dorchester-nsc')!;
    expect(inSeason(abcd, new Date('2026-10-18'))).toBeNull(); // year-round
  });

  it('check age and staleness levels compute from the stamp', () => {
    const place = WINTER_CLOTHING[0];
    expect(clothingCheckedAge(place, new Date('2026-10-28'))).toBe(10);
    expect(clothingCheckLevel(place, new Date('2026-10-28'))).toBe('fresh');
    expect(clothingCheckLevel(place, new Date('2027-06-01'))).toBe('stale');
    expect(clothingCheckLevel(place, new Date('2027-12-01'))).toBe('critical');
  });

  it('structured hours exist exactly where the org publishes them', () => {
    // St. Francis House publishes day-shelter hours; the Kroc Center does
    // not publish clothing hours, so its record must say "call", not borrow.
    expect(WINTER_CLOTHING.find((p) => p.id === 'st-francis-house')?.hours).toBeDefined();
    const kroc = WINTER_CLOTHING.find((p) => p.id === 'kroc-center')!;
    expect(kroc.hours).toBeUndefined();
    expect(kroc.hoursNote?.toLowerCase()).toContain('call');
  });
});
