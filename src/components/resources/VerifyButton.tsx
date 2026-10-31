'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useBadgeStore } from '@/stores/badgeStore';
import { cn } from '@/lib/utils';
import { useI18n, type TranslationKey } from '@/lib/i18n';

interface VerifyRecord {
  count: number;
  lastAt: string;
}

function readVerify(id: string): VerifyRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`dor101-verify:${id}`);
    return raw ? (JSON.parse(raw) as VerifyRecord) : null;
  } catch {
    return null;
  }
}

function formatAgo(
  iso: string,
  t: (key: TranslationKey, tokens?: Record<string, string | number>) => string,
): string {
  const diffMin = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (diffMin < 1) return t('time.justNow');
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin });
  const hrs = Math.round(diffMin / 60);
  if (hrs < 24) return t('time.hoursAgo', { count: hrs });
  return t('time.daysAgo', { count: Math.round(hrs / 24) });
}

export function VerifyButton({ resourceId }: { resourceId: string }) {
  const { t } = useI18n();
  const [record, setRecord] = useState<VerifyRecord | null>(() => readVerify(resourceId));
  const [justConfirmed, setJustConfirmed] = useState(false);
  const earn = useBadgeStore((s) => s.earn);

  const handleConfirm = () => {
    const next: VerifyRecord = {
      count: (record?.count ?? 0) + 1,
      lastAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(`dor101-verify:${resourceId}`, JSON.stringify(next));
    } catch {
      // storage quota ignore
    }
    setRecord(next);
    setJustConfirmed(true);
    earn('verifier');
  };

  return (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={justConfirmed}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold transition-colors',
        justConfirmed
          ? 'border-[var(--color-accent-green)]/50 bg-[var(--color-accent-green)]/12 text-[var(--color-accent-green)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-green)] hover:text-[var(--color-accent-green)]',
      )}
    >
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      {record
        ? `${t('verify.count', { count: record.count })} · ${formatAgo(record.lastAt, t)}`
        : t('verify.confirmOpen')}
    </button>
  );
}
