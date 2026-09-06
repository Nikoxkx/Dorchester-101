export default function Loading() {
  // Route-level loading — flat content-layer skeleton, no spinner chrome.
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <div className="skeleton h-10 w-2/3" />
      <div className="skeleton h-5 w-1/2" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
        <div className="skeleton h-40" />
      </div>
    </div>
  );
}
