'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((m) => m.DorchesterMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-[var(--surface)] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading map…" />
      </div>
    ),
  },
);

interface Alert { id: string; header: string; description: string; updatedAt: string }

export default function MapPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const { data, loading } = useApi<{ alerts: Alert[]; live?: boolean }>('/api/mbta?type=alerts', 60000);

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="kicker">Live board</p>
            <h1 className="font-display text-3xl">{t('map.title')}</h1>
            <p className="text-sm text-[var(--muted)]">{t('map.subtitle')}</p>
          </div>
          <DataRefreshIndicator lastUpdated={data ? (data.live ? 'MBTA live' : 'MBTA down') : null} isRefreshing={loading} />
        </div>

        {(data?.alerts || []).slice(0, 4).map((alert) => (
          <div key={alert.id} className="border-l-4 border-[var(--gold)] bg-[var(--surface)] px-3 py-2 text-sm">
            <p className="font-semibold">{alert.header}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{alert.description}</p>
          </div>
        ))}

        <DorchesterMap height="600px" />
      </div>
    </MainLayout>
  );
}
