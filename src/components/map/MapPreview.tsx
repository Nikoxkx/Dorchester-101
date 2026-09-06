'use client';

import { AttributionControl, MapContainer, Polyline, TileLayer } from 'react-leaflet';
import { Fragment } from 'react';
import 'leaflet/dist/leaflet.css';
import { TRANSIT_LINES } from '@/data/transit';

/**
 * The map as a card preview: real tiles, real geometry, no controls.
 *
 * It is deliberately not a screenshot and not a second copy of the interactive
 * map. Dragging, zooming and popups are switched off so a preview inside a card
 * cannot trap a scroll gesture, and the attribution stays visible because the
 * tile providers require it even at this size.
 */
export function MapPreview({ height = '15rem' }: { height?: string }) {
  return (
    <div style={{ height }} className="relative w-full overflow-hidden">
      <MapContainer
        center={[42.3065, -71.064]}
        zoom={13}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        boxZoom={false}
        touchZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
        style={{ background: '#EDE8DE' }}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery &copy; Esri, Maxar, Earthstar Geographics"
        />
        {TRANSIT_LINES.filter((line) => line.fallbackPath).map((line) => (
          <Fragment key={line.id}>
            <Polyline
              positions={line.fallbackPath!}
              pathOptions={{ color: '#FFFFFF', opacity: 0.8, weight: 6 }}
            />
            <Polyline
              positions={line.fallbackPath!}
              pathOptions={{ color: `#${line.color.replace('#', '')}`, opacity: 0.95, weight: 3 }}
            />
          </Fragment>
        ))}
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>
    </div>
  );
}
