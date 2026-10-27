# Image Optimisation

Images are typically the largest page asset. Optimising them has the biggest LCP impact.

**Modern formats:** WebP (30% smaller than JPEG), AVIF (50% smaller). Use `<picture>` for progressive enhancement:
```html
<picture>
  <source srcset="img.avif" type="image/avif">
  <source srcset="img.webp" type="image/webp">
  <img src="img.jpg" alt="..." width="800" height="600" loading="lazy">
</picture>
```

**`loading="lazy"`** — defer off-screen images. Never lazy-load the LCP image (above the fold).

**`decoding="async"`** — decodes off-main-thread.

**Explicit dimensions** — set `width` and `height` to prevent CLS.

**Preload hero image:**
```html
<link rel="preload" as="image" href="hero.avif" type="image/avif">
```

**CDN with image transforms:** Cloudflare Images, Imgix, or Next.js Image auto-resize and serve correct format.

tags: images, performance, WebP, AVIF, lazy loading, LCP, CDN, optimisation
