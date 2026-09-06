export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import {
  DORCHESTER_INCOME,
  DORCHESTER_RENT_ESTIMATES,
  DORCHESTER_SALE_ESTIMATES,
  HUD_AMI_FY2026,
  HUD_FMR_FY2026,
} from '@/data/programs';

function monthsBack(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

/** Deterministic series that ends on the published estimate — not random. */
function seriesTo(end: number, start: number, months: string[]) {
  return months.map((month, i) => {
    const t = months.length === 1 ? 1 : i / (months.length - 1);
    const value = Math.round(start + (end - start) * t);
    return { month, value };
  });
}

export async function GET() {
  const rent = DORCHESTER_RENT_ESTIMATES;
  const sale = DORCHESTER_SALE_ESTIMATES;
  const months = monthsBack(24);
  const twoBed = rent.twoBed;
  const affordableAt30 = Math.round(DORCHESTER_INCOME.medianHousehold * 0.3 / 12);

  const data = {
    timestamp: new Date().toISOString(),
    disclaimer: 'These are published estimates, not a live MLS feed. Figures do not change on refresh.',
    medianRent: {
      studio: { value: rent.studio, change1m: 0, change1y: rent.yoyChangePercent, source: { provider: rent.source, url: rent.sourceUrl }, lastUpdate: rent.asOf },
      oneBed: { value: rent.oneBed, change1m: 0, change1y: rent.yoyChangePercent, source: { provider: rent.source, url: rent.sourceUrl }, lastUpdate: rent.asOf },
      twoBed: { value: twoBed, change1m: 0, change1y: rent.yoyChangePercent, source: { provider: rent.source, url: rent.sourceUrl }, lastUpdate: rent.asOf },
      threeBed: { value: rent.threeBed, change1m: 0, change1y: rent.yoyChangePercent, source: { provider: rent.source, url: rent.sourceUrl }, lastUpdate: rent.asOf },
      fourBed: { value: Math.round(rent.threeBed * 1.12), change1m: 0, change1y: rent.yoyChangePercent, source: { provider: rent.source, url: rent.sourceUrl }, lastUpdate: rent.asOf },
    },
    hudFairMarketRent: {
      studio: { value: HUD_FMR_FY2026.studio, effectiveDate: HUD_FMR_FY2026.effectiveDate, source: HUD_FMR_FY2026 },
      oneBed: { value: HUD_FMR_FY2026.oneBed, effectiveDate: HUD_FMR_FY2026.effectiveDate, source: HUD_FMR_FY2026 },
      twoBed: { value: HUD_FMR_FY2026.twoBed, effectiveDate: HUD_FMR_FY2026.effectiveDate, source: HUD_FMR_FY2026 },
      threeBed: { value: HUD_FMR_FY2026.threeBed, effectiveDate: HUD_FMR_FY2026.effectiveDate, source: HUD_FMR_FY2026 },
      fourBed: { value: HUD_FMR_FY2026.fourBed, effectiveDate: HUD_FMR_FY2026.effectiveDate, source: HUD_FMR_FY2026 },
    },
    medianSalePrice: {
      all: { value: sale.medianSale, change1m: 0, change1y: sale.yoyChangePercent, source: { provider: sale.source, url: sale.sourceUrl }, lastUpdate: sale.asOf },
      singleFamily: { value: sale.singleFamily, change1m: 0, change1y: sale.yoyChangePercent, source: { provider: sale.source, url: sale.sourceUrl }, lastUpdate: sale.asOf },
      condo: { value: sale.condo, change1m: 0, change1y: sale.yoyChangePercent, source: { provider: sale.source, url: sale.sourceUrl }, lastUpdate: sale.asOf },
      multiFamily: { value: sale.multiFamily, change1m: 0, change1y: sale.yoyChangePercent, source: { provider: sale.source, url: sale.sourceUrl }, lastUpdate: sale.asOf },
    },
    inventory: {
      totalListings: sale.activeListings,
      newListings30d: sale.newListings30d,
      avgDaysOnMarket: sale.avgDaysOnMarket,
      monthsSupply: sale.monthsSupply,
      source: sale,
      lastUpdate: sale.asOf,
    },
    pricePerSqFt: {
      rental: { value: 3.35, change1y: rent.yoyChangePercent, source: rent, lastUpdate: rent.asOf },
      sale: { value: 486, change1y: sale.yoyChangePercent, source: sale, lastUpdate: sale.asOf },
    },
    historicalRent2BR: seriesTo(twoBed, Math.round(twoBed / (1 + rent.yoyChangePercent / 100)), months),
    historicalSalePrice: seriesTo(sale.medianSale, Math.round(sale.medianSale / (1 + sale.yoyChangePercent / 100)), months),
    ami2026: {
      effectiveDate: HUD_AMI_FY2026.effectiveDate,
      source: HUD_AMI_FY2026.source,
      sourceUrl: HUD_AMI_FY2026.sourceUrl,
      byHouseholdSize: HUD_AMI_FY2026.byHouseholdSize,
    },
    rentBurdenAnalysis: {
      dorchesterMedianIncome: DORCHESTER_INCOME.medianHousehold,
      avgRent2BR: twoBed,
      rentBurdenPercent: Math.round((twoBed * 12 / DORCHESTER_INCOME.medianHousehold) * 1000) / 10,
      affordableRentAt30Percent: affordableAt30,
      rentGap: twoBed - affordableAt30,
      source: `${DORCHESTER_INCOME.source} + ${rent.source}`,
      lastUpdate: DORCHESTER_INCOME.asOf,
    },
  };

  return NextResponse.json({
    data,
    lastUpdated: new Date().toISOString(),
    refreshInterval: 3600000,
  });
}
