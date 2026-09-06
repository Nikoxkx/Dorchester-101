'use client';

import { useRef, useState } from 'react';
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
 *
 * Like the full map, the preview walks a small list of public tile providers so
 * a single blocked host cannot leave the card blank.
 */
const PREVIEW_PROVIDERS = [
  {
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
  },
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
  },
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
];

export function MapPreview({ height = '15rem' }: { height?: string }) {
  const [providerIndex, setProviderIndex] = useState(0);
  const errors = useRef(0);
  const advanced = useRef(false);
  const provider = PREVIEW_PROVIDERS[Math.min(providerIndex, PREVIEW_PROVIDERS.length - 1)];

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
          key={provider.url}
          url={provider.url}
          attribution={provider.attribution}
          eventHandlers={{
            tileerror: () => {
              errors.current += 1;
              if (advanced.current || errors.current < 3) return;
              advanced.current = true;
              errors.current = 0;
              setProviderIndex((current) => {
                const next = Math.min(current + 1, PREVIEW_PROVIDERS.length - 1);
                if (next === current) return current;
                advanced.current = false;
                return next;
              });
            },
          }}
        />
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>
    </div>
  );
}
