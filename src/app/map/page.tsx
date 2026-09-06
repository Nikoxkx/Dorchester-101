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
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-5 border-b border-[var(--line)]">
          <div>
            <p className="kicker mb-3">Live board</p>
            <h1 className="font-display text-[clamp(2.2rem,4.5vw,3.75rem)] font-black leading-[0.95] tracking-[-0.03em] text-[var(--charcoal)]">{t('map.title')}</h1>
            <p className="text-sm text-[var(--ink-soft)] mt-3">{t('map.subtitle')}</p>
          </div>
          <DataRefreshIndicator lastUpdated={data ? (data.live ? 'MBTA live' : 'MBTA down') : null} isRefreshing={loading} />
        </div>

        {(data?.alerts || []).slice(0, 4).map((alert) => (
          <div key={alert.id} className="border-l-4 border-[var(--ochre)] bg-[var(--wax)] px-4 py-3 text-sm rounded-r-lg">
            <p className="font-bold text-[var(--charcoal)]">{alert.header}</p>
            <p className="text-xs text-[var(--ink-soft)] mt-1">{alert.description}</p>
          </div>
        ))}

        <div className="rounded-2xl overflow-hidden border border-[var(--line)] shadow-[0_14px_40px_var(--shadow)]">
          <DorchesterMap height="620px" />
        </div>
      </div>
    </MainLayout>
  );
}
