# Accessibility & ARIA

Accessibility (a11y) ensures interfaces work for users with disabilities (visual, motor, cognitive).

**ARIA basics:**
- `role` – what the element is (e.g., `role="dialog"`).
- `aria-label` / `aria-labelledby` – accessible name.
- `aria-describedby` – additional description.
- `aria-live` – announce dynamic content to screen readers (`polite` | `assertive`).
- `aria-hidden="true"` – hide decorative elements from the a11y tree.

**Rules of ARIA:**
1. Use native HTML elements first (`<button>` not `<div role="button">`).
2. Never change native semantics without reason.
3. All interactive ARIA roles need keyboard support.
4. Don't hide visible, focusable elements.

**Quick checklist:** Focus visible, colour contrast ≥ 4.5:1, keyboard navigable, images have alt text, forms have labels.

tags: accessibility, ARIA, a11y, screen reader, keyboard
