'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md">
        <p className="kicker">Desk error</p>
        <h1 className="font-display text-4xl mt-1">Something on this page broke.</h1>
        <p className="text-sm text-[var(--muted)] mt-3">
          {error.message || 'Try again. If it keeps happening, open the source repo.'}
        </p>
        <button onClick={reset} className="mt-5 bg-[var(--red)] text-white px-4 py-2 text-sm font-bold">
          Try again
        </button>
      </div>
    </div>
  );
}
