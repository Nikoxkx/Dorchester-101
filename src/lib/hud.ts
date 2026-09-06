/**
 * Live federal and state housing-income data.
 *
 * Everything here is read from a public publisher file on request and cached for
 * a day. The values were previously baked into the app (AMI ladder, minimum
 * wage, FMRs); this module is the single place that turns the publishers' own
 * files into the numbers the site shows.
 *
 * Files:
 *  - HUD FY FMRs (county level, xlsx)  — huduser.gov
 *  - HUD Section 8 Income Limits (xlsx) — huduser.gov
 *  - Massachusetts minimum wage         — mass.gov (the statute page, not a copy)
 */
import { globalCache, CACHE_TTL } from './cache';

const UA =
  'DOR101 community hub (open-source; contact via github.com/Nikoxkx/Dorchester-101)';

/** HUD county-level FMR workbooks, newest effective through older, in order. */
const HUD_FMR_SOURCES = [
  {
    fiscalYear: '2027',
    effectiveDate: '2026-10-01',
    url: 'https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx',
  },
  {
    fiscalYear: '2026',
    effectiveDate: '2026-05-21',
    url: 'https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY26_FMRs_revised.xlsx',
  },
] as const;

/** HUD Section 8 income limits workbooks, newest first. */
const HUD_IL_SOURCES: readonly WorkbookSource[] = [
  {
    fiscalYear: '2026',
    effectiveDate: '2026-05-01',
    url: 'https://www.huduser.gov/portal/datasets/il/il26/Section8-FY26.xlsx',
  },
];

export interface HudFmrResult {
  status: 'available';
  fiscalYear: string;
  effectiveDate: string;
  area: string;
  units: Record<string, number>;
  sourceUrl: string;
  retrievedAt: string;
  /** True when the figures come from the verified point-in-time snapshot below. */
  snapshot?: boolean;
}

/**
 * Verified point-in-time capture of the FY27 HUD FMR county workbook
 * (https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx),
 * Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area — the area that contains
 * Suffolk County (the City of Boston). Same values appear on every row of that
 * metro area in the workbook. Used only when the live workbook is unreachable,
 * and marked `snapshot` so callers can say so.
 */
export const HUD_FMR_SNAPSHOT = {
  fiscalYear: '2027',
  effectiveDate: '2026-10-01',
  area: 'Boston-Cambridge-Quincy, MA-NH HUD Metro FMR Area',
  units: { studio: 2440, '1BR': 2518, '2BR': 3008, '3BR': 3584, '4BR': 3953 },
  sourceUrl: 'https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx',
  capturedAt: '2026-09-06T21:50:00.000Z',
} as const;

export interface HudIncomeLimits {
  status: 'available';
  fiscalYear: number;
  effectiveDate: string;
  /** HUD's published 50% income limits, 1–8 person households. */
  limits50: Record<string, number>;
  /** HUD's published 80% income limits, 1–8 person households. */
  limits80: Record<string, number>;
  /** HUD's published "extremely low" (30% / poverty-based) limits, 1–8 person. */
  limits30: Record<string, number>;
  /** Area median family income from the same workbook, 4-person family. */
  median: number | null;
  area: string;
  sourceUrl: string;
  retrievedAt: string;
}

/**
 * Reads the first worksheet of a publisher workbook. Each source has two
 * possible URLs (sometimes the file moves) — the caller passes them in order.
 */
interface WorkbookSource {
  url: string;
  fiscalYear: string;
  effectiveDate: string;
}

