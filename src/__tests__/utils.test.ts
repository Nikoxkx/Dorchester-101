import { describe, expect, it } from 'vitest';
import {
  calculateAMIPercentage,
  calculateRentBurden,
  formatCurrency,
  formatPhone,
  getAMIBand,
  telHref,
} from '@/lib/utils';

describe('utils', () => {
  it('formats USD without cents', () => {
    expect(formatCurrency(2941)).toBe('$2,941');
  });

  it('formats 10-digit phones', () => {
    expect(formatPhone('6179884000')).toBe('(617) 988-4000');
  });

  it('builds tel hrefs including 211', () => {
    expect(telHref('2-1-1')).toBe('tel:211');
    expect(telHref('(617) 603-1700')).toBe('tel:6176031700');
  });

  it('flags rent burden at HUD lines', () => {
    expect(calculateRentBurden(4000, 1000).status).toBe('affordable');
    expect(calculateRentBurden(4000, 1600).status).toBe('cost-burdened');
    expect(calculateRentBurden(4000, 2200).status).toBe('severely-burdened');
  });

  it('computes AMI percentage against FY2026 1-person 100% AMI', () => {
    const pct = calculateAMIPercentage(1, 60000);
    expect(pct).toBe(50);
    expect(getAMIBand(pct)).toBe('50% AMI');
  });
});
