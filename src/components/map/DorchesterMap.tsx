'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { X, Navigation, Clock, ChevronRight, ArrowUpRight, Map, Layers } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

// Dynamic imports to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(m => m.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(m => m.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then(m => m.Tooltip), { ssr: false });

/* ─── Map Style Tile Layers ───────────────────────────────── */
export type MapStyle = 'satellite' | 'street' | 'hybrid';

const MAP_TILE_LAYERS: Record<MapStyle, { url: string; attribution: string }> = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
  },
  hybrid: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors | Hybrid: Esri World Imagery',
  },
};

/* ─── Types ──────────────────────────────────────────────── */
export interface MapLocation {
  id: string;
  name: string;
  type: keyof typeof LAYER_CONFIG;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  hours?: string;
  description?: string;
  detailLink?: string;
}

interface TransitPrediction {
  stopId: string;
  stopName: string;
  routeId: string;
  direction: string;
  minutesAway: number;
  status: string;
}

/* ─── Layer configuration ────────────────────────────────── */
const LAYER_CONFIG = {
  housing:   { color: '#1B3A6B', label: 'Housing',   desc: 'Affordable housing & organizations' },
  food:      { color: '#C8102E', label: 'Food',      desc: 'Food pantries & meal programs' },
  transit:   { color: '#80276C', label: 'Transit',    desc: 'MBTA Red Line, Fairmount, Bus' },
  health:    { color: '#1A6B3A', label: 'Health',     desc: 'Health centers & clinics' },
  legal:     { color: '#B8860B', label: 'Legal',      desc: 'Legal aid organizations' },
  community: { color: '#4A7BC4', label: 'Community',  desc: 'Community organizations' },
} as const;

/* ─── Route geometry ─────────────────────────────────────── */
const RED_LINE = {
  color: '#DA291C',
  name: 'Red Line — Ashmont Branch',
  stops: [
    { id: 'jfk',     name: 'JFK/UMass',      lat: 42.320685, lng: -71.052391, transfers: 'Commuter Rail' },
    { id: 'savin',   name: 'Savin Hill',      lat: 42.311290, lng: -71.053331, transfers: '' },
    { id: 'fields',  name: 'Fields Corner',   lat: 42.300093, lng: -71.061667, transfers: '' },
    { id: 'shawmut', name: 'Shawmut',         lat: 42.293120, lng: -71.065738, transfers: '' },
    { id: 'ashmont', name: 'Ashmont',         lat: 42.284652, lng: -71.064489, transfers: 'Mattapan Trolley' },
  ],
};

const FAIRMOUNT_LINE = {
  color: '#80276C',
  name: 'Fairmount Line',
  stops: [
    { id: 'uphams',  name: 'Uphams Corner',       lat: 42.318670, lng: -71.069330, transfers: '' },
    { id: 'fourcnr', name: 'Four Corners/Geneva',  lat: 42.305000, lng: -71.077000, transfers: '' },
    { id: 'talbot',  name: 'Talbot Avenue',        lat: 42.292900, lng: -71.078400, transfers: '' },
  ],
};

