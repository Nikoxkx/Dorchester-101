import { NextResponse } from 'next/server';
import { PROGRAM_META, HUD_AMI_FY2026, HUD_FMR_FY2026, DORCHESTER_RENT_ESTIMATES } from '@/data/programs';
import { COLLEGE_RESOURCES } from '@/data/college';

/**
 * Complex aggregated report endpoint — combines multiple verified data sources
 * into a single cross-referenced neighborhood analysis with computed statistics.
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const householdSize = parseInt(searchParams.get('householdSize') || '2', 10);
  const income = parseInt(searchParams.get('income') || '50000', 10);

  // Complex computation: AMI percentage + band + rent burden + college pathway match
  const amiTable = HUD_AMI_FY2026.byHouseholdSize[householdSize] || HUD_AMI_FY2026.byHouseholdSize[2];
  const ami100 = amiTable ? amiTable.ami100 : 120000;
  const amiPct = Math.round((income / ami100) * 100);
  const band = amiPct <= 30 ? '30%' : amiPct <= 50 ? '50%' : amiPct <= 60 ? '60%' : amiPct <= 80 ? '80%' : 'Market';

  // Rent burden calculation using FY2026 FMR
  const fmr = HUD_FMR_FY2026;
  const rentBurden = ((fmr.twoBed / 12) / (income / 12)) * 100;

  // Cross-reference: college resources for household size (resource intensity)
  const collegeMatches = COLLEGE_RESOURCES.dorchesterSpecific.filter((r) =>
    r.type === 'community' || r.type === 'institution' || r.type === 'bridge'
  );

  // Aggregate statistics from multiple sources
  const stats = {
    meta: PROGRAM_META,
    ami: {
      householdSize,
      income,
      amiPct,
      band,
      ami100,
      source: HUD_AMI_FY2026.source,
      effectiveDate: HUD_AMI_FY2026.effectiveDate,
    },
    rent: {
      fmrTwoBed: fmr.twoBed,
      annualRent: fmr.twoBed * 12,
      rentBurdenPercent: Math.round(rentBurden * 10) / 10,
      rentEstimateSource: DORCHESTER_RENT_ESTIMATES.source,
      rentEstimateAsOf: DORCHESTER_RENT_ESTIMATES.asOf,
    },
    collegePathway: {
      resourcesMatched: collegeMatches.length,
      resources: collegeMatches.map((c) => ({
        name: c.name,
        type: c.type,
        url: c.url,
        phone: c.phone,
        princetonValue: c.princetonValue,
      })),
      updated: COLLEGE_RESOURCES.lastUpdated,
      sourceNote: COLLEGE_RESOURCES.sourceNote,
    },
    computedSummary: `Household of ${householdSize} at $${income.toLocaleString()}/yr is at ${amiPct}% AMI (${band}). Rent burden at 2BR FMR is ${Math.round(rentBurden * 10) / 10}%. ${collegeMatches.length} verified college-access resources available.`,
  };

  return NextResponse.json({ success: true, data: stats, timestamp: new Date().toISOString() });
}
