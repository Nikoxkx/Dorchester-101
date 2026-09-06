import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `1-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// AMI Calculator for Boston 2024/2025
export const BOSTON_AMI_2025 = {
  1: 91900,
  2: 105000,
  3: 118100,
  4: 131150,
  5: 141650,
  6: 152150,
  7: 162650,
  8: 173100,
};

export function calculateAMIPercentage(householdSize: number, annualIncome: number): number {
  const size = Math.min(Math.max(householdSize, 1), 8) as keyof typeof BOSTON_AMI_2025;
  const amiForSize = BOSTON_AMI_2025[size];
  return Math.round((annualIncome / amiForSize) * 100);
}

export function getAMIBand(percentage: number): string {
  if (percentage <= 30) return '30% AMI';
  if (percentage <= 50) return '50% AMI';
  if (percentage <= 60) return '60% AMI';
  if (percentage <= 80) return '80% AMI';
  if (percentage <= 100) return '100% AMI';
  return 'Market Rate';
}

export function calculateRentBurden(monthlyIncome: number, monthlyRent: number): {
  percentage: number;
  status: 'affordable' | 'cost-burdened' | 'severely-burdened';
  label: string;
} {
  const percentage = Math.round((monthlyRent / monthlyIncome) * 100);
  
  if (percentage <= 30) {
    return { percentage, status: 'affordable', label: 'Affordable' };
  }
  if (percentage <= 50) {
    return { percentage, status: 'cost-burdened', label: 'Cost-Burdened' };
  }
  return { percentage, status: 'severely-burdened', label: 'Severely Cost-Burdened' };
}

// Dorchester neighborhood data
export const DORCHESTER_NEIGHBORHOODS = [
  'Fields Corner',
  'Grove Hall',
  'Uphams Corner',
  'Savin Hill',
  'Codman Square',
  'Lower Mills',
  'Port Norfolk',
  'Four Corners',
  'Ashmont',
  'Adams Village',
  'Neponset',
  'Meeting House Hill',
] as const;

export const DORCHESTER_ZIP_CODES = ['02121', '02122', '02124', '02125'] as const;
