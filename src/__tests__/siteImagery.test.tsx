/**
 * The aerial-view figure on the housing projects page.
 *
 * The complaint this guards against is a picture that does not fill its frame:
 * a stitched 3×2 tile grid leaves a hole wherever one tile fails, hairlines
 * wherever two tiles round to different device pixels, and nothing at all on a
 * browser without container-query units. The fix is a single Esri export at the
 * frame's own size and aspect, so the test checks the request that produces it
 * and that the image is laid over the box rather than positioned inside it.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SiteImagery } from '@/components/projects/SiteImagery';

const LAT = 42.304;
const LNG = -71.0625;

/** Half the Web Mercator world, in metres — the projection Esri exports in. */
const MERCATOR_EXTENT = 20037508.342789244;
const mercatorY = (lat: number) => (Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)) * (MERCATOR_EXTENT / 180);

function exportSrc(): string {
  const img = screen.getByAltText(/Current aerial view of/) as HTMLImageElement;
  return img.src;
}

beforeEach(() => {
  // jsdom loads no images; onError is driven by hand below.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SiteImagery', () => {
  it('asks Esri for one image, sized and shaped like the frame', () => {
    render(<SiteImagery lat={LAT} lng={LNG} label="1234 Washington St" />);
    const url = new URL(exportSrc());

    expect(url.hostname).toBe('services.arcgisonline.com');
    expect(url.pathname).toContain('/World_Imagery/MapServer/export');
    // 3:2 out, 3:2 in — an image the same shape as its box has nothing to crop.
    expect(url.searchParams.get('size')).toBe('1200,800');
    expect(url.searchParams.get('f')).toBe('image');
    expect(url.searchParams.get('format')).toBe('jpg');

    // Three decimal places of a metre is the precision the URL carries.
    const [xmin, ymin, xmax, ymax] = (url.searchParams.get('bbox') ?? '').split(',').map(Number);
    expect(xmax - xmin).toBeCloseTo(260, 2);
    expect(ymax - ymin).toBeCloseTo((260 * 2) / 3, 2);
    expect((xmax - xmin) / (ymax - ymin)).toBeCloseTo(1.5, 4);

    // The parcel is centred in that box, in Web Mercator metres.
    const x = (LNG * MERCATOR_EXTENT) / 180;
    const y = mercatorY(LAT);
    expect((xmin + xmax) / 2).toBeCloseTo(x, 1);
    expect((ymin + ymax) / 2).toBeCloseTo(y, 1);
    // 260 m across is the same footprint the tile grid covered at zoom 18.
    expect(xmax - xmin).toBeLessThan(400);

    // Both axes in the same projection, or the picture comes back squashed.
    expect(url.searchParams.get('bboxSR')).toBe('102100');
    expect(url.searchParams.get('imageSR')).toBe('102100');
  });

  it('lays the image over the whole box instead of positioning it inside', () => {
    render(<SiteImagery lat={LAT} lng={LNG} label="1234 Washington St" />);
    const img = screen.getByAltText(/Current aerial view of/) as HTMLImageElement;
    for (const cls of ['absolute', 'inset-0', 'h-full', 'w-full', 'object-cover']) expect(img.className).toContain(cls);
  });

  it('tries the mirror host, then the tile grid, before admitting defeat', () => {
    const { container } = render(<SiteImagery lat={LAT} lng={LNG} label="1234 Washington St" />);
    const img = screen.getByAltText(/Current aerial view of/) as HTMLImageElement;
    expect(img.src).toContain('services.arcgisonline.com');

    fireEvent.error(img);
    expect(img.src).toContain('server.arcgisonline.com');
    // Still one picture, still filling the frame — no hole, no seam.
    expect(screen.queryByText(/could not be loaded/)).toBeNull();

    // Both export hosts down: fall back to the stitched tile grid, which is
    // better than nothing, with a pixel of overlap so the seams do not show.
    fireEvent.error(img);
    expect(screen.queryByAltText(/Current aerial view of/)).toBeNull();
    const tiles = Array.from(container.querySelectorAll<HTMLImageElement>('img[src*="MapServer/tile"]'));
    expect(tiles).toHaveLength(6);
    for (const tile of tiles) expect(tile.style.width).toBe('257px');

    // And only when every tile has failed on both hosts does the figure say so.
    for (const tile of tiles) {
      fireEvent.error(tile); // first host
      expect(tile.src).toContain('services.arcgisonline.com'); // ...so it retried on the mirror
      fireEvent.error(tile); // mirror host too
    }
    expect(screen.getByText(/could not be loaded/)).toBeTruthy();
    expect(screen.getByText(new RegExp(`${LAT.toFixed(5)}, ${LNG.toFixed(5)}`))).toBeTruthy();
  });

  it('keeps the attribution and a link to the parcel', () => {
    render(<SiteImagery lat={LAT} lng={LNG} label="1234 Washington St" />);
    expect(screen.getByText(/Imagery © Esri, Maxar, Earthstar Geographics/)).toBeTruthy();
    const link = screen.getByRole('link', { name: /Open in Google Maps/ }) as HTMLAnchorElement;
    expect(link.href).toContain(`${LAT},${LNG}`);
  });
});
