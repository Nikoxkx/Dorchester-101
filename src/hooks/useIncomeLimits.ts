'use client';

import { useCallback, useEffect, useState } from 'react';

export interface IncomeLimitsResponse {
  status: 'available' | 'unavailable';
  fiscalYear?: number;
  effectiveDate?: string;
  area?: string;
  sourceUrl?: string;
  /** 100% AMI by household size (2 × HUD 50% limits), keyed by size as string. */
  table: Record<string, number>;
  bands?: Record<'30' | '50' | '80', Record<string, number>>;
  median?: number | null;
  error?: string;
}

/**
 * The current HUD income-limit ladder, live from /api/income-limits.
 *
 * The calculator used to read a ladder copied into the bundle; this hook is the
 * one client entry point to the published figures, and it says when they are not
 * readable rather than silently substituting an old table.
 */
export function useIncomeLimits(): { data: IncomeLimitsResponse | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<IncomeLimitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/income-limits', { cache: 'no-store' })
      .then(async (res) => {
        const payload = (await res.json()) as IncomeLimitsResponse;
        if (!res.ok || payload.status !== 'available') throw new Error(payload.error ?? 'Income limits unavailable');
        setData(payload);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Income limits unavailable');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
