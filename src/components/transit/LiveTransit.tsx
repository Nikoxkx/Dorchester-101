'use client';

import { TrainFront, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useLiveApi } from '@/hooks/useLiveApi';
import { useTranslation } from '@/lib/i18n';
import { RED_LINE } from '@/data/map';
import { cn } from '@/lib/utils';

interface MbtaPayload {
  predictions?: {
    stopId: string;
    stopName: string;
    routeId: string;
    direction: string;
    minutesAway: number;
    status: 'on_time' | 'delayed' | 'arriving';
  }[];
  live?: boolean;
  source?: string;
}

const ASHMONT_STOPS = RED_LINE.stops; // this export is the Ashmont branch

/**
 * LiveTransit — MBTA predictions for the Ashmont branch, updating on the
 * MBTA's own 30-second cadence and instantly on SSE push. Flat content
 * layer; the live dot is state feedback, not decoration.
 */
export function LiveTransit({ compact = false }: { compact?: boolean }) {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);
  const { data, loading } = useLiveApi<MbtaPayload>('/api/mbta?type=predictions', {
    intervalMs: 30_000,
    channels: ['mbta'],
  });

  const predictions = data?.predictions ?? [];
  const live = data?.live ?? false;

  const nextFor = (stopId: string) =>
    predictions
      .filter((p) => p.stopId === stopId)
      .slice(0, compact ? 1 : 2);

  if (compact) {
    const ashmont = predictions.filter((p) => ASHMONT_STOPS.some((s) => s.id === p.stopId));
    return (
      <div className="content-card squircle p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="kicker flex items-center gap-1.5">
            <TrainFront className="w-3.5 h-3.5" aria-hidden />
            {t('dashboard.transit')}
          </p>
          <span className="flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider text-text-3">
            <span aria-hidden className={cn('dot live-dot', live ? 'dot-open' : 'dot-pending')} />
            {live ? 'MBTA' : '—'}
          </span>
        </div>
        {loading && predictions.length === 0 ? (
          <div className="mt-3 space-y-2" aria-hidden>
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-5 w-1/2" />
          </div>
        ) : ashmont.length === 0 ? (
          <p className="text-footnote text-text-2 mt-3">{t('map.noPredictions')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ashmont.slice(0, 4).map((p, i) => (
              <li key={`${p.stopId}-${p.routeId}-${i}`} className="flex items-baseline justify-between gap-3">
                <span className="text-footnote font-medium text-1 truncate">{p.stopName}</span>
                <span className="text-footnote font-bold num text-1 shrink-0">
                  {p.minutesAway === 0 ? '→' : `${p.minutesAway}′`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="content-card squircle p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-subhead font-bold text-1 flex items-center gap-2">
          <TrainFront className="w-4 h-4" aria-hidden />
          {t('map.livePredictions')}
        </h3>
        <span className="flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider text-text-3">
          <span aria-hidden className={cn('dot live-dot', live ? 'dot-open' : 'dot-pending')} />
          {t('common.realtime')} · 30s
        </span>
      </div>
      <ol className="mt-4 space-y-3">
        {ASHMONT_STOPS.map((stop) => {
          const next = nextFor(stop.id);
          return (
            <li key={stop.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-footnote font-semibold text-1 truncate">{stop.name}</p>
                {next[0]?.direction && (
                  <p className="text-caption2 text-text-3 truncate">→ {next[0].direction}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0 num">
                {next.length === 0 ? (
                  <span className="text-caption text-text-3">—</span>
                ) : (
                  next.map((p, i) => (
                    <span
                      key={i}
                      className={cn(
                        'inline-flex items-center justify-center min-w-9 h-7 px-1.5 rounded-full text-footnote font-bold',
                        p.status === 'delayed'
                          ? 'bg-warning-fill/15 text-warning'
                          : 'bg-[var(--surface-2)] text-1',
                      )}
                    >
                      {p.minutesAway === 0 ? <ArrowRight className="w-3.5 h-3.5" aria-label={t('common.open')} /> : `${p.minutesAway}′`}
                    </span>
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-caption2 text-text-3 mt-4">
        {formatFor.date(new Date(), { hour: '2-digit', minute: '2-digit' })} · MBTA API v3
      </p>
    </div>
  );
}
