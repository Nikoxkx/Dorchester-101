import { NextResponse } from 'next/server';
import {
  deriveMetrics,
  fetchBostonAcs,
  fetchBostonAcsSeries,
  ACS_VARIABLES,
  ACS_VINTAGES,
  hasCensusApiKey,
  type AcsSeriesPoint,
} from '@/lib/census';
import { fetchHudFmrs, fetchHudIncomeLimits, fetchMaMinimumWage } from '@/lib/hud';

export const dynamic = 'force-dynamic';
/**
 * A cold read asks the Census Bureau for every vintage of four tables. Vercel's
 * default function budget is 10 s, which is not enough for that on a slow day,
 * so the budget is raised here rather than the request being cut off halfway.
 */
export const maxDuration = 30;

/** `AcsResponse.source` is finer-grained than the page needs; this is the mapping. */
type AcsStatus = 'live' | 'cache' | 'snapshot' | 'unavailable';
const statusOf = (source: string, snapshot?: boolean): AcsStatus =>
  snapshot ? 'snapshot' : source === 'census-cache' ? 'cache' : source === 'unavailable' ? 'unavailable' : 'live';

/**
 * Housing-cost data for the market page.
 *
 * Two problems with the previous implementation: it multiplied a base number by
 * `Math.random()` on every request and called the result "Zillow Research",
 * and it printed a 24-month history table that no one was actually reading from
 * anywhere. Both are gone.
 *
 * What remains:
 *  - Boston ACS estimates from the Census Bureau, fetched live with a cache.
 *  - HUD Fair Market Rents read from a file an operator publishes once a year
 *    (`public/data/hud-fmr.json`). When the file is missing the response says
 *    so and points at the official table instead of showing stale numbers.
 *  - The published AMI income-limit ladder, labelled with its effective year.
 */

export interface MarketResponse {
  generatedAt: string;
  geography: string;
  acs: {
    status: AcsStatus;
    vintage: string;
    retrievedAt: string;
    metrics: ReturnType<typeof deriveMetrics>;
    raw: Record<string, { value: number | null; marginOfError: number | null; label: string }>;
    error?: string;
    /** Which Census endpoint produced these figures, named for the citation. */
    access?: string;
    /** True when nothing live answered and the committed capture is shown. */
    snapshot?: boolean;
    /** True when this instance had a `CENSUS_API_KEY` to use. */
    keyConfigured: boolean;
    citation: { label: string; url: string };
  };
  /** Headline figures for every published 5-year vintage, for the trend chart. */
  series: { status: AcsStatus; points: AcsSeriesPoint[]; retrievedAt: string; note: string; access?: string };
  hudFmr:
    | { status: 'available'; fiscalYear: string; effectiveDate: string; publishedAt?: string; units: Record<string, number>; source: string; sourceUrl: string; snapshot?: boolean }
    | { status: 'not-installed'; hint: string; sourceUrl: string };
  ami: {
    table: Record<string, number>;
    basis: string;
    effectiveYear: number;
    note: string;
    sourceUrl: string;
    /** True when huduser.gov was unreachable and the verified capture is shown. */
    snapshot?: boolean;
  };
  derived: {
    /** Rent a full-time minimum-wage household can afford at 30% of income. */
    affordableRentAtWage: { wageCents: number; monthly: number } | null;
    gapPercent: number | null;
    method: string;
  };
  listings: { status: 'none'; reason: string; officialPortals: Array<{ label: string; url: string }> };
}

async function liveFmr(): Promise<MarketResponse['hudFmr']> {
  const fallback = {
    status: 'not-installed' as const,
    hint: 'HUD did not answer the county workbook request. No figure is shown rather than a stale one.',
    sourceUrl: 'https://www.huduser.gov/portal/datasets/fmr.html',
  };
  try {
    const fmr = await fetchHudFmrs();
    if (Object.keys(fmr.units).length === 0) return fallback;
    return {
      status: 'available',
      fiscalYear: fmr.fiscalYear,
      effectiveDate: fmr.effectiveDate,
      publishedAt: fmr.retrievedAt,
      units: fmr.units,
      source: `HUD User (${fmr.area})`,
      sourceUrl: fmr.sourceUrl,
      snapshot: fmr.snapshot,
    };
  } catch {
    return fallback;
  }
}

