# CSS Animations & Transitions

**Transitions** — smooth change between two states:
```css
.button {
  transition: background-color 200ms ease, transform 150ms ease;
}
.button:hover { background-color: navy; transform: scale(1.02); }
```

**Keyframe animations:**
```css
@keyframes slide-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
.card { animation: slide-in 300ms cubic-bezier(.2,.7,.2,1) both; }
```

**GPU-composited properties** (animate cheaply): `opacity`, `transform`. Avoid animating `width`, `height`, `top`, `left` (triggers layout).

**`will-change`:** Hint the browser to promote an element to its own layer — use sparingly, only before animation starts.

**`prefers-reduced-motion`:** Always respect:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
```

tags: CSS, animation, transition, keyframes, performance, accessibility
