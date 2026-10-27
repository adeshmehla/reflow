# Frontend Testing Strategy

**Testing pyramid:**
- **Unit tests** – pure functions, custom hooks (`vitest`, `jest`).
- **Component tests** – render component, assert DOM (`@testing-library/react`).
- **Integration tests** – multiple components interacting; mock API calls (`msw`).
- **E2E tests** – full browser, real network (`Playwright`, `Cypress`).

**React Testing Library philosophy:** Test behaviour, not implementation. Use queries that match how users find elements: `getByRole`, `getByLabelText`, `getByText`. Avoid `querySelector`.

**Vitest:** Vite-native, fast, compatible with Jest API. Use `vi.mock()` for modules, `vi.spyOn()` for methods.

**Mock Service Worker (msw):** Intercept real fetch/XHR in tests. Same mocks work in browser and Node — no need to stub fetch globally.

**What to test:** Critical user flows, edge cases, error states. Don't test library internals. Keep tests fast and deterministic.

tags: testing, Vitest, Jest, React Testing Library, Playwright, E2E, unit test
