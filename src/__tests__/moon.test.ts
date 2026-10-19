import { describe, expect, it } from 'vitest';
import { moonPhase, nextFullMoon, nextNewMoon, SYNODIC_MONTH_DAYS } from '@/lib/moon';

/**
 * Anchored on eclipses — the one set of moon facts nobody argues with:
 * a solar eclipse can only happen at new moon, a lunar eclipse only at
 * full. If the math puts those dates at the right ends of the cycle,
 * tonight's drawn moon can be trusted.
 */
describe('moonPhase', () => {
  it('puts the 2024-04-08 total solar eclipse at new moon', () => {
    const p = moonPhase(new Date(Date.UTC(2024, 3, 8, 18, 17)));
    expect(p.illumination).toBeLessThan(0.04);
    expect(p.phaseIndex).toBe(0);
  });

  it('puts the 2025-03-14 total lunar eclipse at full moon', () => {
    const p = moonPhase(new Date(Date.UTC(2025, 2, 14, 6, 58)));
    expect(p.illumination).toBeGreaterThan(0.96);
    expect(p.phaseIndex).toBe(4);
    expect(p.waxing).toBe(true); // still a hair before exact full at mid-eclipse approach is fine either side
  });

  it('puts the 2000-01-21 total lunar eclipse at full moon', () => {
    const p = moonPhase(new Date(Date.UTC(2000, 0, 21, 4, 44)));
    expect(p.illumination).toBeGreaterThan(0.96);
    expect(p.phaseIndex).toBe(4);
  });

  it('quarters are half lit, waxing before full and waning after', () => {
    const epoch = Date.UTC(2000, 0, 6, 18, 14);
    const firstQ = moonPhase(new Date(epoch + SYNODIC_MONTH_DAYS * 0.25 * 86_400_000));
    expect(firstQ.illumination).toBeCloseTo(0.5, 2);
    expect(firstQ.phaseIndex).toBe(2);
    expect(firstQ.waxing).toBe(true);
    const lastQ = moonPhase(new Date(epoch + SYNODIC_MONTH_DAYS * 0.75 * 86_400_000));
    expect(lastQ.illumination).toBeCloseTo(0.5, 2);
    expect(lastQ.phaseIndex).toBe(6);
    expect(lastQ.waxing).toBe(false);
  });

  it('age runs 0…29.53 and wraps at the next new moon', () => {
    const epoch = Date.UTC(2000, 0, 6, 18, 14);
    const almost = moonPhase(new Date(epoch + (SYNODIC_MONTH_DAYS - 0.1) * 86_400_000));
    expect(almost.ageDays).toBeGreaterThan(29);
    const wrapped = moonPhase(new Date(epoch + (SYNODIC_MONTH_DAYS + 0.1) * 86_400_000));
    expect(wrapped.ageDays).toBeLessThan(0.2);
    expect(wrapped.phaseIndex).toBe(0);
  });

  it('next full/new moons are always ahead and within one cycle', () => {
    const dates = [
      new Date(Date.UTC(2026, 9, 18, 12, 0)),
      new Date(Date.UTC(2031, 5, 30, 3, 0)),
      new Date(Date.UTC(1999, 11, 31, 23, 0)),
    ];
    for (const d of dates) {
      for (const next of [nextFullMoon(d), nextNewMoon(d)]) {
        const deltaDays = (next.getTime() - d.getTime()) / 86_400_000;
        expect(deltaDays).toBeGreaterThan(0);
        expect(deltaDays).toBeLessThanOrEqual(SYNODIC_MONTH_DAYS);
      }
      // And the phase at the predicted instant really is full/new.
      expect(moonPhase(nextFullMoon(d)).illumination).toBeGreaterThan(0.999);
      expect(moonPhase(nextNewMoon(d)).illumination).toBeLessThan(0.001);
    }
  });
});
