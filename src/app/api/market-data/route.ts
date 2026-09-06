import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deriveMetrics, fetchBostonAcs, ACS_VARIABLES } from '@/lib/census';
import { BOSTON_AMI_2025 } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
    status: 'live' | 'cache' | 'unavailable';
    vintage: string;
    retrievedAt: string;
    metrics: ReturnType<typeof deriveMetrics>;
    raw: Record<string, { value: number | null; marginOfError: number | null; label: string }>;
    error?: string;
    citation: { label: string; url: string };
  };
  hudFmr:
    | { status: 'available'; fiscalYear: string; effectiveDate: string; publishedAt?: string; units: Record<string, number>; source: string; sourceUrl: string }
    | { status: 'not-installed'; hint: string; sourceUrl: string };
  ami: {
    table: Record<string, number>;
    basis: 'Boston-Cambridge-Newton, MA-NH Metro HUD income limits';
    effectiveYear: number;
    note: string;
    sourceUrl: string;
  };
  derived: {
    /** Rent a full-time minimum-wage household can afford at 30% of income. */
    affordableRentAtWage: { wageCents: number; monthly: number } | null;
    gapPercent: number | null;
    method: string;
  };
  listings: { status: 'none'; reason: string; officialPortals: Array<{ label: string; url: string }> };
}

const FMR_PATH = join(process.cwd(), 'public', 'data', 'hud-fmr.json');
const MASS_WAGE_CENTS = 1500; // MA minimum wage, cents/hour, from 2023-01-01.

interface FmrFile {
  fiscalYear?: string;
  effectiveDate?: string;
  publishedAt?: string;
  area?: string;
  units?: Record<string, number>;
  source?: string;
  sourceUrl?: string;
}

async function readFmr(): Promise<MarketResponse['hudFmr']> {
  const fallback = {
    status: 'not-installed' as const,
    hint: 'Drop the HUD FY table at public/data/hud-fmr.json to light this section up. Until then no figure is shown.',
    sourceUrl: 'https://www.huduser.gov/portal/datasets/fmr.html',
  };
  try {
    const raw = await readFile(FMR_PATH, 'utf8');
    const parsed = JSON.parse(raw) as FmrFile;
    if (!parsed.units || Object.keys(parsed.units).length === 0) return fallback;
    return {
      status: 'available',
      fiscalYear: parsed.fiscalYear ?? 'unknown',
      effectiveDate: parsed.effectiveDate ?? 'unknown',
      publishedAt: parsed.publishedAt,
      units: parsed.units,
      source: parsed.source ?? 'HUD User',
      sourceUrl: parsed.sourceUrl ?? fallback.sourceUrl,
    };
  } catch {
    return fallback;
  }
}

export async function GET() {
  const [acs, hudFmr] = await Promise.all([fetchBostonAcs(), readFmr()]);
  const metrics = deriveMetrics(acs.estimates);

  const raw: MarketResponse['acs']['raw'] = {};
  for (const [key, variable] of Object.entries(ACS_VARIABLES)) {
    const entry = acs.estimates[variable];
    if (!entry) continue;
    raw[key] = { value: entry.value, marginOfError: entry.marginOfError, label: entry.label };
  }

  // 2007 Massachusetts minimum wage * 40h * 52 / 12 is the state's own
  // affordability yardstick; kept explicit so the arithmetic is checkable.
  const monthlyAtWage = Math.floor(((MASS_WAGE_CENTS / 100) * 40 * 52) / 12 / 100) * 100;
  const affordable = Math.round(monthlyAtWage * 0.3);
  const gap = metrics.medianGrossRent ? Math.round(((metrics.medianGrossRent - affordable) / metrics.medianGrossRent) * 1000) / 10 : null;

  const payload: MarketResponse = {
    generatedAt: new Date().toISOString(),
    geography: acs.geography,
    acs: {
      status: acs.source === 'census-live' ? 'live' : acs.source === 'census-cache' ? 'cache' : 'unavailable',
      vintage: acs.vintage,
      retrievedAt: acs.retrievedAt,
      metrics,
      raw,
      error: acs.error,
      citation: {
        label: 'U.S. Census Bureau, American Community Survey',
        url: 'https://data.census.gov/table?g=0500000US25025&y=2023&tid=ACSDT5Y2023.B25058',
      },
    },
    hudFmr,
    ami: {
      table: Object.fromEntries(Object.entries(BOSTON_AMI_2025).map(([k, v]) => [`${k}-person household`, v])),
      basis: 'Boston-Cambridge-Newton, MA-NH Metro HUD income limits',
      effectiveYear: 2025,
      note: 'Income limits, not rents. HUD publishes these each spring; the ladder is median family income by household size.',
      sourceUrl: 'https://www.huduser.gov/portal/datasets/il.html',
    },
    derived: {
      affordableRentAtWage: { wageCents: MASS_WAGE_CENTS, monthly: affordable },
      gapPercent: gap,
      method:
        'Affordable rent = 30% of monthly earnings at the Massachusetts minimum wage, 40 hours per week. Gap is the share of the median gross rent that a minimum-wage household cannot cover.',
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
