'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, ImageOff, Satellite } from 'lucide-react';
import { SourceMark } from '@/components/sources/SourceMark';
import { cn } from '@/lib/utils';

/**
 * Current aerial view of a development site, assembled from the same Esri
 * World Imagery tiles the map page already uses (so no new data source and no
 * key). Tiles are stitched as a 3×2 grid centred on the parcel, which at zoom
 * 18 covers roughly 230 m × 150 m — enough to see the lot and the block.
 *
 * Tiles load from either of Esri's two public hosts: `server.` and
 * `services.arcgisonline.com` serve the same imagery, so a blocked or flaky
 * host costs one retry per tile instead of a hole in the picture. Only when
 * every tile has failed on both hosts does the figure admit defeat and show
 * the coordinates instead.
 *
 * Attribution is drawn on the image because Esri's terms require it wherever
 * the imagery is shown, not just on the map page.
 */
const TILE = 256;
const ZOOM = 18;
const TILE_HOSTS = ['server.arcgisonline.com', 'services.arcgisonline.com'] as const;

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export function SiteImagery({ lat, lng, label, className }: { lat: number; lng: number; label: string; className?: string }) {
  const [failedTiles, setFailedTiles] = useState(0);
  // Composite is 3×2 tiles (768×512 px) — the same 3:2 shape as the frame, so
  // the scaled picture fills it edge to edge with no cropped band. The parcel
  // sits at the composite centre: origin is half a tile left/above its tile
  // coordinate, then the sub-tile remainder shifts it under the crosshair.
  const { tiles, offsetX, offsetY } = useMemo(() => {
    const { x, y } = tileXY(lat, lng, ZOOM);
    const originX = x - 1.5; // in tile units — parcel at the centre of 3 columns
    const originY = y - 1;
    const tx0 = Math.floor(originX);
    const ty0 = Math.floor(originY);
    const list: Array<{ tx: number; ty: number; col: number; row: number }> = [];
    for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) list.push({ tx: tx0 + col, ty: ty0 + row, col, row });
    return { tiles: list, offsetX: (originX - tx0) * TILE, offsetY: (originY - ty0) * TILE };
  }, [lat, lng]);

  const unavailable = failedTiles >= tiles.length;
  const gmaps = `https://www.google.com/maps/@${lat},${lng},19z/data=!3m1!1e3`;

  return (
    <figure className={cn('overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]', className)}>
      <div className="relative aspect-[3/2] w-full overflow-hidden"><div className="absolute inset-0" style={{ containerType: 'inline-size' }}>
        {!unavailable ? (
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: 768, height: 512, transform: `scale(calc(100cqw / 768px)) translate(${-offsetX}px, ${-offsetY}px)` }}>
            {tiles.map((t) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${t.tx}-${t.ty}`}
                src={`https://${TILE_HOSTS[0]}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${t.ty}/${t.tx}`}
                alt=""
                width={TILE}
                height={TILE}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  const img = event.currentTarget;
                  const tried = Number(img.dataset.try ?? '0');
                  if (tried < TILE_HOSTS.length - 1) {
                    // Same tile from Esri's mirror host before giving up on it.
                    img.dataset.try = String(tried + 1);
                    img.src = `https://${TILE_HOSTS[tried + 1]}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${t.ty}/${t.tx}`;
                    return;
                  }
                  setFailedTiles((n) => n + 1);
                }}
                className="absolute max-w-none"
                style={{ left: t.col * TILE, top: t.row * TILE, width: TILE, height: TILE }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-[var(--color-text-muted)]">
            <div>
              <ImageOff className="mx-auto mb-1.5 h-6 w-6" aria-hidden="true" />
              Satellite imagery could not be loaded (offline or blocked). The site is at {lat.toFixed(5)}, {lng.toFixed(5)}.
            </div>
          </div>
        )}
        {/* Parcel marker */}
        {!unavailable && (
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="block h-10 w-10 rounded-full border-2 border-white/90 bg-[var(--color-accent-secondary)]/25 shadow-[0_0_0_2px_rgba(0,0,0,.35)]" />
            <span className="absolute left-1/2 top-1/2 block h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
          </span>
        )}
        </div>
        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wide text-white">
          <Satellite className="h-3 w-3" aria-hidden="true" /> Current aerial view
        </span>
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-[11px] leading-snug text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <SourceMark id="esri" size="xs" /> Imagery © Esri, Maxar, Earthstar Geographics — {label}
        </span>
        <a href={gmaps} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-heading font-semibold text-[var(--color-text-secondary)] hover:underline">
          Open in Google Maps <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}
