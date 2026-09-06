'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Leaflet touches `window` the moment it is imported, so the map can only exist
 * after hydration. `ssr: false` is not a shortcut here: server-rendered markers
 * would be thrown away and re-fetched, which is exactly the double-load that makes
 * a map page feel slow on a phone.
 *
 * The fallback reserves the shape the real map will take — toolbar, canvas, details
 * column. A spinner that swaps for a taller box pushes the page down mid-read, and
 * on a phone it moves the tap target out from under someone's thumb.
 */
const DorchesterMap = dynamic(
  () => import('./DorchesterMap').then((mod) => mod.DorchesterMap),
  { ssr: false, loading: () => <MapSkeleton /> }
);

export function DorchesterMapLoader() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
      <DorchesterMap />
    </motion.div>
  );
}

/**
 * Card-sized map for other pages. Same rule as the full map — Leaflet only runs in
 * the browser — but it is a real basemap rather than a static picture, so a rider
 * sees their own neighbourhood before deciding to open the full tool.
 */
const MapPreviewInner = dynamic(() => import('./MapPreview').then((mod) => mod.MapPreview), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

/**
 * The shell owns the height. Without it, the `ssr:false` loading skeleton has no
 * parent with a height and collapses to nothing — which is exactly the blank
 * preview the dashboard used to show before hydration.
 */
export function MapPreview({ height = '15rem' }: { height?: string }) {
  return (
    <div style={{ height }} className="relative w-full overflow-hidden bg-[var(--color-bg-tertiary)]" aria-hidden="false">
      <MapPreviewInner height={height} />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" role="status" aria-live="polite">
      <span className="sr-only">Map loading</span>
      <div className="h-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]" />
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Skeleton className="h-[54vh] min-h-[20rem] rounded-2xl lg:h-[38rem]" />
        <div className="flex-col gap-2.5 lg:flex">
          <Skeleton className="h-11 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
