# Testing Documentation

## 1. Unit Testing (Lab05 Requirement)

**Testing Library:** [Vitest](https://vitest.dev/) (v4.x)

**What we tested:** We implemented unit tests for our Google OAuth authentication utilities in `src/utils/auth.js`. The test file `src/utils/auth.test.js` contains 10 unit tests across four function groups:

- **`decodeToken`** — Verifies correct JWT payload extraction, and that malformed tokens (wrong number of parts, invalid base64) throw appropriate errors.
- **`handleCredentialResponse`** — Verifies that a valid Google credential is decoded and saved to localStorage (including optional `picture` field), and that malformed tokens return `null` without crashing.
- **`signOut`** — Verifies that user data is removed from localStorage, and that calling it with no stored user does not throw.
- **`getCurrentUser`** — Verifies retrieval of stored user data, returns `null` when no user exists, and gracefully handles corrupted localStorage JSON.

**Why Vitest:** Since our project uses Vite as the build tool, Vitest integrates natively with zero extra configuration. It supports ESM, JSX, and provides a Jest-compatible API with built-in mocking (`vi.spyOn`, `vi.restoreAllMocks`).

## 2. Unit Testing Plans Going Forward

We plan to continue writing Vitest unit tests for new utility functions and business logic as we add features. Priority areas include:
- Any new helper/utility modules (e.g., form validation, data formatting, API request helpers)
- Edge-case coverage for critical paths like authentication and data persistence
- Running `vitest` in CI to catch regressions before merging PRs

We will not aim for 100% unit test coverage on every file, but will focus unit tests on logic-heavy utility code where they provide the most value.

## 3. Component/Integration Testing (Lab06 Requirement)

**Testing Libraries:** [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (v16.x) + [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) (v6.x), running on Vitest with a jsdom environment.

**What we tested:** We implemented component tests for the `ListingCard` React component in `src/components/ListingCard.test.jsx`. This file contains 9 component tests that render `ListingCard` with various props and assert on the resulting DOM:

- Renders all formatted listing data (category, price, address, bedrooms, bathrooms, square footage, source)
- Displays "Price N/A" when price is null or undefined
- Displays "Studio" when bedrooms is 0, "N/A" when bedrooms is null
- Renders a plain address when no URL is provided, and a clickable `<a>` link when a URL is given
- Conditionally renders/hides square footage based on data availability

**Why React Testing Library:** It encourages testing components the way users interact with them (querying by text, role, etc.) rather than testing implementation details. Combined with jest-dom matchers (e.g., `toBeInTheDocument`, `toHaveAttribute`), it provides expressive, readable assertions. This is a higher-level test than unit tests because it exercises the full React render cycle including JSX, conditional rendering, and DOM output.

## 4. Higher-Level Testing Plans Going Forward

We plan to expand component testing to cover more of our React components, especially:
- Pages with user interaction (login flow, listing filters, form submissions)
- Components that depend on React Router or context providers
- Integration tests that verify multiple components working together

If the project grows in complexity, we may explore end-to-end testing with Playwright to verify full user flows (e.g., login → browse listings → filter → view details). For now, the combination of Vitest unit tests and React Testing Library component tests gives us solid coverage of both logic and UI behavior.

## Test Configuration

- **Test runner:** Vitest (configured in `vite.config.js`)
- **DOM environment:** jsdom
- **Run tests:** `npm test` (runs `vitest`)
- **Test file locations:**
  - `src/utils/auth.test.js` (unit tests)
  - `src/components/ListingCard.test.jsx` (component tests)
