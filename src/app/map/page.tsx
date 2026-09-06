'use client';

import { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Map, AlertTriangle, RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, DataRefreshIndicator } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/lib/i18n';

const DorchesterMap = dynamic(
  () => import('@/components/map/DorchesterMap').then((mod) => mod.DorchesterMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-[var(--color-bg-tertiary)] rounded-xl flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading satellite map…" />
      </div>
    ),
  }
);

const pageVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.3 } },
};

interface MBTAAlert {
  id: string;
  header: string;
  description: string;
  affectedRoutes: string[];
  updatedAt: string;
}

export default function MapPage() {
  const { language } = useAppStore();
  const { t } = useTranslation(language);
  const [alerts, setAlerts] = useState<MBTAAlert[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 60_000);
    return () => clearInterval(id);
  }, []);

  const fetchAlerts = async () => {
    try {
      const r = await fetch('/api/mbta?type=alerts');
      const d = await r.json();
      setAlerts(d.alerts || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch { /* swallow */ }
  };

  return (
    <MainLayout>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="enter"
        className="space-y-4 pb-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold flex items-center gap-3">
              <Map className="w-6 h-6 text-[var(--color-accent-primary)]" />
              {t('map.title', 'Dorchester Resources Map')}
            </h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {t('map.subtitle', 'Satellite view · Live MBTA transit · Community resources')}
            </p>
          </div>
          <DataRefreshIndicator lastUpdated={lastUpdated} isRefreshing={false} />
        </div>

        {/* Service alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 rounded-lg text-sm',
                  'bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/20'
                )}
              >
                <AlertTriangle className="w-4 h-4 text-[var(--color-accent-amber)] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-sm">{alert.header}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {alert.description}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                    {t('common.source', 'Source')}: MBTA · {t('common.updated', 'Updated')} {new Date(alert.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Map - Fixed height with overflow handling */}
        <div className="relative z-0">
          <DorchesterMap height="600px" />
        </div>
      </motion.div>
    </MainLayout>
  );
}
