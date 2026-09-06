import { NextResponse } from 'next/server';
import { globalCache, CACHE_TTL } from '@/lib/cache';
import { REPO_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

/**
 * Desktop-app downloads, resolved server-side.
 *
 * The site's CSP allows `connect-src 'self'` only, so the browser never talks to
 * api.github.com directly — this route does, once every five minutes, and hands
 * the client a same-origin answer. The download itself is a plain navigation to
 * the release asset on github.com (which CSP does not restrict), so the bytes
 * come straight from GitHub's CDN and the site never proxies a 180 MB exe.
 *
 * When GitHub cannot be reached (offline preview, outage) the route answers
 * from the pinned release below — real, published asset URLs — so the button
 * still works and the payload says `fallback: true` honestly.
 */

const GITHUB_LATEST = 'https://api.github.com/repos/Nikoxkx/Dorchester-101/releases/latest';

/** Last release that actually carries Windows assets (verified 2026-09-06). */
const PINNED_RELEASE = {
  tag: 'v1.2.0',
  name: 'DOR101 v1.2.0',
  publishedAt: '2026-06-10T23:29:15Z',
  pageUrl: `${REPO_URL}/releases/tag/v1.2.0`,
  installer: {
    name: 'DOR101.Setup.1.2.0.exe',
    url: 'https://github.com/Nikoxkx/Dorchester-101/releases/download/v1.2.0/DOR101.Setup.1.2.0.exe',
    sizeBytes: 182_573_364,
  },
  portable: {
    name: 'DOR101-Portable-1.2.0.exe',
    url: 'https://github.com/Nikoxkx/Dorchester-101/releases/download/v1.2.0/DOR101-Portable-1.2.0.exe',
    sizeBytes: 182_350_503,
  },
} as const;

export interface ExeAsset {
  name: string;
  url: string;
  sizeBytes: number | null;
}

export interface DownloadInfo {
  tag: string;
  name: string;
  publishedAt: string;
  pageUrl: string;
  installer: ExeAsset | null;
  portable: ExeAsset | null;
  /** True when GitHub was unreachable and the pinned release is being served. */
  fallback: boolean;
}

function isInstaller(name: string): boolean {
  return /^DOR101[ ._-]*Setup/i.test(name.replace(/\s+/g, ' ')) || /setup/i.test(name);
}

function isPortable(name: string): boolean {
  return /portable/i.test(name);
}

async function resolve(): Promise<DownloadInfo> {
  const cached = globalCache.get<DownloadInfo>('download:latest');
  if (cached) return cached;

  try {
    const res = await fetch(GITHUB_LATEST, {
      cache: 'no-store',
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'DOR101 community hub (open-source)',
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
    const release = (await res.json()) as {
      tag_name?: string;
      name?: string;
      published_at?: string;
      html_url?: string;
      assets?: Array<{ name: string; browser_download_url: string; size: number }>;
    };
    const exes = (release.assets ?? []).filter((asset) => asset.name.toLowerCase().endsWith('.exe'));
    if (exes.length === 0) throw new Error('Latest release has no .exe assets');

    const installerAsset = exes.find((asset) => isInstaller(asset.name)) ?? exes[0];
    const portableAsset = exes.find((asset) => asset !== installerAsset && isPortable(asset.name));
    const info: DownloadInfo = {
      tag: release.tag_name ?? 'latest',
      name: release.name ?? 'DOR101',
      publishedAt: release.published_at ?? new Date().toISOString(),
      pageUrl: release.html_url ?? `${REPO_URL}/releases/latest`,
      installer: { name: installerAsset.name, url: installerAsset.browser_download_url, sizeBytes: installerAsset.size },
      portable: portableAsset ? { name: portableAsset.name, url: portableAsset.browser_download_url, sizeBytes: portableAsset.size } : null,
      fallback: false,
    };
    globalCache.set('download:latest', info, 5 * 60_000);
    return info;
  } catch {
    const info: DownloadInfo = { ...PINNED_RELEASE, fallback: true };
    globalCache.set('download:latest', info, CACHE_TTL.DEFAULT);
    return info;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const get = url.searchParams.get('get');

  if (get === 'installer' || get === 'portable') {
    const info = await resolve();
    const asset = get === 'installer' ? info.installer : info.portable;
    if (!asset) return NextResponse.json({ error: 'No such asset' }, { status: 404 });
    // A redirect keeps the heavy download on GitHub's CDN while the site stays
    // the single place a resident has to click from.
    return NextResponse.redirect(asset.url, 302);
  }

  const info = await resolve();
  return NextResponse.json(info, {
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}
