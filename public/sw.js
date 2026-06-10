/// DOR101 Service Worker — v1.1.0
/// Provides offline caching, background sync, and install support
/// Updated: Always fetch fresh content from network

const RUNTIME_CACHE = 'dor101-runtime-' + Date.now();

// Core app shell files to cache on install
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// API routes to cache with network-first strategy
const API_ROUTES = [
  '/api/news',
  '/api/market-data',
  '/api/notifications',
  '/api/mbta',
  '/api/resources',
];

// Install — cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate — clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => {
      // Force reload all clients
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'RELOAD_PAGE' });
        });
      });
    })
  );
  self.clients.claim();
});

// Fetch — ALWAYS network first, never serve stale content
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except fonts & tiles)
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('arcgisonline.com') &&
      !url.hostname.includes('openstreetmap.org') &&
      !url.hostname.includes('cartocdn.com')) {
    return;
  }

  // ALWAYS use network-first strategy for fresh content
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and cache the fresh response
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Only fall back to cache if network fails completely
        return caches.match(request).then((cached) => {
          return cached || new Response(
            'Network error - please refresh',
            { 
              headers: { 'Content-Type': 'text/plain' },
              status: 503 
            }
          );
        });
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
});
