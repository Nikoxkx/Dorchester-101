/**
 * "Get the app" affordances belong on the website, not inside the desktop app.
 *
 * The Electron shell serves this same site from a local server, and
 * electron/preload.js puts a `window.electron` bridge on the page — so the
 * components can tell where they run. These tests render the real components
 * both ways: with the bridge (desktop app, everything download-related must
 * disappear) and without it (website, the card and the install banner's .exe
 * link must stay). The route test pins the offline fallback to the version
 * the tree builds, so the site can never advertise a stale release again.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';

import { DownloadAppCard } from '@/components/pwa/DownloadAppCard';
import { PWAInstaller } from '@/components/pwa/PWAInstaller';
import { GET } from '@/app/api/download/route';
import { globalCache } from '@/lib/cache';
import { APP_VERSION } from '@/lib/site';

const DOWNLOAD_PAYLOAD = {
  tag: 'v9.9.9',
  name: 'DOR101 v9.9.9',
  publishedAt: '2026-01-01T00:00:00Z',
  pageUrl: 'https://github.com/Nikoxkx/Dorchester-101/releases/tag/v9.9.9',
  installer: { name: 'DOR101 Setup 9.9.9.exe', url: 'https://example.com/installer.exe', sizeBytes: 1000 },
  portable: { name: 'DOR101-Portable-9.9.9.exe', url: 'https://example.com/portable.exe', sizeBytes: 1000 },
  fallback: false,
};

function stubFetch(fetchImpl: (url: string) => Response): ReturnType<typeof vi.fn> {
  const spy = vi.fn(async (input: RequestInfo | URL) => fetchImpl(String(input)));
  vi.stubGlobal('fetch', spy);
  return spy;
}

beforeEach(() => {
  globalCache.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (window as { electron?: unknown }).electron;
});

describe('DownloadAppCard', () => {
  it('shows the download card on the website', async () => {
    stubFetch((url) =>
      url.includes('/api/download')
        ? new Response(JSON.stringify(DOWNLOAD_PAYLOAD), { status: 200, headers: { 'content-type': 'application/json' } })
        : new Response('', { status: 502 })
    );

    render(<DownloadAppCard />);

    expect(await screen.findByText('Get the Windows app')).toBeTruthy();
    await screen.findByText('Installer');
    await screen.findByText('Portable');
  });

  it('renders nothing and never queries the release API inside the desktop app', async () => {
    (window as { electron?: unknown }).electron = {};
    const spy = stubFetch(() => new Response(JSON.stringify(DOWNLOAD_PAYLOAD), { status: 200 }));

    const { container } = render(<DownloadAppCard />);

    await waitFor(() => expect(container.firstChild).toBeNull());
    expect(spy.mock.calls.filter(([url]) => String(url).includes('/api/download'))).toHaveLength(0);
  });
});

describe('PWAInstaller banner', () => {
  it('offers the .exe download on the website when the install prompt fires', () => {
    render(<PWAInstaller />);

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    expect(screen.getByText('Install DOR101 on your computer')).toBeTruthy();
    const exeLink = screen.getByText('Windows app (.exe)').closest('a');
    expect(exeLink?.getAttribute('href')).toBe('/api/download?get=installer');
  });

  it('stays hidden inside the desktop app even if the install prompt fires', () => {
    (window as { electron?: unknown }).electron = {};
    const { container } = render(<PWAInstaller />);

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });

    expect(container.textContent).not.toContain('Windows app (.exe)');
    expect(container.textContent).not.toContain('Install DOR101 on your computer');
  });
});

describe('/api/download offline fallback', () => {
  it('falls back to the version this tree builds when GitHub is unreachable', async () => {
    stubFetch(() => new Response('', { status: 502 }));

    const res = await GET(new Request('http://localhost/api/download'));
    const info = await res.json();

    expect(info.fallback).toBe(true);
    expect(info.tag).toBe(`v${APP_VERSION}`);
    expect(info.installer.name).toBe(`DOR101 Setup ${APP_VERSION}.exe`);
    expect(info.portable.name).toBe(`DOR101-Portable-${APP_VERSION}.exe`);
  });
});
