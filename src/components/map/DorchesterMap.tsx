'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Clock, Navigation, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn, telHref } from '@/lib/utils';
import {
  FAIRMOUNT_LINE,
  LAYER_CONFIG,
  RED_LINE,
  getMapLocations,
  type MapLayer,
  type MapLocation,
} from '@/data/map';

import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((m) => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), { ssr: false });

export type MapStyle = 'satellite' | 'street' | 'hybrid';

const TILES: Record<MapStyle, { url: string; attribution: string }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap',
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri + CARTO labels',
  },
};

interface TransitPrediction {
  stopId: string;
  stopName: string;
  routeId: string;
  direction: string;
  minutesAway: number;
  status: string;
}

interface DorchesterMapProps {
  height?: string;
  showControls?: boolean;
  center?: [number, number];
  zoom?: number;
  preview?: boolean;
}

export function DorchesterMap({
  height = '600px',
  showControls = true,
  center = [42.298, -71.065],
  zoom = 13,
  preview = false,
}: DorchesterMapProps) {
  const [ready, setReady] = useState(false);
  const [locations, setLocations] = useState<MapLocation[]>(() => getMapLocations());
  const [active, setActive] = useState<Set<string>>(() => new Set(Object.keys(LAYER_CONFIG)));
  const [showRoutes, setShowRoutes] = useState(true);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [predictions, setPredictions] = useState<TransitPrediction[]>([]);
  const [mapStyle, setMapStyle] = useState<MapStyle>('street');

  useEffect(() => {
    setReady(true);
    try {
      const stored = localStorage.getItem('dor101-map-style') as MapStyle | null;
      if (stored && ['satellite', 'street', 'hybrid'].includes(stored)) setMapStyle(stored);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetch('/api/map')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.locations) && d.locations.length) setLocations(d.locations);
      })
      .catch(() => {
        /* keep bundled locations */
      });
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/mbta?type=predictions');
        const d = await r.json();
        setPredictions(d.predictions || []);
      } catch {
        /* swallow */
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const setStyle = (style: MapStyle) => {
    setMapStyle(style);
    try {
      localStorage.setItem('dor101-map-style', style);
    } catch {
      /* ignore */
    }
  };

  const toggle = (key: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filtered = locations.filter((l) => active.has(l.type));
  const predsFor = (name: string) =>
    predictions.filter((p) => p.stopName === name).sort((a, b) => a.minutesAway - b.minutesAway);

  if (!ready) {
    return (
      <div style={{ height }} className="bg-[var(--surface)] flex items-center justify-center border border-[var(--line)]">
        <LoadingSpinner size="lg" text="Loading map…" />
      </div>
    );
  }

  if (preview) {
    return (
      <Link href="/map" className="block group">
        <div style={{ height }} className="overflow-hidden relative">
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            attributionControl={false}
          >
            <TileLayer url={TILES.street.url} />
            <Polyline positions={RED_LINE.stops.map((s) => [s.lat, s.lng] as [number, number])} color={RED_LINE.color} weight={4} />
            <Polyline positions={FAIRMOUNT_LINE.stops.map((s) => [s.lat, s.lng] as [number, number])} color={FAIRMOUNT_LINE.color} weight={4} />
          </MapContainer>
          <div className="absolute inset-x-0 bottom-0 bg-[var(--ink)]/85 text-[var(--paper)] p-4">
            <p className="font-display text-lg">Open the full map</p>
            <p className="text-xs opacity-80">{locations.length} pins · Red Line · Fairmount</p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="relative border border-[var(--line)] overflow-hidden" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution={TILES[mapStyle].attribution} url={TILES[mapStyle].url} />
        {mapStyle === 'hybrid' && (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.85} />
        )}

        {showRoutes && (
          <>
            <Polyline
              positions={RED_LINE.stops.map((s) => [s.lat, s.lng] as [number, number])}
              pathOptions={{ color: RED_LINE.color, weight: 5, opacity: 0.95 }}
            />
            <Polyline
              positions={FAIRMOUNT_LINE.stops.map((s) => [s.lat, s.lng] as [number, number])}
              pathOptions={{ color: FAIRMOUNT_LINE.color, weight: 5, opacity: 0.95 }}
            />
            {RED_LINE.stops.map((s) => (
              <CircleMarker
                key={`rl-${s.id}`}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{ color: RED_LINE.color, weight: 3, fillColor: '#fff', fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>{s.name}</Tooltip>
              </CircleMarker>
            ))}
            {FAIRMOUNT_LINE.stops.map((s) => (
              <CircleMarker
                key={`fl-${s.id}`}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{ color: FAIRMOUNT_LINE.color, weight: 3, fillColor: '#fff', fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]}>{s.name}</Tooltip>
              </CircleMarker>
            ))}
          </>
        )}

        {filtered.map((loc) => (
          <CircleMarker
            key={loc.id}
            center={[loc.lat, loc.lng]}
            radius={8}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: LAYER_CONFIG[loc.type].color,
              fillOpacity: 0.95,
            }}
            eventHandlers={{ click: () => setSelected(loc) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>{loc.name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] w-56 bg-[var(--surface)] border border-[var(--ink)] text-sm">
          <div className="px-3 py-2 border-b border-[var(--line)]">
            <p className="kicker">Layers</p>
          </div>
          <div className="px-3 py-2 border-b border-[var(--line)] flex gap-1">
            {(['street', 'satellite', 'hybrid'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setStyle(style)}
                className={cn(
                  'flex-1 py-1 text-[11px] uppercase tracking-wide border',
                  mapStyle === style ? 'bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]' : 'border-[var(--line)]',
                )}
              >
                {style}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 px-3 py-2 border-b border-[var(--line)] cursor-pointer">
            <input type="checkbox" checked={showRoutes} onChange={(e) => setShowRoutes(e.target.checked)} />
            <span>Transit lines</span>
          </label>
          <div className="py-1">
            {(Object.entries(LAYER_CONFIG) as [MapLayer, (typeof LAYER_CONFIG)[MapLayer]][]).map(([key, cfg]) => (
              <label key={key} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[var(--paper)] transition-colors border-b border-[var(--line)] group">
                <input
                  type="checkbox"
                  checked={active.has(key)}
                  onChange={() => toggle(key)}
                  style={{ accentColor: cfg.color, width: '1.1rem', height: '1.1rem' }}
                  className="shrink-0"
                />
                <span className="w-2.5 h-2.5 rounded-none shrink-0 border border-[var(--ink)]" style={{ background: cfg.color }} />
                <span className="truncate font-body text-sm">{cfg.label}</span>
              </label>
            ))}
          </div>
          <p className="px-3 py-2 text-[11px] text-[var(--muted)] border-t border-[var(--line)]">
            {filtered.length} of {locations.length} shown
          </p>
        </div>
      )}

      {showControls && showRoutes && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-[var(--surface)] border border-[var(--ink)] px-3 py-2 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="block w-5 h-[3px]" style={{ background: RED_LINE.color }} />
            {RED_LINE.name}
          </div>
          <div className="flex items-center gap-2">
            <span className="block w-5 h-[3px]" style={{ background: FAIRMOUNT_LINE.color }} />
            {FAIRMOUNT_LINE.name}
          </div>
        </div>
      )}

      {selected && (
        <div className="absolute top-3 left-3 z-[1001] w-80 max-h-[calc(100%-1.5rem)] overflow-y-auto bg-[var(--surface)] border border-[var(--ink)]">
          <div className="px-4 py-3 border-b border-[var(--line)] flex justify-between gap-2">
            <div>
              <p className="kicker">{LAYER_CONFIG[selected.type].label}</p>
              <h3 className="font-display text-lg leading-tight">{selected.name}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="p-1" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-2 text-sm">
            {selected.address && <p>{selected.address}</p>}
            {selected.phone && (
              <a href={telHref(selected.phone)} className="underline font-mono block">{selected.phone}</a>
            )}
            {selected.hours && (
              <p className="flex gap-2 text-[var(--muted)]">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                {selected.hours}
              </p>
            )}
            {selected.description && <p className="text-[var(--ink-soft)]">{selected.description}</p>}

            {selected.type === 'transit' && (
              <div className="border border-[var(--line)]">
                <p className="px-3 py-2 text-[10px] uppercase tracking-wide text-[var(--muted)] border-b border-[var(--line)]">
                  Upcoming
                </p>
                {predsFor(selected.name).length === 0 ? (
                  <p className="px-3 py-2 text-xs text-[var(--muted)]">No live predictions right now.</p>
                ) : (
                  predsFor(selected.name).slice(0, 4).map((p, i) => (
                    <div key={`${p.stopId}-${i}`} className="px-3 py-2 flex justify-between border-t border-[var(--line)]">
                      <span>{p.direction}</span>
                      <span className="font-mono">
                        {p.minutesAway <= 1 ? 'Arriving' : `${p.minutesAway} min`}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t border-[var(--line)] flex gap-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=transit`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 text-center bg-[var(--red)] text-white py-2 text-sm font-bold"
            >
              <Navigation className="w-3.5 h-3.5 inline mr-1" />
              Directions
            </a>
            {selected.detailLink && (
              <Link href={selected.detailLink} className="flex-1 text-center border border-[var(--ink)] py-2 text-sm font-bold">
                More
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
