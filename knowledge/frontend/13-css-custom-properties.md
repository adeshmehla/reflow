# CSS Custom Properties (Variables)

Custom properties cascade and can be changed at runtime with JS.

```css
:root {
  --color-primary: #2438d9;
  --spacing-md: 16px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

/* Dark mode override */
@media (prefers-color-scheme: dark) {
  :root { --color-primary: #7f8cff; }
}
```

**JS interop:**
```js
// Read
getComputedStyle(el).getPropertyValue('--color-primary').trim();
// Write
el.style.setProperty('--color-primary', '#ff0000');
```

**Scope:** Custom properties cascade — define on a parent, override on a child.

**Use for:** Design tokens, theming, component-level configuration, runtime animation values.

tags: CSS, custom properties, variables, theming, design tokens