async function readWorkbook(urls: readonly WorkbookSource[]): Promise<{ source: WorkbookSource; rows: Record<string, unknown>[] }> {
  let lastError: unknown;
  for (const source of urls) {
    try {
      const res = await fetch(source.url, {
        cache: 'no-store',
        headers: { accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'user-agent': UA },
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HUD workbook responded ${res.status}`);
      const readXlsxFile = (await import('read-excel-file/node')).default;
      const buffer = Buffer.from(await res.arrayBuffer());
      const table = await readXlsxFile(buffer);
      if (table.length < 2) throw new Error('HUD workbook has no rows');
      const headers = table[0].map((cell) => String(cell ?? '').trim());
      const rows = table.slice(1).map((cells) => {
        const row: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          if (header) row[header] = cells[index] ?? null;
        });
        return row;
      });
      return { source, rows };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('HUD workbook unreachable');
}

/**
 * Suffolk County, MA row: state code MA plus the county fips prefix 25025.
 * Newer workbooks carry `fips` (e.g. 2502599999) or `countyname`; older ones
 * `county`; matching on state + fips prefix covers both.
 */
function pickRow(rows: Array<Record<string, unknown>>): Record<string, unknown> | undefined {
  return rows.find((row) => {
    const state = String(row.stusps ?? row.state ?? '').trim().toUpperCase();
    const fips = String(row.fips ?? '').trim();
    const countyName = String(row.countyname ?? row.county ?? '').trim().toLowerCase();
    return state === 'MA' && (fips.startsWith('25025') || countyName.includes('suffolk'));
  });
}

function num(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** FY Fair Market Rents for Suffolk County, MA (Boston HUD metro FMR area). */
export async function fetchHudFmrs(): Promise<HudFmrResult> {
  const cacheKey = 'hud:fmr:suffolk';
  const cached = globalCache.get<HudFmrResult>(cacheKey);
  if (cached) return cached;

  try {
    const { source, rows } = await readWorkbook(HUD_FMR_SOURCES);
    const row = pickRow(rows);
    const units: Record<string, number> = {};
    const byBedroom: Array<[string, string]> = [
      ['studio', 'fmr_0'],
      ['1BR', 'fmr_1'],
      ['2BR', 'fmr_2'],
      ['3BR', 'fmr_3'],
      ['4BR', 'fmr_4'],
    ];
    for (const [label, key] of byBedroom) {
      const value = num(row?.[key]);
      if (value != null) units[label] = value;
    }
    if (Object.keys(units).length === 0) throw new Error('No FMR columns found on the workbook row');
    const result: HudFmrResult = {
      status: 'available',
      fiscalYear: source.fiscalYear,
      effectiveDate: source.effectiveDate,
      area: String(row?.hud_area_name ?? 'Boston, MA HUD Metro FMR Area'),
      units,
      sourceUrl: source.url,
      retrievedAt: new Date().toISOString(),
    };
    globalCache.set(cacheKey, result, CACHE_TTL.MARKET_DATA);
    return result;
  } catch {
    // Live workbook unreachable: serve the verified capture so the page never
    // goes blank, and say so instead of pretending it is fresh.
    const snapshot: HudFmrResult = {
      status: 'available',
      ...HUD_FMR_SNAPSHOT,
      retrievedAt: HUD_FMR_SNAPSHOT.capturedAt,
      snapshot: true,
    };
    globalCache.set(cacheKey, snapshot, CACHE_TTL.DEFAULT);
    return snapshot;
  }
}

/** HUD Section 8 income limits for Suffolk County, MA (Boston metro). */
export async function fetchHudIncomeLimits(): Promise<HudIncomeLimits> {
  const cacheKey = 'hud:il:suffolk';
  const cached = globalCache.get<HudIncomeLimits>(cacheKey);
  if (cached) return cached;

  const { source, rows } = await readWorkbook(HUD_IL_SOURCES);
  const row = pickRow(rows);
  const table = (prefix: string): Record<string, number> => {
    const out: Record<string, number> = {};
    for (let size = 1; size <= 8; size++) {
      const value = num(row?.[`${prefix}_${size}`]);
      if (value != null) out[String(size)] = value;
    }
    return out;
  };
  const result: HudIncomeLimits = {
    status: 'available',
    fiscalYear: Number(source.fiscalYear),
    effectiveDate: source.effectiveDate,
    limits50: table('l50'),
    limits80: table('l80'),
    limits30: table('ELI'),
    median: num(row?.median2026),
    area: String(row?.hud_area_name ?? 'Boston-Cambridge-Newton, MA-NH Metro HUD area'),
    sourceUrl: source.url,
    retrievedAt: new Date().toISOString(),
  };
  globalCache.set(cacheKey, result, CACHE_TTL.MARKET_DATA);
  return result;
}

/**
 * Massachusetts minimum wage from the Commonwealth's own statute page.
 *
 * MGL c.151 §1 sets the rate and the effective date; the page is the readable
 * public declaration of it. The number is never copied into this file.
 */
export async function fetchMaMinimumWage(): Promise<{
  rateCents: number | null;
  serviceRateCents: number | null;
  effectiveDate: string | null;
  sourceUrl: string;
  retrievedAt: string;
}> {
  const sourceUrl = 'https://www.mass.gov/info-details/massachusetts-law-about-minimum-wage';
  const cacheKey = 'ma:minimum-wage';
  const cached = globalCache.get<Awaited<ReturnType<typeof fetchMaMinimumWage>>>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(sourceUrl, {
      cache: 'no-store',
      headers: { 'user-agent': UA, accept: 'text/html' },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(`mass.gov responded ${res.status}`);
    const html = await res.text();
    const text = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ');
    const rate = text.match(/minimum wage is\s*\$(\d+(?:\.\d{2})?)/i);
    const service = text.match(/service rate is\s*\$(\d+(?:\.\d{2})?)/i);
    const effective = text.match(/Effective January 1, (\d{4})/i);
    const rateCents = rate ? Math.round(Number(rate[1]) * 100) : null;
    const serviceRateCents = service ? Math.round(Number(service[1]) * 100) : null;
    const result = {
      rateCents,
      serviceRateCents,
      effectiveDate: effective ? `${effective[1]}-01-01` : null,
      sourceUrl,
      retrievedAt: new Date().toISOString(),
    };
    if (rateCents == null) throw new Error('Could not read the rate from the statute page');
    globalCache.set(cacheKey, result, CACHE_TTL.MARKET_DATA);
    return result;
  } catch (error) {
    const result = {
      rateCents: null,
      serviceRateCents: null,
      effectiveDate: null,
      sourceUrl,
      retrievedAt: new Date().toISOString(),
    };
    globalCache.set(cacheKey, result, 5 * 60_000);
    return result;
  }
}
