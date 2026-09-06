import { describe, expect, it } from 'vitest';
import {
  BHA_STATUS,
  HUD_AMI_FY2026,
  HUD_FMR_FY2026,
  MBTA_FARES,
  RAFT_PROGRAM,
  SNAP_FY2026,
} from '@/data/programs';
import { getMapLocations } from '@/data/map';

describe('published program figures', () => {
  it('keeps HUD FY2026 4-person 50/60/80 AMI', () => {
    const four = HUD_AMI_FY2026.byHouseholdSize[4];
    expect(four.ami50).toBe(85700);
    expect(four.ami60).toBe(102840);
    expect(four.ami80).toBe(137100);
  });

  it('keeps FY2026 Boston FMRs', () => {
    expect(HUD_FMR_FY2026.studio).toBe(2359);
    expect(HUD_FMR_FY2026.oneBed).toBe(2476);
    expect(HUD_FMR_FY2026.twoBed).toBe(2941);
    expect(HUD_FMR_FY2026.threeBed).toBe(3526);
    expect(HUD_FMR_FY2026.fourBed).toBe(3894);
  });

  it('keeps SNAP FY2026 4-person max', () => {
    expect(SNAP_FY2026.maxMonthly[4]).toBe(994);
  });

  it('keeps RAFT at $7,000 / 12 months', () => {
    expect(RAFT_PROGRAM.maxBenefit).toBe(7000);
  });

  it('records BHA tenant-based Section 8 as closed', () => {
    expect(BHA_STATUS.section8TenantBased).toBe('closed');
    expect(BHA_STATUS.publicHousing).toBe('open');
  });

  it('keeps MBTA subway/bus/monthly fares', () => {
    expect(MBTA_FARES.subway).toBe(2.4);
    expect(MBTA_FARES.localBus).toBe(1.7);
    expect(MBTA_FARES.monthlyLink).toBe(90);
  });
});

describe('map locations', () => {
  it('includes Red Line stops and community pins', () => {
    const locs = getMapLocations();
    expect(locs.some((l) => l.name === 'Fields Corner' && l.type === 'transit')).toBe(true);
    expect(locs.some((l) => l.type === 'food')).toBe(true);
    expect(locs.some((l) => l.type === 'health')).toBe(true);
  });
});
