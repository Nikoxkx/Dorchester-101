import { CardSkeleton, Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

/**
 * Suspense fallback for every route. It reserves a header, three cards and a
 * table so the page that replaces it lands in the same rhythm; a bare spinner in
 * the middle of a blank screen makes the whole layout jump when data arrives.
 */
export default function RouteLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8" role="status" aria-busy="true">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
