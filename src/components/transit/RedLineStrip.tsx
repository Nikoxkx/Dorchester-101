'use client';

import { RED_LINE } from '@/data/map';

export function RedLineStrip() {
  return (
    <div className="py-2">
      <p className="kicker mb-3">Ashmont branch</p>
      <div className="relative pl-4">
        <div className="absolute left-[7px] top-1 bottom-1 w-[3px] bg-[var(--mbta)]" />
        <ol className="space-y-3">
          {RED_LINE.stops.map((stop) => (
            <li key={stop.id} className="relative flex items-center gap-3">
              <span className="absolute -left-4 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[var(--mbta)]" />
              <div>
                <p className="font-semibold text-sm">{stop.name}</p>
                {stop.transfers && <p className="text-[11px] text-[var(--muted)]">{stop.transfers}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
