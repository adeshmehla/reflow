# HTTP Caching

Proper caching dramatically reduces load time and server cost.

**Cache-Control directives:**
- `max-age=N` – cache for N seconds.
- `no-cache` – must revalidate with server before using cached copy.
- `no-store` – never cache (sensitive data).
- `immutable` – content will never change; skip revalidation.
- `stale-while-revalidate` – serve stale while fetching update in background.

**ETags & Last-Modified:** Conditional requests (`If-None-Match`, `If-Modified-Since`) return 304 Not Modified if unchanged.

**Cache busting for static assets:** Embed a content hash in the filename (Vite/Webpack do this automatically). Then set `Cache-Control: max-age=31536000, immutable` — the URL changes when content changes.

tags: HTTP, caching, performance, Cache-Control, ETag, CDN
