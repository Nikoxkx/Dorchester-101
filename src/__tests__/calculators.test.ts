import { describe, it, expect } from 'vitest';
import {
  calculateAMIPercentage,
  getAMIBand,
  calculateRentBurden,
  formatPhone,
  telHref,
  localeForLanguage,
} from '@/lib/utils';
import { isOpenNow } from '@/lib/hours';
import { HUD_AMI_FY2026 } from '@/data/programs';

describe('AMI calculator (HUD FY2026, Boston-Cambridge-Quincy)', () => {
  it('computes exact percentages against the HUD table', () => {
    // Household of 4: 100% AMI = $171,400
    expect(calculateAMIPercentage(4, 171400)).toBe(100);
    expect(calculateAMIPercentage(4, 85700)).toBe(50);
    expect(calculateAMIPercentage(4, 51400)).toBe(30);
  });

  it('clamps household size to the published 1–8 range', () => {
    expect(calculateAMIPercentage(0, 36000)).toBe(calculateAMIPercentage(1, 36000));
    expect(calculateAMIPercentage(12, 120000)).toBe(calculateAMIPercentage(8, 120000));
  });

  it('handles zero and negative income without crashing', () => {
    expect(calculateAMIPercentage(2, 0)).toBe(0);
    expect(calculateAMIPercentage(2, -5)).toBe(0);
  });

  it('bands follow the affordable-housing cutoffs', () => {
    expect(getAMIBand(15)).toBe('30% AMI');
    expect(getAMIBand(30)).toBe('30% AMI');
    expect(getAMIBand(45)).toBe('50% AMI');
    expect(getAMIBand(55)).toBe('60% AMI');
    expect(getAMIBand(75)).toBe('80% AMI');
    expect(getAMIBand(95)).toBe('100% AMI');
    expect(getAMIBand(140)).toBe('Over 100% AMI');
  });

  it('HUD table itself is internally consistent (80% < 100%)', () => {
    for (const [, bands] of Object.entries(HUD_AMI_FY2026.byHouseholdSize)) {
      expect(bands.ami80).toBeLessThan(bands.ami100);
      expect(bands.ami50).toBeLessThan(bands.ami80);
      expect(bands.ami30).toBeLessThan(bands.ami50);
    }
  });
});

describe('rent burden calculator', () => {
  it('uses the 30% / 50% federal thresholds', () => {
    expect(calculateRentBurden(3000, 900).status).toBe('affordable'); // exactly 30%
    expect(calculateRentBurden(3000, 1200).status).toBe('cost-burdened'); // 40%
    expect(calculateRentBurden(3000, 1500).status).toBe('cost-burdened'); // exactly 50%
    expect(calculateRentBurden(3000, 1600).status).toBe('severely-burdened'); // 53%
  });

  it('zero income is severely burdened, never a divide-by-zero', () => {
    const r = calculateRentBurden(0, 1200);
    expect(r.status).toBe('severely-burdened');
    expect(Number.isFinite(r.percentage)).toBe(true);
  });
});

describe('phone formatting (hotlines must dial correctly)', () => {
  it('formats 10-digit numbers', () => {
    expect(formatPhone('6179884000')).toBe('(617) 988-4000');
  });

  it('keeps short codes like 211 dialable', () => {
    expect(telHref('211')).toBe('tel:211');
    expect(telHref('(617) 988-4000')).toBe('tel:6179884000');
  });
});

describe('locale mapping', () => {
  it('maps every UI language to a real Intl locale (kea → pt-CV)', () => {
    for (const lang of ['en', 'es', 'ht', 'pt', 'vi', 'kea', 'so', 'zh', 'ar']) {
      const locale = localeForLanguage(lang);
      expect(() => new Intl.NumberFormat(locale).format(1234)).not.toThrow();
    }
  });
});

describe('food site hours parser', () => {
  const at = (day: number, h: number, m: number) => new Date(2026, 8, 6 + day, h, m); // Sep 6 2026 is a Sunday

  it('knows when a pantry is open', () => {
    const hours = { monday: '10:00 AM - 2:00 PM' };
    expect(isOpenNow(hours, at(1, 11, 0))).toBe(true); // Monday 11am
    expect(isOpenNow(hours, at(1, 9, 0))).toBe(false); // Monday 9am
    expect(isOpenNow(hours, at(1, 15, 0))).toBe(false); // Monday 3pm
  });

  it('treats 24/7 and closed correctly', () => {
    expect(isOpenNow('24/7', at(3, 3, 0))).toBe(true);
    expect(isOpenNow({ sunday: 'Closed' }, at(0, 12, 0))).toBe(false);
  });

  it('unknown formats fail closed (do not show "open" guesses)', () => {
    expect(isOpenNow({ tuesday: 'Call for hours' }, at(2, 12, 0))).toBe(false);
  });
});
