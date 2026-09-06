/**
 * DOR101 service worker — offline support is a real accessibility feature
 * for this audience (unreliable data plans), not a nice-to-have.
 *
 * Strategy:
 *  · Precache the app shell + the verified resource directory and food data
 *    (small JSON payloads) so first offline visit still shows the directory.
 *  · Runtime: network-first with cache fallback for pages and data, so live
 *    info wins when online; stale data still renders offline.
 *  · Never cache MBTA predictions (they must not look fresh when stale).
 */
const CACHE = 'dor101-v3';
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/offline.html',
  '/api/resources',
  '/api/food',
  '/api/faq',
  '/api/neighborhoods',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

const NEVER_CACHE = ['/api/mbta', '/api/notifications/stream'];

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const tileHost =
    url.hostname.includes('arcgisonline.com') ||
    url.hostname.includes('openstreetmap.org') ||
    url.hostname.includes('cartocdn.com');

  if (!sameOrigin && !tileHost) return;
  if (sameOrigin && NEVER_CACHE.some((p) => url.pathname.startsWith(p))) return;
  if (url.pathname.startsWith('/api/notifications/stream')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached;
          if (request.mode === 'navigate') {
            return caches
              .match('/')
              .then((shell) => shell || caches.match('/offline.html'))
              .then(
                (fallback) =>
                  fallback ||
                  new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }),
              );
          }
          return new Response('Offline — reconnect and try again.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }),
      ),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
  }
});
