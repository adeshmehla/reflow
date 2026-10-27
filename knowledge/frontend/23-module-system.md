# JavaScript Module Systems

**ESM (ES Modules)** — the native standard. Static analysis enables tree-shaking.
```js
import { foo } from './foo.js';   // named import
import bar from './bar.js';       // default import
import * as all from './all.js';  // namespace import
export const value = 42;
export default function main() {}
```

**CommonJS (CJS)** — Node.js original (`require`/`module.exports`). Still common in older packages.

**Interop gotchas:**
- ESM can import CJS (with some quirks). CJS cannot `require` ESM.
- In `package.json`: `"type": "module"` makes `.js` files ESM.
- Use `.mjs`/`.cjs` extensions to be explicit.

**Tree-shaking:** Bundlers (Rollup, Vite) statically analyse `import` statements to eliminate dead code. Side-effect-free packages should set `"sideEffects": false` in package.json.

**Dynamic import:** `await import('./module.js')` — code-splits and lazy-loads.

tags: ESM, CommonJS, modules, import, export, tree-shaking, bundler
