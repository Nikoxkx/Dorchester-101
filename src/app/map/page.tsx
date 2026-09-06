'use client';

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { useApi } from '@/hooks/useApi';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';
import { AlertTriangle } from '@/components/ui/icons';

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
      <div className="space-y-6">
        {/* Page head */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b-2 border-[var(--charcoal)]">
          <div>
            <p className="masthead-date mb-3">03 — MBTA · service alerts · live trains</p>
            <h1 className="font-display font-bold uppercase leading-[0.95] tracking-[0.005em] text-[clamp(2rem,4.5vw,3.4rem)] text-[var(--charcoal)]">
              {t('map.title')}
            </h1>
            <p className="text-sm text-[var(--ink-soft)] mt-3 max-w-2xl">{t('map.subtitle')}</p>
          </div>
          <DataRefreshIndicator lastUpdated={data ? (data.live ? 'MBTA live' : 'MBTA down') : null} isRefreshing={loading} />
        </div>

        {/* Live alerts */}
        {(data?.alerts || []).slice(0, 4).map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 border border-[var(--amber)]/45 bg-[var(--amber)]/8 px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-[var(--amber)] shrink-0" />
            <div>
              <p className="font-bold text-[var(--charcoal)]">{alert.header}</p>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">{alert.description}</p>
            </div>
          </div>
        ))}

        <div className="border border-[var(--line)]">
          <DorchesterMap height="620px" />
        </div>
      </div>
    </MainLayout>
  );
}
