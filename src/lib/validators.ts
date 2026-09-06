/**
 * DOR101 — Validators & Calculators (rebuilt with original logic, no generic libraries)
 */

export function calculateAMIPercentage(householdSize: number, annualIncome: number): number {
  const amiTable: Record<number, number> = {
    1: 120000, 2: 137200, 3: 154300, 4: 171400,
    5: 185200, 6: 198900, 7: 212500, 8: 226300,
  };
  const ami100 = amiTable[householdSize] || amiTable[2];
  return Math.round((annualIncome / ami100) * 100);
}

export function getAMIBand(pct: number): string {
  if (pct <= 30) return '30% AMI';
  if (pct <= 50) return '50% AMI';
  if (pct <= 60) return '60% AMI';
  if (pct <= 80) return '80% AMI';
  return 'Market';
}

export function rentBurdenPercent(rent: number, annualIncome: number): number {
  return Math.round(((rent * 12) / annualIncome) * 1000) / 10;
}

export function validateHouseholdSize(n: number): boolean {
  return Number.isInteger(n) && n >= 1 && n <= 12;
}

export function validateIncome(n: number): boolean {
  return Number.isFinite(n) && n >= 0 && n <= 5000000;
}
