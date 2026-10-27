# State Management Patterns

**Local state** (`useState`, `useReducer`) — first choice; only lift when siblings need it.

**Context API** — lightweight global state; fine for theme, auth, locale. Avoid frequent updates in context (rerenders all consumers).

**External stores (Zustand, Jotai, Redux):**
- **Zustand** — minimal, no boilerplate, subscribe at selector granularity.
- **Jotai** — atomic model, composable; pairs well with Suspense.
- **Redux Toolkit** — opinionated, DevTools integration, best for large teams.

**Server state** is different from client state — use **TanStack Query** (React Query) for caching, background refetching, optimistic updates. Don't replicate server data in Redux.

**URL state** — filters, pagination, active tab belong in the URL (`useSearchParams`). Shareable and survives refresh.

**Rule of thumb:** Put state as close to where it's used as possible. Global state should be the exception.

tags: state management, React, Zustand, Redux, Jotai, context, TanStack Query
