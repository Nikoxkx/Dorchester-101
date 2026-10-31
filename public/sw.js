/// DOR101 service worker — the app version lives in package.json; the
/// cache key below is versioned on its own, as the README explains.
///
/// What this is for: previously cached pages, assets and map tiles may remain
/// available without a signal. Live API responses are never cached here: an
/// old prediction must not be returned as if it were live. Offline availability
/// depends on the files already stored, and activation never forces a reload.
///
/// Cache names are versioned constants, not timestamps. A name built from
/// `Date.now()` creates a brand-new cache on every evaluation and leaves the
/// previous ones behind until something deletes them, which is how a service
/// worker ends up eating storage instead of saving bandwidth.

/// Bumped for the privacy, translation and photograph update so an older
/// cached shell is not retained after activation. This is a cache version, not
/// the app version: the app's own version lives in package.json.
const VERSION = 'v4.14.0';
const SHELL_CACHE = `dor101-shell-${VERSION}`;
const TILE_CACHE = `dor101-tiles-${VERSION}`;

const SHELL_URLS = ['/', '/offline.html', '/icon.svg', '/logo.png',
  '/og.png', '/manifest.json', '/faq', '/food'];
const TILE_MAX_ENTRIES = 480;

self.addEventListener('install', (event) => {
  event.waitUntil(
    // allSettled, not all: one missing file must not abort the whole install and
    // leave the site with no offline shell at all.
    caches.open(SHELL_CACHE).then((cache) => Promise.allSettled(SHELL_URLS.map((url) => cache.add(url))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Only ever delete this app's own caches, and only old versions of them.
      await Promise.all(
        keys
          .filter((key) => key.startsWith('dor101-') && ![SHELL_CACHE, TILE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) client.postMessage({ type: 'DOR101_CLAIMED', version: VERSION });
    })()
  );
});

/** Trims a cache to the newest `max` entries so storage cannot grow forever. */
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
}

async function networkFirst(request, cacheName, { fallback } = {}) {
  try {
    const response = await fetch(request);
    if (response && response.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (fallback) {
      const shell = await caches.match(fallback);
      if (shell) return shell;
    }
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === 'basic') {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // A missing tile is a grey square, not an error page: the basemap layer has
    // already told the rider it is serving cached imagery.
    return new Response('', { status: 504, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // The desktop-app download is a redirect straight to the release file on
    // github.com. The browser must follow it itself — intercepting it here
    // would pull a ~180 MB executable through the worker and try to file it in
    // the shell cache.
    if (url.pathname.startsWith('/api/download')) return;
    // Query strings can contain searches, locations or private feed URLs.
    // API responses also include time-sensitive predictions and warnings;
    // returning an old response unchanged would make it appear live. Leave
    // both to the browser and application rather than storing them here.
    if (url.pathname.startsWith('/api/') || url.search) return;
    // Page navigations: network first, shell cache, then the offline page.
    if (request.mode === 'navigate') {
      event.respondWith(networkFirst(request, SHELL_CACHE, { fallback: '/offline.html' }));
      return;
    }
    // Hashed build assets and images are immutable; never re-fetch them.
    if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/img/') || url.pathname.startsWith('/sources/') || url.pathname.startsWith('/icons/') || url.pathname.endsWith('.svg') || url.pathname === '/logo.png') {
      event.respondWith(cacheFirst(request, SHELL_CACHE));
      return;
    }
    return;
  }

  // Basemap tiles only. Fonts are bundled by @fontsource, so there is nothing to
  // proxy for typography and no third party gets a request from this worker.
  const isTile =
    url.hostname === 'server.arcgisonline.com' ||
    url.hostname.endsWith('.tile.openstreetmap.org') ||
    url.hostname === 'tile.openstreetmap.org';
  if (isTile) {
    event.respondWith(
      cacheFirst(request, TILE_CACHE).then((response) => {
        if (response && response.ok) void trim(TILE_CACHE, TILE_MAX_ENTRIES);
        return response;
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (!event.data || typeof event.data !== 'object') return;
  // The page sends this in exactly two cases: the visitor tapped "reload",
  // or the app just went to the background with an update waiting (see
  // src/lib/updatePolicy.ts). Activating never reloads a page by itself —
  // that is the difference between an update and a page that changes
  // under someone's feet.
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
