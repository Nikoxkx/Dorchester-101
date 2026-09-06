'use client';

import { useEffect, useState } from 'react';

export function UpdateNotifier() {
  const [available, setAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const api = window.electron;
    if (!api) return;
    api.onUpdateAvailable(() => setAvailable(true));
    api.onUpdateDownloaded(() => {
      setAvailable(false);
      setReady(true);
    });
  }, []);

  if (!available && !ready) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] bg-[var(--surface)] border border-[var(--ink)] p-4 shadow-lg">
      {available && (
        <>
          <p className="kicker">Desktop</p>
          <p className="font-display text-lg">Downloading an update</p>
          <p className="text-sm text-[var(--muted)] mt-1">It will install the next time you restart.</p>
        </>
      )}
      {ready && (
        <>
          <p className="kicker">Desktop</p>
          <p className="font-display text-lg">Update ready</p>
          <p className="text-sm text-[var(--muted)] mt-1">Restart to open the new build.</p>
          <button
            className="mt-3 bg-[var(--blue)] text-white px-4 py-2 text-sm font-semibold uppercase tracking-[0.06em]"
            onClick={() => window.electron?.restartApp()}
          >
            Restart now
          </button>
        </>
      )}
    </div>
  );
}