/* ─── Default resource locations ─────────────────────────── */
const LOCATIONS: MapLocation[] = [
  // Transit
  ...RED_LINE.stops.map(s => ({ id: `t-${s.id}`, name: s.name, type: 'transit' as const, lat: s.lat, lng: s.lng, description: `Red Line${s.transfers ? ' · ' + s.transfers : ''}`, detailLink: '/neighborhood' })),
  ...FAIRMOUNT_LINE.stops.map(s => ({ id: `t-${s.id}`, name: s.name, type: 'transit' as const, lat: s.lat, lng: s.lng, description: 'Fairmount Line', detailLink: '/neighborhood' })),
  // Health
  { id: 'h1', name: 'Codman Square Health Center', type: 'health', lat: 42.2876, lng: -71.0719, address: '637 Washington St', phone: '(617) 825-9660', hours: 'Mon–Fri 8 AM–8 PM, Sat 9 AM–1 PM', detailLink: '/resources' },
  { id: 'h2', name: 'DotHouse Health', type: 'health', lat: 42.2998, lng: -71.0612, address: '1353 Dorchester Ave', phone: '(617) 288-3230', hours: 'Mon–Fri 8 AM–5 PM', detailLink: '/resources' },
  { id: 'h3', name: 'Carney Hospital', type: 'health', lat: 42.2847, lng: -71.0579, address: '2100 Dorchester Ave', phone: '(617) 296-4000', hours: '24/7 Emergency', detailLink: '/resources' },
  // Food
  { id: 'f1', name: 'Codman Square Food Pantry', type: 'food', lat: 42.2880, lng: -71.0722, address: '637 Washington St', hours: 'Mon–Fri 10 AM–2 PM', detailLink: '/food' },
  { id: 'f2', name: 'Salvation Army Kroc Center', type: 'food', lat: 42.3145, lng: -71.0695, address: '650 Dudley St', hours: 'Mon–Thu 9 AM–Noon', detailLink: '/food' },
  { id: 'f3', name: "St. Mark's Community Meal", type: 'food', lat: 42.2995, lng: -71.0615, address: '1725 Dorchester Ave', hours: 'Sat 11 AM–1 PM', detailLink: '/food' },
  // Housing
  { id: 'ho1', name: 'Dorchester Bay EDC', type: 'housing', lat: 42.3167, lng: -71.0656, address: '594 Columbia Rd', phone: '(617) 825-4200', detailLink: '/resources' },
  { id: 'ho2', name: 'Codman Square NDC', type: 'housing', lat: 42.2878, lng: -71.0715, address: '587 Washington St', phone: '(617) 825-9797', detailLink: '/resources' },
  { id: 'ho3', name: 'VietAID', type: 'housing', lat: 42.2990, lng: -71.0608, address: '42 Charles St', phone: '(617) 822-3717', detailLink: '/resources' },
  // Legal
  { id: 'l1', name: 'Greater Boston Legal Services', type: 'legal', lat: 42.2880, lng: -71.0710, phone: '(617) 603-1700', hours: 'Intake Mon–Fri 9 AM–12:30 PM', detailLink: '/resources' },
  // Community
  { id: 'c1', name: 'Fields Corner Main Streets', type: 'community', lat: 42.3002, lng: -71.0618, detailLink: '/neighborhood' },
  { id: 'c2', name: 'Grove Hall Library', type: 'community', lat: 42.3045, lng: -71.0855, address: '41 Geneva Ave', hours: 'Mon–Sat 10 AM–6 PM', detailLink: '/neighborhood' },
];

/* ─── Component props ────────────────────────────────────── */
interface DorchesterMapProps {
  height?: string;
  showControls?: boolean;
  center?: [number, number];
  zoom?: number;
  preview?: boolean;
}

