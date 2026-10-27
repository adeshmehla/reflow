# Next.js Rendering Patterns

**App Router (Next.js 13+):**
- **Server Components (RSC)** – default; render on server, zero JS sent to client. Cannot use hooks.
- **Client Components** – add `"use client"` directive; interactive, hook-enabled.
- **Server Actions** – async functions with `"use server"`; call server logic from forms/buttons.

**Rendering strategies:**
| Strategy | When | How |
|----------|------|-----|
| SSG | Static content | `export const dynamic = 'force-static'` |
| ISR | Periodic refresh | `export const revalidate = 60` |
| SSR | Per-request fresh data | `export const dynamic = 'force-dynamic'` |
| Streaming | Incremental HTML | `<Suspense>` boundaries |

**Caching layers:** Request memoisation → Data cache → Full-route cache → Router cache.

**`next/image`** automatically optimises images. **`next/font`** self-hosts fonts, eliminating FOUT.

tags: Next.js, App Router, SSR, SSG, ISR, Server Components, caching
