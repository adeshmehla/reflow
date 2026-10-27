# SEO & Meta Tags for SPAs

Search engines can crawl SPAs but SSR/SSG gives the most reliable indexability.

**Essential tags:**
```html
<title>Page Title — Site Name</title>
<meta name="description" content="150-160 char summary">
<link rel="canonical" href="https://example.com/page">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="https://...1200x630.jpg">
<meta name="twitter:card" content="summary_large_image">
```

**Structured data (JSON-LD):**
```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Article","headline":"..."}
</script>
```

**SPA routing:** Use `history.pushState` (not hash routing) for crawlable URLs. Pre-render with SSR or static generation when SEO matters.

**Core Web Vitals affect rankings** — a reason to care about LCP and CLS beyond UX.

tags: SEO, meta tags, Open Graph, SPA, structured data, indexability
