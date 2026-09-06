import { NextResponse } from 'next/server';
import {
  PROGRAM_META,
  HUD_AMI_FY2026,
  HUD_FMR_FY2026,
  DORCHESTER_RENT_ESTIMATES,
} from '@/data/programs';
import { HOUSING_LISTINGS, DEVELOPMENT_PROJECTS } from '@/data/housing';
import { FOOD_SITES } from '@/data/food';
import { COMMUNITY_RESOURCES } from '@/data/resources';

/**
 * Neighborhood snapshot endpoint — combines multiple verified data sources
 * into a single cross-referenced analysis with computed statistics.
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const householdSize = parseInt(searchParams.get('householdSize') || '2', 10);
  const income = parseInt(searchParams.get('income') || '50000', 10);

  // AMI percentage + band (HUD FY2026, Boston metro)
  const amiTable = HUD_AMI_FY2026.byHouseholdSize[householdSize] || HUD_AMI_FY2026.byHouseholdSize[2];
  const ami100 = amiTable ? amiTable.ami100 : 120000;
  const amiPct = Math.round((income / ami100) * 100);
  const band =
    amiPct <= 30 ? '30%' : amiPct <= 50 ? '50%' : amiPct <= 60 ? '60%' : amiPct <= 80 ? '80%' : 'Market';

  // Rent burden using FY2026 2BR Fair Market Rent
  const fmr = HUD_FMR_FY2026;
  const rentBurdenPercent = Math.round(((fmr.twoBed / income) * 100) * 10) / 10;

  // Directory matches — resources a household in this band can actually use
  const matchingListings = HOUSING_LISTINGS.filter(
    (l) => l.amiRequired >= Math.min(30, amiPct) && l.amiRequired <= Math.max(amiPct, 30),
  ).length;
  const openWaitlists = HOUSING_LISTINGS.filter(
    (l) => l.waitlistStatus === 'waitlist_open' || l.waitlistStatus === 'available' || l.waitlistStatus === 'lottery',
  ).length;
  const foodSitesOpen = FOOD_SITES.length;
  const freeLegalAid = COMMUNITY_RESOURCES.filter(
    (r) => r.category === 'legal' || (r.services || '').toLowerCase().includes('legal'),
  ).length;

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
      rentBurdenPercent,
      rentBurdenLabel:
        rentBurdenPercent <= 30 ? 'within the HUD 30% guideline' :
        rentBurdenPercent <= 50 ? 'above the HUD 30% guideline' : 'severely cost-burdened',
      rentEstimateSource: DORCHESTER_RENT_ESTIMATES.source,
      rentEstimateAsOf: DORCHESTER_RENT_ESTIMATES.asOf,
    },
    directory: {
      listingsNearBand: matchingListings,
      openWaitlists,
      projectsTracked: DEVELOPMENT_PROJECTS.length,
      foodSitesInDirectory: foodSitesOpen,
      legalAidOrgs: freeLegalAid,
    },
    computedSummary: `A household of ${householdSize} earning $${income.toLocaleString()} a year sits at ${amiPct}% of the Boston-metro AMI (${band} band). A 2BR at the FY2026 Fair Market Rent of $${fmr.twoBed.toLocaleString()} would take ${rentBurdenPercent}% of gross income${rentBurdenPercent > 30 ? ` — above the HUD 30% guideline` : ''}. ${matchingListings} income-restricted listings in the directory sit near this band, with ${openWaitlists} currently taking applications.`,
  };

  return NextResponse.json({ success: true, data: stats, timestamp: new Date().toISOString() });
}
