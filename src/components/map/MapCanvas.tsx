'use client';

import { Fragment, useEffect, useMemo } from 'react';
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

const BASE_LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Imagery &copy; <a href="https://www.esri.com/legal/software-license" target="_blank" rel="noreferrer noopener">Esri</a>, Maxar, Earthstar Geographics',
  },
  street: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">OpenStreetMap</a> contributors',
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Imagery &copy; Esri, Maxar, Earthstar Geographics; labels &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer noopener">OpenStreetMap</a>',
  },
} as const;

export type MapStyle = keyof typeof BASE_LAYERS;

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
      <TileLayer
        key={`${style}-base`}
        url={layers.url}
        attribution={layers.attribution}
        maxZoom={19}
        updateWhenIdle={style === 'satellite'}
      />
      {style === 'hybrid' && (
        <TileLayer key="hybrid-labels" url={BASE_LAYERS.street.url} opacity={0.6} maxZoom={19} />
      )}
      <AttributionControl position="bottomleft" prefix={false} />

      {shapes.flatMap((shape) => {
        const color = ROUTE_HEX[shape.routeId] ?? '#7A6B5D';
        return shape.paths.map((path, index) => (
          <Fragment key={`${shape.routeId}-${index}`}>
            <Polyline
              positions={path}
              pathOptions={{ color: '#FFFFFF', opacity: 0.92, weight: 9, lineCap: 'round' }}
            />
            <Polyline
              positions={path}
              pathOptions={{
                color,
                opacity: 0.98,
                weight: 4.5,
                lineCap: 'round',
                className: shape.source === 'mbta-live' ? 'route-flow' : undefined,
              }}
              eventHandlers={{ click: () => onSelectStop(`route:${shape.routeId}`) }}
            />
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
