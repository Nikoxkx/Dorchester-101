'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useBadgeStore } from '@/stores/badgeStore';
import { cn } from '@/lib/utils';

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

function formatAgo(iso: string): string {
  const diffMin = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const hrs = Math.round(diffMin / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function VerifyButton({ resourceId }: { resourceId: string }) {
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
        ? `${record.count} ${record.count === 1 ? 'person' : 'people'} confirmed · ${formatAgo(record.lastAt)}`
        : 'Confirm open today'}
    </button>
  );
}
