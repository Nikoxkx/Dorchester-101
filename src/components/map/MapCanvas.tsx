'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  AttributionControl,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resourcePinIcon, routeShieldIcon, stationDotIcon, userLocationIcon } from './icons';
import { cn } from '@/lib/utils';
import type { ResourceCategory } from '@/data/resources';
import type { ShieldMode } from './icons';

/**
 * The Leaflet surface.
 *
 * Everything drawn here is data the container fetched; this file decides only how
 * it is painted. Four details are load-bearing:
 *  - `scrollWheelZoom` is off, so a visitor whose finger lands on the map while
 *    scrolling the page does not lose their place; zoom lives in the toolbar and
 *    on the keyboard (arrows, +/-), which Leaflet enables by default.
 *  - `maxBounds` keeps a lost rider one tap from home rather than off the coast.
 *  - Route colours are literal hex, not CSS custom properties: Leaflet writes
 *    them into SVG presentation attributes, where `var()` is not supported, so a
 *    token reference would silently paint nothing.
 *  - Geometry renders as SVG rather than canvas so the "live" dash animation on a
 *    route with a running feed has an element to animate.
 */

export interface ShapeData {
  routeId: string;
  paths: Array<Array<[number, number]>>;
  source: 'mbta-live' | 'timetable' | 'offline-cache';
}

export interface MapStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string;
  mode: ShieldMode;
  label: string;
  interchange?: boolean;
  accessible?: boolean;
}

export interface MapPin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: ResourceCategory;
  openNow?: boolean;
  subtitle: string;
}

const DORCHESTER_BOUNDS: [[number, number], [number, number]] = [
  [42.262, -71.118],
  [42.343, -71.02],
];

/**
 * Basemaps, newest provider first. Each style lists several endpoints so that a
 * single tile host going down (or being blocked on a network) degrades to
 * another real map instead of a blank rectangle. All three are public tile
 * services; the attribution below each URL is the one shown while it is active.
 */
const OSM_STREET = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">OpenStreetMap</a> contributors',
};
const ESRI_IMAGERY_SERVICES = {
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Imagery &copy; <a href="https://www.esri.com/legal/software-license" target="_blank" rel="noreferrer noopener">Esri</a>, Maxar, Earthstar Geographics',
};
const ESRI_IMAGERY_SERVER = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Imagery &copy; <a href="https://www.esri.com/legal/software-license" target="_blank" rel="noreferrer noopener">Esri</a>, Maxar, Earthstar Geographics',
};
const ESRI_STREET = {
  url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Street map &copy; <a href="https://www.esri.com/legal/software-license" target="_blank" rel="noreferrer noopener">Esri</a>, HERE, Garmin, &copy; OpenStreetMap contributors',
};

export type MapStyle = 'street' | 'satellite' | 'hybrid';

const BASE_LAYERS: Record<MapStyle, Array<{ url: string; attribution: string }>> = {
  satellite: [ESRI_IMAGERY_SERVICES, ESRI_IMAGERY_SERVER, OSM_STREET],
  street: [OSM_STREET, ESRI_STREET],
  hybrid: [ESRI_IMAGERY_SERVICES, ESRI_IMAGERY_SERVER, OSM_STREET],
};

export const ROUTE_HEX: Record<string, string> = {
  Red: '#DA291C',
  Mattapan: '#2F9A3F',
  'CR-Fairmount': '#80276C',
};