export async function GET() {
  const [acs, series, hudFmr, incomeLimits, wage] = await Promise.all([
    fetchBostonAcs(),
    fetchBostonAcsSeries(),
    liveFmr(),
    fetchHudIncomeLimits().catch(() => null),
    fetchMaMinimumWage(),
  ]);
  const metrics = deriveMetrics(acs.estimates);

  const raw: MarketResponse['acs']['raw'] = {};
  for (const [key, variable] of Object.entries(ACS_VARIABLES)) {
    const entry = acs.estimates[variable];
    if (!entry) continue;
    raw[key] = { value: entry.value, marginOfError: entry.marginOfError, label: entry.label };
  }

  // Full-time at the published state minimum wage, 30% affordability rule.
  // The wage itself comes from mass.gov; when that page is unreachable the
  // card reports the gap honestly instead of using a remembered number.
  const monthlyAtWage =
    wage.rateCents != null
      ? Math.floor(((wage.rateCents / 100) * 40 * 52) / 12 / 100) * 100
      : null;
  const affordable = monthlyAtWage != null ? Math.round(monthlyAtWage * 0.3) : null;
  const gap =
    metrics.medianGrossRent != null && affordable != null
      ? Math.round(((metrics.medianGrossRent - affordable) / metrics.medianGrossRent) * 1000) / 10
      : null;

  // Citation year = the vintage that actually answered ("ACS 5-year 2020–2024"
  // → 2024); the newest published release when nothing did.
  const citationYear = /\d{4}$/.exec(acs.vintage)?.[0] ?? ACS_VINTAGES[0];

  const payload: MarketResponse = {
    generatedAt: new Date().toISOString(),
    geography: acs.geography,
    acs: {
      status: statusOf(acs.source, acs.snapshot),
      vintage: acs.vintage,
      retrievedAt: acs.retrievedAt,
      metrics,
      raw,
      error: acs.error,
      access: acs.access,
      snapshot: acs.snapshot ?? false,
      keyConfigured: hasCensusApiKey(),
      citation: {
        label: 'U.S. Census Bureau, American Community Survey',
        url: `https://data.census.gov/table?g=0500000US25025&y=${citationYear}&tid=ACSDT5Y${citationYear}.B25064`,
      },
    },
    series: {
      status: statusOf(series.source),
      points: series.points,
      retrievedAt: series.retrievedAt,
      access: series.access,
      note: 'Each point is a 5-year ACS estimate for Suffolk County. Consecutive vintages overlap by four years, so read the line as a trend, not as year-on-year change.',
    },
    hudFmr,
    ami: {
      table: incomeLimits
        ? Object.fromEntries(Object.entries(incomeLimits.limits50).map(([size, value]) => [`${size}-person household`, Math.round(value * 2)]))
        : {},
      basis: `HUD FY${incomeLimits?.fiscalYear ?? 'current'} 50% income limits doubled = area median family income by household size (${incomeLimits?.area ?? 'Boston-Cambridge-Newton, MA-NH Metro'})`,
      effectiveYear: incomeLimits?.fiscalYear ?? new Date().getFullYear(),
      note: incomeLimits?.snapshot
        ? 'Income limits, not rents. HUD could not be reached, so this is the verified FY capture; the live workbook returns on the next successful fetch.'
        : 'Income limits, not rents. HUD publishes these from ACS each spring; the ladder is HUD-derived median family income by household size, live from the publisher workbook.',
      sourceUrl: incomeLimits?.sourceUrl ?? 'https://www.huduser.gov/portal/datasets/il.html',
      snapshot: incomeLimits?.snapshot ?? false,
    },
    derived: {
      affordableRentAtWage: affordable != null && wage.rateCents != null ? { wageCents: wage.rateCents, monthly: affordable } : null,
      gapPercent: gap,
      method:
        'Affordable rent = 30% of monthly earnings at the Massachusetts minimum wage as published by the Commonwealth (40 hours/week). Gap is the share of the median gross rent that a minimum-wage household cannot cover.',
    },
    listings: {
      status: 'none',
      reason:
        'DOR101 does not aggregate rental listings. Applications run through the city and state portals below, where availability and landlord contact details are authoritative.',
      officialPortals: [
        { label: 'Boston One Stop (city-owned affordable units)', url: 'https://www.boston.gov/departments/housing/boston-one-stop' },
        { label: 'MassAccess (state affordable housing portal)', url: 'https://www.massaccess.org' },
        { label: 'Go Housing Link (BPDA income-restricted listings)', url: 'https://www.gohousinglink.com' },
      ],
    },
  };

  return NextResponse.json(payload, {
    headers: {
      // ACS republishes annually; the number does not need a fresh request every minute.
      'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
