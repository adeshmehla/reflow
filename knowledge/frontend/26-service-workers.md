# Service Workers & PWA

A Service Worker (SW) is a proxy script running in a separate thread that intercepts network requests.

**Lifecycle:** Register → Install → Activate → Fetch.

```js
// Register
navigator.serviceWorker.register('/sw.js');

// In sw.js — cache on install
self.addEventListener('install', e => {
  e.waitUntil(caches.open('v1').then(c => c.addAll(['/','index.html','app.js'])));
});

// Serve from cache, fallback to network
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

**Caching strategies:** Cache-first, Network-first, Stale-while-revalidate, Network-only, Cache-only.

**Workbox** (by Google) abstracts caching strategies with minimal code.

**PWA requirements:** HTTPS, Web App Manifest, Service Worker. Enables install-to-home-screen and offline use.

tags: service worker, PWA, offline, caching, Workbox, install
