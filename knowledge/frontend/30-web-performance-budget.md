# Performance Budgets

A performance budget is a constraint on metrics or asset sizes that keeps a product fast over time.

**Common budget types:**
- **Quantity-based:** Max JS bundle < 200 KB gzipped.
- **Timing-based:** LCP < 2.5 s on a mid-tier mobile device.
- **Rule-based:** Lighthouse score ≥ 90.

**Setting a budget:**
1. Measure the current baseline.
2. Define aspirational targets (or match top competitors).
3. Enforce in CI (Lighthouse CI, Bundlesize, Size Limit).

```json
// .size-limit.json
[{ "path": "dist/assets/*.js", "limit": "200 KB", "gzip": true }]
```

**Webpack / Vite:** Set `build.chunkSizeWarningLimit` (Vite) to warn when chunks exceed the limit.

**Why budgets matter:** Without a budget, bundle size creeps up invisibly. A budget forces trade-off conversations at PR time, not after a performance regression.

tags: performance, budget, Lighthouse, CI, bundle size, LCP, metrics
