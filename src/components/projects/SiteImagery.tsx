'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, ImageOff, Satellite } from 'lucide-react';
import { SourceMark } from '@/components/sources/SourceMark';
import { cn } from '@/lib/utils';

/**
 * Current aerial view of a development site, from the same Esri World Imagery
 * service the map page already uses (so no new data source and no key).
 *
 * The first version stitched a 3×2 grid of 256 px tiles and scaled it into the
 * frame with a container query. That left three ways to see the seam: a tile
 * that failed to load punched a hole in the middle of the picture, sub-pixel
 * rounding showed hairlines between neighbours, and `scale(calc(100cqw / 768px))`
 * is a no-op on any browser without container-query units, which dropped the
 * whole picture.
 *
 * So the primary path asks Esri for **one** image at the exact size and aspect
 * of the frame (`MapServer/export` with a Web Mercator bbox), which cannot have
 * a seam, cannot leave a gap and cannot clip: it is laid down with
 * `object-cover` over a 3:2 box. The tile grid survives only as a fallback for
 * hosts that block the export endpoint, and its tiles now overlap by a pixel.
 *
 * Tiles and exports both come from either of Esri's two public hosts, so a
 * blocked or flaky host costs one retry instead of a hole in the picture. Only
 * when every path has failed on both hosts does the figure admit defeat and
 * show the coordinates instead.
 *
 * Attribution is drawn on the image because Esri's terms require it wherever
 * the imagery is shown, not just on the map page.
 */
const TILE = 256;
const ZOOM = 18;
const TILE_HOSTS = ['server.arcgisonline.com', 'services.arcgisonline.com'] as const;
const EXPORT_HOSTS = ['services.arcgisonline.com', 'server.arcgisonline.com'] as const;
const EXPORT_SERVICE = '/ArcGIS/rest/services/World_Imagery/MapServer/export';
/** Half-width and half-height, in metres, of the box drawn around the parcel. */
const HALF_WIDTH_M = 130;
const HALF_HEIGHT_M = (HALF_WIDTH_M * 2) / 3;
/** Requested pixel size — 3:2 to match the frame, and 2× a typical card. */
const EXPORT_SIZE = { width: 1200, height: 800 } as const;
/** Half the Web Mercator world, in metres. */
const MERCATOR_EXTENT = 20037508.342789244;

function tileXY(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

/** WGS84 → Web Mercator metres, so a bbox in metres is a bbox on the ground. */
function toWebMercator(lat: number, lng: number) {
  const x = (lng * MERCATOR_EXTENT) / 180;
  const y = (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * (MERCATOR_EXTENT / 180);
  return { x, y };
}

/**
 * One Esri export covering the frame. `bboxSR` and `imageSR` are both Web
 * Mercator so the returned picture is square-pixel and undistorted, and the
 * bbox aspect is the frame aspect, so `object-cover` has nothing to crop.
 */
function exportUrl(host: string, lat: number, lng: number): string {
  const { x, y } = toWebMercator(lat, lng);
  const bbox = [x - HALF_WIDTH_M, y - HALF_HEIGHT_M, x + HALF_WIDTH_M, y + HALF_HEIGHT_M].map((v) => v.toFixed(3)).join(',');
  const params = new URLSearchParams({
    bbox,
    bboxSR: '102100',
    imageSR: '102100',
    size: `${EXPORT_SIZE.width},${EXPORT_SIZE.height}`,
    format: 'jpg',
    transparent: 'false',
    f: 'image',
  });
  return `https://${host}${EXPORT_SERVICE}?${params.toString()}`;
}

export function SiteImagery({ lat, lng, label, className }: { lat: number; lng: number; label: string; className?: string }) {
  /** -1 while the single export is working, >= 0 counts tiles lost after that. */
  const [failedTiles, setFailedTiles] = useState(0);
  const [exportFailed, setExportFailed] = useState(false);

  // Composite is 3×2 tiles (768×512 px) — the same 3:2 shape as the frame. The
  // parcel sits at the composite centre: origin is half a tile left/above its
  // tile coordinate, then the sub-tile remainder shifts it under the crosshair.
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

  const tileUrl = (host: string, tx: number, ty: number) => `https://${host}/ArcGIS/rest/services/World_Imagery/MapServer/tile/${ZOOM}/${ty}/${tx}`;
  const unavailable = exportFailed && failedTiles >= tiles.length;
  const gmaps = `https://www.google.com/maps/@${lat},${lng},19z/data=!3m1!1e3`;

  /** Walks the mirror hosts, then reports the failure to the state that owns it. */
  const retryAcrossHosts = (event: React.SyntheticEvent<HTMLImageElement>, hosts: readonly string[], build: (host: string) => string, onExhausted: () => void) => {
    const img = event.currentTarget;
    const tried = Number(img.dataset.try ?? '0');
    if (tried < hosts.length - 1) {
      img.dataset.try = String(tried + 1);
      img.src = build(hosts[tried + 1]);
      return;
    }
    onExhausted();
  };

  return (
    <figure className={cn('overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]', className)}>
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        {!unavailable && !exportFailed ? (
          /* One image, exactly the frame's aspect: nothing to seam, nothing to crop. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={exportUrl(EXPORT_HOSTS[0], lat, lng)}
            alt={`Current aerial view of ${label}`}
            width={EXPORT_SIZE.width}
            height={EXPORT_SIZE.height}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) =>
              retryAcrossHosts(event, EXPORT_HOSTS, (host) => exportUrl(host, lat, lng), () => setExportFailed(true))
            }
          />
        ) : null}

        {!unavailable && exportFailed && (
          <div className="absolute inset-0" style={{ containerType: 'inline-size' }}>
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: 768, height: 512, transform: `scale(calc(100cqw / 768px)) translate(${-offsetX}px, ${-offsetY}px)` }}
            >
              {tiles.map((t) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${t.tx}-${t.ty}`}
                  src={tileUrl(TILE_HOSTS[0], t.tx, t.ty)}
                  alt=""
                  width={TILE}
                  height={TILE}
                  loading="lazy"
                  decoding="async"
                  onError={(event) =>
                    retryAcrossHosts(event, TILE_HOSTS, (host) => tileUrl(host, t.tx, t.ty), () => setFailedTiles((n) => n + 1))
                  }
                  className="absolute max-w-none"
                  // One pixel of overlap: scaled tiles otherwise round to
                  // different device pixels and show hairlines at every seam.
                  style={{ left: t.col * TILE, top: t.row * TILE, width: TILE + 1, height: TILE + 1 }}
                />
              ))}
            </div>
          </div>
        )}

        {unavailable && (
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
