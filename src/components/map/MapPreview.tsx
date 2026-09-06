'use client';

import { AttributionControl, MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * The map as a card preview: real tiles, no symbols, no controls.
 *
 * Deliberately just imagery. Route lines and markers are SVG overlays in a
 * Leaflet pane that ignores the card's overflow clipping while the page scrolls,
 * so on the dashboard they used to bleed over neighbouring content; the full,
 * interactive map is one tap away and draws them properly. Dragging, zooming and
 * popups are off so the preview cannot trap a scroll gesture.
 */
export function MapPreview({ height = '15rem' }: { height?: string }) {
  return (
    <div style={{ height }} className="dor101-map-preview relative isolate w-full overflow-hidden">
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
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>
    </div>
  );
}
