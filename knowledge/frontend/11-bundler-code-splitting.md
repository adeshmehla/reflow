# Bundler Code Splitting

Code splitting lets you ship only the JavaScript needed for the current view.

**Dynamic import:**
```js
const Chart = await import('./Chart.js'); // returns a module namespace object
```

**React lazy:**
```jsx
const Dashboard = React.lazy(() => import('./Dashboard'));
<Suspense fallback={<Spinner />}><Dashboard /></Suspense>
```

**Route-based splitting** (React Router, Next.js): each route is a separate chunk fetched on demand.

**Vite specifics:** Uses Rollup under the hood. Configure `build.rollupOptions.output.manualChunks` to group vendor code. The built-in `splitVendorChunkPlugin` is a quick win.

**Trade-offs:** Too many small chunks → many round-trips (bad on HTTP/1); too few → large initial bundle. Aim for chunks 50–200 KB after gzip.

tags: bundler, Vite, Webpack, code splitting, lazy loading, performance
