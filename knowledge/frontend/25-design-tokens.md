# Design Tokens

Design tokens are named values that represent design decisions — colours, spacing, typography — shared across design tools and code.

**Levels:**
1. **Primitive tokens** – raw values (`--color-blue-500: #2438d9`).
2. **Semantic tokens** – role-based aliases (`--color-interactive: var(--color-blue-500)`).
3. **Component tokens** – component-specific (`--button-bg: var(--color-interactive)`).

**Benefits:**
- Single source of truth between Figma and code.
- Theme switching by swapping semantic tokens (light/dark, brand A/B).
- Design and engineering speak the same language.

**Tooling:** Style Dictionary (W3C format), Theo, Penpot, Figma Variables.

**CSS implementation:**
```css
:root { --color-interactive: #2438d9; }
[data-theme="dark"] { --color-interactive: #7f8cff; }
```

tags: design tokens, CSS variables, theming, design system, Style Dictionary
