# Responsive Design

**Viewport meta tag** (required on mobile):
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

**Fluid layouts:** Use `%`, `vw`, `fr`, `min()`, `max()`, `clamp()` instead of fixed `px` widths.

```css
/* Fluid typography */
font-size: clamp(1rem, 2.5vw, 1.5rem);

/* Fluid spacing */
padding: clamp(16px, 4vw, 48px);
```

**Breakpoints:** Use content-driven breakpoints, not device-driven. Start mobile-first: define defaults for small screens, then use `@media (min-width: …)` to enhance.

**Responsive images:**
```html
<img srcset="img-400.jpg 400w, img-800.jpg 800w" sizes="(max-width: 600px) 400px, 800px" src="img-800.jpg" alt="…">
```

**Container queries** (modern): Style based on parent container width, not viewport.

tags: responsive design, media queries, mobile, clamp, fluid layout, container queries
