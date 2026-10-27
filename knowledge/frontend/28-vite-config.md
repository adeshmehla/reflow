# Vite Configuration

Vite uses Rollup for production builds and native ESM + esbuild for dev.

```js
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': 'http://localhost:8787' }  // dev proxy
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: { vendor: ['react', 'react-dom'] }
      }
    },
    sourcemap: true,
  },
  resolve: {
    alias: { '@': '/src' }   // import from '@/components/...'
  }
});
```

**Performance tips:**
- Use `vite-plugin-compression` for Brotli/gzip in prod.
- `vite-plugin-pwa` for service worker generation.
- Analyse bundle with `rollup-plugin-visualizer`.
- `assetsInlineLimit` controls when small files are inlined as base64.

tags: Vite, bundler, build config, Rollup, esbuild, proxy, plugins
