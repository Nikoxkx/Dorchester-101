/**
 * The locale formatters.
 *
 * `formatPercent` is here because of a bug the rendered-page test caught: the
 * function divided by 100 and so did six of its seven callers, so the market
 * page printed a 63.5% renter share as "0.6%" and a 31% median rent burden as
 * "0.3%". The contract is now the one `Intl.NumberFormat` already has — the
 * argument is a fraction — and these tests hold it there.
 */
import { describe, expect, it } from 'vitest';
import { formatCurrency, formatNumber, formatPercent } from '@/i18n/formatters';
import { localeCoverage } from '@/i18n';

describe('formatPercent', () => {
  it('takes a fraction, the way Intl does', () => {
    expect(formatPercent(0.635, 'en', 1)).toBe('63.5%');
    expect(formatPercent(0.31, 'en', 1)).toBe('31.0%');
    expect(formatPercent(0.52, 'en', 1)).toBe('52.0%');
    expect(formatPercent(1, 'en', 0)).toBe('100%');
    expect(formatPercent(0, 'en', 0)).toBe('0%');
  });

  it('never reads a percentage point as a fraction of a fraction', () => {
    // The old behaviour: formatPercent(0.635) formatted 0.00635 and the market
    // page showed "0.6%" for a renter share of 63.5%.
    expect(formatPercent(0.635, 'en', 1)).not.toBe('0.6%');
    expect(formatPercent(0.0635, 'en', 1)).toBe('6.4%');
  });

  it('renders through the active locale, not a hard-coded en-US', () => {
    const english = formatPercent(0.635, 'en', 1);
    expect(english).toBe('63.5%');
    // A Portuguese reader gets a comma decimal separator (pt-BR).
    expect(formatPercent(0.635, 'pt', 1)).toBe('63,5%');
    // Arabic carries bidi marks, so the locale was really applied.
    expect(formatPercent(0.635, 'ar', 1)).toContain('\u200e');
    expect(formatPercent(0.635, 'ar', 1)).not.toBe(english);
  });
});

describe('the other formatters', () => {
  it('formats money without cents by default and with them on request', () => {
    expect(formatCurrency(2129, 'en')).toBe('$2,129');
    expect(formatCurrency(15, 'en', { cents: true })).toBe('$15.00');
  });

  it('groups thousands in the active locale', () => {
    expect(formatNumber(327167, 'en')).toBe('327,167');
  });
});

describe('locale coverage', () => {
  it('reports percentage points, which the About page converts before formatting', () => {
    const coverage = localeCoverage('en');
    expect(coverage.percent).toBe(100);
    expect(coverage.translated).toBe(coverage.total);
    // The About page passes `coverage.percent / 100` to the formatter.
    expect(formatPercent(coverage.percent / 100, 'en', 0)).toBe('100%');
  });
});
