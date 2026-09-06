'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { useLiveApi } from '@/hooks/useLiveApi';
import { RadioTower, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  {
    ssr: false,
    loading: () => <div className="h-[600px] content-card squircle animate-pulse" aria-hidden />,
  },
);

interface Alert {
  id: string;
  header: string;
  description: string;
  updatedAt: string;
  severity: number;
}

export default function MapPage() {
  const { language } = useAppStore();
  const { t, formatFor } = useTranslation(language);

  // MBTA alerts: 60s polling floor + instant push through the SSE channel.
  const { data, loading } = useLiveApi<{ alerts: Alert[]; live?: boolean }>(
    '/api/mbta?type=alerts',
    { intervalMs: 60_000, channels: ['mbta'] },
  );
  const alerts = (data?.alerts ?? []).slice(0, 4);

  return (
    <MainLayout>
      <div className="space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-large font-bold tracking-tight text-1">{t('map.title')}</h1>
            <p className="text-subhead text-text-2 mt-1">{t('map.description')}</p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-caption2 font-bold uppercase tracking-wider shrink-0',
              data?.live ? 'text-success' : 'text-text-3',
            )}
            role="status"
          >
            <RadioTower className="w-3.5 h-3.5" aria-hidden />
            {data?.live ? `MBTA ${t('common.realtime')}` : loading ? t('common.loading') : 'MBTA —'}
          </span>
        </header>

        {alerts.length > 0 && (
          <ul className="space-y-2" aria-label={t('map.livePredictions')}>
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="content-card squircle px-4 py-3 flex items-start gap-3"
                style={{ background: 'color-mix(in srgb, var(--amber-fill) 8%, var(--canvas))' }}
              >
                <TriangleAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
                <div className="min-w-0">
                  <p className="text-footnote font-semibold text-1 leading-snug">{alert.header}</p>
                  <p className="text-caption text-text-2 mt-0.5 leading-snug">{alert.description}</p>
                  <p className="text-caption2 text-text-3 mt-1">
                    MBTA · {formatFor.relative(alert.updatedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="content-card squircle overflow-hidden">
          <DorchesterMap height="600px" />
        </div>
      </div>
    </MainLayout>
  );
}
