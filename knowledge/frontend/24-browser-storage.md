# Browser Storage APIs

| API | Capacity | Persistence | Accessible from |
|-----|----------|-------------|-----------------|
| Cookie | ~4 KB | Configurable | Server + JS |
| localStorage | 5–10 MB | Until cleared | JS only |
| sessionStorage | 5–10 MB | Tab session | JS only |
| IndexedDB | > 1 GB | Until cleared | JS, Service Worker |
| Cache API | Large | Until cleared | Service Worker |

**localStorage:** Synchronous — blocks the main thread for large reads/writes. Serialise with JSON.
**IndexedDB:** Async, transactional, stores structured data without serialisation overhead. Use the `idb` wrapper for ergonomics.
**Cache API (Service Worker):** Cache network responses for offline-first patterns.

**Security:** `localStorage` is accessible to any script on the same origin — never store sensitive tokens there. Use `HttpOnly` cookies for auth.

**Storage quota:** Use `navigator.storage.estimate()` to check remaining quota.

tags: storage, localStorage, IndexedDB, cookies, Cache API, Service Worker, offline