export function MapCanvas({
  style,
  shapes,
  stops,
  pins,
  selectedStopId,
  selectedPinId,
  userPosition,
  focusRequest,
  onSelectStop,
  onSelectPin,
  onMapReady,
  onBlankClick,
}: {
  style: MapStyle;
  shapes: ShapeData[];
  stops: MapStop[];
  pins: MapPin[];
  selectedStopId: string | null;
  selectedPinId: string | null;
  userPosition: [number, number] | null;
  focusRequest: { lat: number; lng: number; zoom?: number; token: number } | null;
  onSelectStop: (id: string) => void;
  onSelectPin: (id: string) => void;
  onMapReady: (map: LeafletMap) => void;
  onBlankClick: () => void;
}) {
  const layers = BASE_LAYERS[style];

  return (
    <MapContainer
      center={[42.3065, -71.064]}
      zoom={14}
      minZoom={12}
      maxZoom={18}
      maxBounds={DORCHESTER_BOUNDS}
      maxBoundsViscosity={0.65}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ background: '#EDE8DE' }}
    >
      <Bridge
        onReady={onMapReady}
        focusRequest={focusRequest}
        onBlankClick={onBlankClick}
      />
      <ResilientTileLayer providers={layers} maxZoom={19} updateWhenIdle={style === 'satellite'} />
      {style === 'hybrid' && (
        <ResilientTileLayer key="hybrid-labels" providers={[OSM_STREET]} maxZoom={19} opacity={0.6} />
      )}
      <AttributionControl position="bottomleft" prefix={false} />

      {shapes.flatMap((shape) => {
        const color = ROUTE_HEX[shape.routeId] ?? '#7A6B5D';
        return shape.paths.map((path, index) => (
          <Fragment key={`${shape.routeId}-${index}`}>
            <Polyline positions={path} pathOptions={{ color: '#1B2430', opacity: 0.55, weight: 11, lineCap: 'round', className: 'route-casing' }} interactive={false} />
            <Polyline positions={path} pathOptions={{ color: '#FFFFFF', opacity: 0.95, weight: 8.5, lineCap: 'round', className: 'route-casing' }} interactive={false} />
            <Polyline
              positions={path}
              pathOptions={{ color, opacity: 1, weight: 5.5, lineCap: 'round', className: cn('route-core', shape.source !== 'mbta-live' && 'route-timetable') }}
              eventHandlers={{ click: () => onSelectStop(`route:${shape.routeId}`) }}
            />
            <Polyline positions={path} pathOptions={{ color: '#FFFFFF', opacity: 0.35, weight: 1.5, lineCap: 'round', className: 'route-highlight' }} interactive={false} />
            {shape.source === 'mbta-live' && (
              <Polyline positions={path} pathOptions={{ color: '#FFFFFF', opacity: 0.85, weight: 3, className: 'route-flow' }} interactive={false} />
            )}
          </Fragment>
        ));
      })}

      {stops.map((stop) => {
        const selected = stop.id === selectedStopId;
        return (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={
              stop.interchange
                ? routeShieldIcon(stop.label, stop.mode, stop.color, { selected })
                : stationDotIcon(stop.color, { selected, accessible: stop.accessible })
            }
            alt={`Station ${stop.name}`}
            zIndexOffset={selected ? 500 : 0}
            eventHandlers={{ click: () => onSelectStop(stop.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="map-tooltip">
              <span className="font-heading text-xs font-semibold">{stop.name}</span>
            </Tooltip>
          </Marker>
        );
      })}

      {pins.map((pin) => {
        const selected = pin.id === selectedPinId;
        return (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={resourcePinIcon(pin.category, { selected, openNow: pin.openNow })}
            alt={pin.name}
            zIndexOffset={selected ? 700 : 100}
            eventHandlers={{ click: () => onSelectPin(pin.id) }}
          >
            <Tooltip direction="top" offset={[0, -30]} opacity={1} className="map-tooltip">
              <span className="block font-heading text-xs font-semibold">{pin.name}</span>
              <span className="block text-[10px] text-stone-600">{pin.subtitle}</span>
            </Tooltip>
          </Marker>
        );
      })}

      {userPosition && (
        <Marker position={userPosition} icon={userLocationIcon()} alt="Your location" interactive={false} />
      )}
    </MapContainer>
  );
}

/**
 * Tile layer that walks through a list of providers when tiles fail to load.
 *
 * A provider can be unreachable for many reasons (blocked host, geography,
 * maintenance). Blindly retrying the same URL shows the user a blank map; trying
 * the next public basemap keeps the map a map. Attribution switches with it.
 */
function ResilientTileLayer({
  providers,
  maxZoom,
  opacity,
  updateWhenIdle,
}: {
  providers: Array<{ url: string; attribution: string }>;
  maxZoom?: number;
  opacity?: number;
  updateWhenIdle?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const errors = useRef(0);
  const advanced = useRef(false);

  if (index >= providers.length) return null;
  const provider = providers[index];

  return (
    <TileLayer
      key={`${index}-${provider.url}`}
      url={provider.url}
      attribution={provider.attribution}
      maxZoom={maxZoom}
      opacity={opacity}
      updateWhenIdle={updateWhenIdle}
      eventHandlers={{
        tileerror: () => {
          errors.current += 1;
          if (advanced.current || errors.current < 3) return;
          advanced.current = true;
          errors.current = 0;
          setIndex((current) => {
            const next = Math.min(current + 1, providers.length - 1);
            if (next === current) return current;
            // Reset the guard so the next provider gets its own three errors.
            advanced.current = false;
            return next;
          });
        },
      }}
    />
  );
}

/** Puts the map instance in the parent's hands and drives camera changes. */
function Bridge({
  onReady,
  focusRequest,
  onBlankClick,
}: {
  onReady: (map: LeafletMap) => void;
  focusRequest: { lat: number; lng: number; zoom?: number; token: number } | null;
  onBlankClick: () => void;
}) {
  const map = useMap();
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    onReady(map);
  }, [map, onReady]);

  useEffect(() => {
    if (!focusRequest) return;
    // A camera move gives the eye a continuous path, which is what makes a jumping
    // map legible; with reduce-motion on it must arrive rather than travel.
    map.flyTo([focusRequest.lat, focusRequest.lng], focusRequest.zoom ?? Math.max(map.getZoom(), 16), {
      duration: reduced ? 0 : 0.75,
      easeLinearity: 0.3,
    });
  }, [focusRequest, map, reduced]);

  useMapEvents({
    // A tap on empty map closes the detail card; without it the panel feels stuck
    // to the screen on a phone.
    click: (event) => {
      if (!('originalEvent' in event) || !(event as { propagating?: boolean }).propagating) onBlankClick();
    },
  });

  return null;
}
