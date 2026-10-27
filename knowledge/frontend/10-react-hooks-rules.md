# React Hooks — Rules & Mental Model

**The two rules:**
1. Only call hooks at the top level — never inside loops, conditions, or nested functions.
2. Only call hooks from React function components or custom hooks.

**Why:** React relies on call order to match hook state across renders.

**Common hooks:**
- `useState` – local component state.
- `useEffect` – sync with external systems; cleanup with return function.
- `useRef` – mutable value that doesn't trigger re-render; DOM refs.
- `useContext` – consume context without prop-drilling.
- `useMemo` – cache expensive computation.
- `useCallback` – stable function reference for child props / dependency arrays.
- `useReducer` – complex state with actions; pairs well with `useContext`.
- `useId` – stable, unique ID for a11y attributes; safe for SSR.

**`useEffect` dependency array:** Include every reactive value the effect uses. Omitting deps causes stale closures. ESLint's `exhaustive-deps` rule catches most mistakes.

tags: React, hooks, useState, useEffect, useRef, custom hooks
