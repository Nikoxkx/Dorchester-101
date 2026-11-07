import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { QRPoster } from '@/components/resources/QRPoster';
import { resourceUrl } from '@/lib/site';
import { useAppStore } from '@/stores/appStore';

beforeEach(() => {
  useAppStore.getState().setLanguage('en');
});

describe('resource QR posters', () => {
  it('builds canonical deep links with an encoded stable resource id', () => {
    const url = new URL(resourceUrl('community food & help'));
    expect(url.origin).toBe('https://dorchester-101.vercel.app');
    expect(url.pathname).toBe('/resources');
    expect(url.searchParams.get('place')).toBe('community food & help');
  });

  it('renders a local, printable QR and a human-readable fallback link', () => {
    render(<QRPoster id="fair-foods-lena-park" name="Fair Foods" address="150 American Legion Highway" phone="617-555-0100" summary="Food assistance." />);
    fireEvent.click(screen.getByRole('button', { name: 'QR poster' }));

    const dialog = screen.getByRole('dialog', { name: 'Printable QR poster for Fair Foods' });
    const code = screen.getByTestId('qr-poster-code');
    expect(code.tagName.toLowerCase()).toBe('svg');
    expect(code.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(dialog.querySelector('img[src*="qrserver.com"]')).toBeNull();
    const destination = resourceUrl('fair-foods-lena-park');
    const readableLink = screen.getByRole('link', { name: 'dorchester-101.vercel.app/resources?place=fair-foods-lena-park' });
    expect(readableLink.getAttribute('href')).toBe(destination);
    expect(screen.getByText('150 American Legion Highway')).toBeTruthy();
    expect(document.body.classList.contains('qr-poster-printing')).toBe(true);
  });
});
