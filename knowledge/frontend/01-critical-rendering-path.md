# Critical Rendering Path

The critical rendering path (CRP) is the sequence of steps the browser takes to convert HTML, CSS, and JS into pixels on screen.

Key steps: Parse HTML → Build DOM → Parse CSS → Build CSSOM → Combine into Render Tree → Layout → Paint → Composite.

**Optimisations:**
- Inline critical CSS to avoid render-blocking stylesheet fetches.
- Defer or async-load non-critical JS (`<script defer>` or `<script type="module">`).
- Minimise render-blocking resources above the fold.
- Use `<link rel="preload">` for fonts and hero images.

**Metric:** Time to First Contentful Paint (FCP) directly reflects CRP efficiency.

tags: performance, rendering, browser, FCP, CRP
