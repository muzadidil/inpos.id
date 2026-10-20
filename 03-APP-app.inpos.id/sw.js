/* INPOS PWA static shell: network first with an offline fallback for previously visited pages. */
'use strict';
const CACHE = 'inpos-split-v769-frontend-separated';
const ROOT = new URL('./', self.registration.scope);
const SHELL = ['./pwa-icon-192.png', './pwa-icon-512.png', './assets/logo-splash.webp'];
const HTML = new Set([]);
const STATIC = /\.(?:png|webp|css|js)$/i;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('inpos-split-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
function cacheable(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin || url.search) return false;
  const base = ROOT.pathname;
  if (!url.pathname.startsWith(base)) return false;
  const relative = url.pathname.slice(base.length);
  if (HTML.has(relative)) return true;
  if (relative === 'pwa-icon-192.png' || relative === 'pwa-icon-512.png') return true;
  return relative.startsWith('assets/') && STATIC.test(relative);
}
self.addEventListener('fetch', event => {
  const request = event.request;
  if (!cacheable(request)) return;
  event.respondWith(fetch(request).then(response => {
    const policy = response.headers.get('cache-control') || '';
    if (response.ok && response.type !== 'opaque' && !/(?:no-store|private)/i.test(policy)) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {}));
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || Response.error())));
});
