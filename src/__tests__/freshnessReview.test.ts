import { afterEach, describe, expect, it, vi } from 'vitest';
import { RESOURCES, verificationLevel } from '@/data/resources';
import { WINTER_CLOTHING, clothingCheckLevel } from '@/data/winterClothing';
import { REVIEW_FOCUS } from '@/data/reviewFocus';
import { freshnessReport } from '../../scripts/audit-freshness';

describe('freshness review signals', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('continues aging a needs-review resource or clothing record into critical status', () => {
    const reviewDate = '2025-01-01';
    const now = new Date('2027-01-02T12:00:00Z');
    expect(verificationLevel({ ...RESOURCES[0], verification: { ...RESOURCES[0].verification, checkedOn: reviewDate, status: 'needs-review' } }, now)).toBe('critical');
    expect(clothingCheckLevel({ ...WINTER_CLOTHING[0], verification: { ...WINTER_CLOTHING[0].verification, checkedOn: reviewDate, status: 'needs-review' } }, now)).toBe('critical');
  });

  it('does not treat a future review date as completed', () => {
    const now = new Date('2026-01-01T12:00:00Z');
    expect(verificationLevel({ ...RESOURCES[0], verification: { ...RESOURCES[0].verification, checkedOn: '2026-02-01', status: 'verified' } }, now)).toBe('stale');
    expect(clothingCheckLevel({ ...WINTER_CLOTHING[0], verification: { ...WINTER_CLOTHING[0].verification, checkedOn: '2026-02-01', status: 'verified' } }, now)).toBe('stale');
  });

  it('provides an actionable follow-up for every explicitly unreviewed record', () => {
    const flagged = [...RESOURCES, ...WINTER_CLOTHING].filter((record) => record.verification.status === 'needs-review');
    for (const record of flagged) expect(REVIEW_FOCUS[record.id], record.id).toBeTruthy();
  });

  it('reports missing or blocked source pages without claiming facts are verified', async () => {
    const fetcher = vi.fn(async (url: string) => new Response(null, { status: url === RESOURCES[0].website ? 404 : 200 }));
    vi.stubGlobal('fetch', fetcher);
    const report = await freshnessReport(new Date('2026-10-31T12:00:00Z'));
    expect(fetcher).toHaveBeenCalled();
    expect(report).toContain(`${RESOURCES[0].website} — HTTP 404`);
    expect(report).toContain('HTTP reachability cannot establish current hours');
    expect(report).toContain('not a verification or a content update');
  });

  it('creates an honest offline queue without calling providers', async () => {
    const report = await freshnessReport(new Date('2027-01-01T12:00:00Z'), { offline: true });
    expect(report).toContain('not a verification or a content update');
    expect(report).toContain('Community resources needing review');
    expect(report).toContain('Project dates and records to review');
    expect(report).toContain('Clothing records needing review');
    expect(report).toContain('Online checks were skipped');
    expect(report).toContain('<!-- dor101-freshness-review -->');
    expect(report).toContain(REVIEW_FOCUS['codman-square-community-market']);
    expect(report).toContain('Do not advance dates merely because this job ran');
    expect(report).toContain('marked for review; checked');
    expect(report).toContain('Dot Block');
    const older = await freshnessReport(new Date('2028-01-01T12:00:00Z'), { offline: true });
    expect(older).toContain('marked for review; critical age or invalid date');
  });
});