/* ─── Component ──────────────────────────────────────────── */
export function DorchesterMap({
  height = '600px',
  showControls = true,
  center = [42.2980, -71.0650],
  zoom = 13,
  preview = false,
}: DorchesterMapProps) {
  const { language } = useAppStore();
  const [ready, setReady] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(LAYER_CONFIG)));
  const [showRoutes, setShowRoutes] = useState(true);
  const [selected, setSelected] = useState<MapLocation | null>(null);
  const [predictions, setPredictions] = useState<TransitPrediction[]>([]);
  const [mapStyle, setMapStyle] = useState<MapStyle>('satellite');
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  // Load map style from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dor101-map-style') as MapStyle;
    if (stored && ['satellite', 'street', 'hybrid'].includes(stored)) {
      setMapStyle(stored);
    }
  }, []);

  // Save map style to localStorage when changed
  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
    localStorage.setItem('dor101-map-style', style);
    setShowStyleMenu(false);
  };

  useEffect(() => { setReady(true); }, []);

  // Fetch MBTA predictions every 30 seconds
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const r = await fetch('/api/mbta?type=predictions');
        const d = await r.json();
        setPredictions(d.predictions || []);
      } catch { /* swallow */ }
    };
    fetchPredictions();
    const id = setInterval(fetchPredictions, 30_000);
    return () => clearInterval(id);
  }, []);

  const toggleFilter = (key: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = LOCATIONS.filter(l => activeFilters.has(l.type));

  const predsForStop = (name: string) =>
    predictions.filter(p => p.stopName === name).sort((a, b) => a.minutesAway - b.minutesAway);

  if (!ready) {
    return (
      <div style={{ height }} className="bg-[var(--color-bg-tertiary)] rounded-xl flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading map…" />
      </div>
    );
  }

  /* ── Preview mode (dashboard) ──────────────────────────── */
  if (preview) {
    return (
      <Link href="/map" className="block group">
        <div style={{ height }} className="rounded-xl overflow-hidden relative">
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} attributionControl={false}>
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
            <Polyline positions={RED_LINE.stops.map(s => [s.lat, s.lng] as [number, number])} color={RED_LINE.color} weight={4} opacity={0.85} />
            <Polyline positions={FAIRMOUNT_LINE.stops.map(s => [s.lat, s.lng] as [number, number])} color={FAIRMOUNT_LINE.color} weight={4} opacity={0.85} />
          </MapContainer>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6 group-hover:from-black/80 transition-all duration-300">
            <div className="text-white w-full">
              <p className="font-heading font-bold text-lg mb-1">Click to explore full interactive map</p>
              <p className="text-sm text-white/70">{LOCATIONS.length} resources · Satellite view · Real-time transit</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Full map ──────────────────────────────────────────── */
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height }}>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        {/* Base map tiles - changes based on user preference */}
        <TileLayer
          attribution={MAP_TILE_LAYERS[mapStyle].attribution}
          url={MAP_TILE_LAYERS[mapStyle].url}
        />
        {/* Labels overlay for hybrid mode */}
        {mapStyle === 'hybrid' && (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.8}
          />
        )}

        {/* ── Route lines ──────────────────────────────── */}
        {showRoutes && (
          <>
            <Polyline
              positions={RED_LINE.stops.map(s => [s.lat, s.lng] as [number, number])}
              pathOptions={{ color: RED_LINE.color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
            />
            <Polyline
              positions={FAIRMOUNT_LINE.stops.map(s => [s.lat, s.lng] as [number, number])}
              pathOptions={{ color: FAIRMOUNT_LINE.color, weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
            />

            {/* Route stop dots */}
            {RED_LINE.stops.map(s => (
              <CircleMarker
                key={`rl-${s.id}`}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{ color: RED_LINE.color, weight: 3, fillColor: '#FFFFFF', fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]} className="map-tooltip">
                  <span className="font-heading font-semibold text-xs">{s.name}</span>
                </Tooltip>
              </CircleMarker>
            ))}
            {FAIRMOUNT_LINE.stops.map(s => (
              <CircleMarker
                key={`fl-${s.id}`}
                center={[s.lat, s.lng]}
                radius={7}
                pathOptions={{ color: FAIRMOUNT_LINE.color, weight: 3, fillColor: '#FFFFFF', fillOpacity: 1 }}
              >
                <Tooltip direction="top" offset={[0, -10]} className="map-tooltip">
                  <span className="font-heading font-semibold text-xs">{s.name}</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </>
        )}

        {/* ── Resource markers ─────────────────────────── */}
        {filtered.map(loc => (
          <CircleMarker
            key={loc.id}
            center={[loc.lat, loc.lng]}
            radius={8}
            pathOptions={{
              color: '#FFFFFF',
              weight: 2,
              fillColor: LAYER_CONFIG[loc.type].color,
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => setSelected(loc) }}
          >
            <Tooltip direction="top" offset={[0, -10]} className="map-tooltip">
              <span className="font-heading font-semibold text-xs">{loc.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* ── Layer control panel ────────────────────────── */}
      {showControls && (
        <div
          className={cn(
            'absolute top-4 right-4 z-[1000] w-56',
            'rounded-xl overflow-hidden',
            'border border-white/20',
            'bg-[var(--color-bg-primary)]/85 dark:bg-[#111110]/85',
            'backdrop-blur-xl shadow-2xl'
          )}
        >
          {/* Panel heading */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <h4 className="font-heading font-semibold text-xs tracking-wider uppercase text-[var(--color-text-primary)]">
              Map Layers
            </h4>
          </div>

          {/* Map Style Selector */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <label className="block text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
              Map Style
            </label>
            <div className="flex gap-1">
              {(['satellite', 'street', 'hybrid'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => handleMapStyleChange(style)}
                  className={cn(
                    'flex-1 px-2 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors',
                    mapStyle === style
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
                  )}
                >
                  {style === 'satellite' ? '🛰️' : style === 'street' ? '🗺️' : '🧭'}
                </button>
              ))}
            </div>
          </div>

          {/* Route toggle */}
          <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[var(--color-bg-secondary)]/60 transition-colors border-b border-[var(--color-border)]">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={e => setShowRoutes(e.target.checked)}
              className="w-3.5 h-3.5 rounded accent-[#DA291C]"
            />
            <div className="flex items-center gap-2 flex-1">
              <div className="flex gap-0.5">
                <span className="block w-3 h-1 rounded-full" style={{ background: RED_LINE.color }} />
                <span className="block w-3 h-1 rounded-full" style={{ background: FAIRMOUNT_LINE.color }} />
              </div>
              <span className="text-xs font-heading font-medium text-[var(--color-text-primary)]">
                Transit Routes
              </span>
            </div>
          </label>

          {/* Layer toggles */}
          <div className="py-1">
            {(Object.entries(LAYER_CONFIG) as [keyof typeof LAYER_CONFIG, typeof LAYER_CONFIG[keyof typeof LAYER_CONFIG]][]).map(([key, cfg]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-[var(--color-bg-secondary)]/60 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={activeFilters.has(key)}
                  onChange={() => toggleFilter(key)}
                  className="w-3.5 h-3.5 rounded"
                  style={{ accentColor: cfg.color }}
                />
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cfg.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-heading font-medium text-[var(--color-text-primary)]">
                    {cfg.label}
                  </span>
                  <span className="block text-[10px] leading-tight text-[var(--color-text-muted)]">
                    {cfg.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/40">
            <p className="text-[10px] text-[var(--color-text-muted)] font-heading">
              {filtered.length} of {LOCATIONS.length} locations shown
            </p>
          </div>
        </div>
      )}

      {/* ── Route legend (bottom-left) ─────────────────── */}
      {showControls && showRoutes && (
        <div
          className={cn(
            'absolute bottom-4 left-4 z-[1000]',
            'bg-[var(--color-bg-primary)]/85 dark:bg-[#111110]/85',
            'backdrop-blur-xl rounded-lg shadow-lg',
            'border border-white/20',
            'px-4 py-3'
          )}
        >
          <p className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Transit Lines
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="block w-5 h-[3px] rounded-full" style={{ background: RED_LINE.color }} />
              <span className="text-xs font-heading text-[var(--color-text-primary)]">Red Line — Ashmont Branch</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="block w-5 h-[3px] rounded-full" style={{ background: FAIRMOUNT_LINE.color }} />
              <span className="text-xs font-heading text-[var(--color-text-primary)]">Fairmount Commuter Rail</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Selected location detail panel ─────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-4 left-4 z-[1001] w-80',
              'bg-[var(--color-bg-primary)] dark:bg-[#1C1C1A]',
              'border border-[var(--color-border)]',
              'rounded-xl shadow-2xl overflow-hidden',
              'max-h-[calc(100%-2rem)]'
            )}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: LAYER_CONFIG[selected.type].color }}
                  />
                  <span className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {LAYER_CONFIG[selected.type].label}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base leading-tight text-[var(--color-text-primary)]">
                  {selected.name}
                </h3>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3 overflow-y-auto max-h-[350px]">
              {selected.address && (
                <div className="text-sm text-[var(--color-text-secondary)]">{selected.address}</div>
              )}
              {selected.phone && (
                <a
                  href={`tel:${selected.phone.replace(/\D/g, '')}`}
                  className="text-sm text-[var(--color-accent-primary)] hover:underline font-mono block"
                >
                  {selected.phone}
                </a>
              )}
              {selected.hours && (
                <div className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{selected.hours}</span>
                </div>
              )}
              {selected.description && (
                <p className="text-sm text-[var(--color-text-secondary)]">{selected.description}</p>
              )}

              {/* ── MBTA Predictions (transit stops only) ── */}
              {selected.type === 'transit' && (() => {
                const stopPreds = predsForStop(selected.name);
                return stopPreds.length > 0 ? (
                  <div className="mt-1 bg-[var(--color-bg-secondary)] rounded-lg overflow-hidden">
                    <div className="px-3 py-2 border-b border-[var(--color-border)]">
                      <p className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        Upcoming Departures
                      </p>
                    </div>
                    <div className="divide-y divide-[var(--color-border)]">
                      {stopPreds.slice(0, 4).map((p, i) => (
                        <div key={i} className="px-3 py-2.5 flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-heading font-semibold text-[var(--color-text-primary)] block">
                              {p.direction}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-muted)]">
                              {p.routeId === 'Red' ? 'Red Line' : 'Fairmount Line'}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {p.minutesAway <= 1 ? (
                              <span className="text-xs font-mono font-bold text-[var(--color-accent-secondary)]">
                                Arriving
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-bold text-[var(--color-text-primary)]">
                                {p.minutesAway} min
                              </span>
                            )}
                            <span className={cn(
                              'block text-[10px]',
                              p.status === 'on_time' ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-secondary)]'
                            )}>
                              {p.status === 'on_time' ? 'On time' : 'Delayed'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 border-t border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/50">
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        Live data · Updates every 30 s · Source: MBTA
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                    <p className="text-xs text-[var(--color-text-muted)]">Loading predictions…</p>
                  </div>
                );
              })()}
            </div>

            {/* Footer actions */}
            <div className="px-5 py-3 border-t border-[var(--color-border)] flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=transit`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-heading font-medium',
                  'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-primary)]/90 transition-colors'
                )}
              >
                <Navigation className="w-4 h-4" />
                Directions
              </a>
              {selected.detailLink && (
                <Link
                  href={selected.detailLink}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-heading font-medium',
                    'bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] transition-colors'
                  )}
                >
                  More Info
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
