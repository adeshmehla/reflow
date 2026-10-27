# Core Web Vitals

Google's field metrics for user experience:

| Metric | Measures | Good threshold |
|--------|----------|----------------|
| LCP (Largest Contentful Paint) | Loading | ≤ 2.5 s |
| INP (Interaction to Next Paint) | Responsiveness | ≤ 200 ms |
| CLS (Cumulative Layout Shift) | Visual stability | ≤ 0.1 |

**Improving LCP:** Preload the hero image, use CDN, optimise TTFB, remove render-blocking CSS/JS.
**Improving INP:** Break up long tasks (> 50 ms), defer non-urgent work with `scheduler.postTask` or `setTimeout(fn, 0)`.
**Improving CLS:** Set explicit `width` and `height` on images/videos, avoid inserting content above existing content.

tags: performance, Web Vitals, LCP, INP, CLS, metrics
