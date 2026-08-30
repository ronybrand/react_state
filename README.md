# react_estado

[![CI](https://github.com/ronybrand/react_estado/actions/workflows/ci.yml/badge.svg)](https://github.com/ronybrand/react_estado/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ronybrand/react_estado/graph/badge.svg)](https://codecov.io/gh/ronybrand/react_estado)

CRUD for Brazilian federative units (states) — abbreviation, name, and
created/updated timestamps — consuming a REST API at `/api/estado`.

## Stack

- [React 19](https://react.dev/) + TypeScript (strict) + [Vite](https://vite.dev/)
- [TanStack Query](https://tanstack.com/query) for data-fetching, caching, and invalidation
- [Axios](https://axios-http.com/) with request-id and timeout/retry interceptors
- [React Router](https://reactrouter.com/) (data router) with lazy-loaded routes
- [React Hook Form](https://react-hook-form.com/) for form validation
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for component tests
- ESLint (typescript-eslint + react-hooks + jsx-a11y) + Prettier + Husky/lint-staged

## Structure

```
src/
├── pages/               # StateList, CreateState, EditState (routes)
├── shared/
│   ├── StateForm/         # create/edit form (React Hook Form)
│   ├── ErrorMessage/       # error alert (role="alert") + useErrorMessage hook
│   ├── Spinner/              # loading indicator (role="status")
│   ├── Icon/                  # SVG icons centralized by name
│   └── RouteError/             # render-error fallback per route
├── hooks/                # TanStack Query hooks (list, get, create, update, delete)
├── lib/                  # httpClient (axios + interceptors), error extractors, formatDate
├── interfaces/           # State / NewState domain types
├── services/             # stateService (HTTP calls) + stateApiMapper (wire <-> domain)
└── router.tsx              # routes with lazy loading
```

### Conventions

- Function components + hooks, no classes.
- Data cache via TanStack Query (`hooks/`) instead of manual per-page
  fetching — every mutation invalidates the affected query, keeping the
  list in sync across navigations.
- `httpClient` (`lib/httpClient.ts`) centralizes a 15s timeout and retry
  (up to 2 attempts, GET only) via axios interceptors; the `X-Request-Id`
  header is generated once per action and preserved across retries, so all
  attempts correlate as a single action in the backend logs.
- The backend's actual JSON contract uses Portuguese field names
  (`sigla`, `nome`, `dataHoraCadastro`, `dataHoraUltimaAtualizacao`) and the
  API path segment is `/estado` — both are the real wire contract and are
  **not** translated. `services/stateApiMapper.ts` is a small
  anti-corruption layer that maps that wire format to/from the English
  `State` domain type, so the rest of the app never sees the Portuguese
  field names.
- Accessibility: `aria-invalid`/`aria-describedby` on form fields, dynamic
  `aria-label` on the per-row action buttons, `role="status"`/`role="alert"`
  for loading/error states.
- Request errors (query/mutation) are handled per page via
  `useErrorMessage`; unexpected render errors are caught by React Router's
  `errorElement` (`RouteError`), avoiding a blank screen.

## Prerequisites

Requires a State API backend running locally at `http://localhost:8090` —
without it, `npm run dev` still serves the UI, but calls to `/api/*` fail
(the list shows the error message once the retry is exhausted).

## Development server

```bash
npm run dev
```

Vite proxies `/api` to `http://localhost:8090` (see `vite.config.ts`). Open
`http://localhost:5173/`.

## Build

```bash
npm run build
```

Outputs the build artifacts to `dist/`.

## Lint and formatting

```bash
npm run lint          # eslint
npm run format:check  # prettier --check
npm run format        # prettier --write
```

Husky + lint-staged run `eslint --fix` and `prettier --write` on pre-commit.

## Tests

```bash
npm test               # vitest
npm run test:coverage  # vitest run --coverage
```

Vitest + React Testing Library, covering the list/create/edit/delete flows,
shared-form validation, the support components (`Icon`, `Spinner`,
`ErrorMessage`/`useErrorMessage`, `RouteError`), and `lib`/`services`
utilities. Coverage is reported in CI via Codecov, gated at 90% (project) /
80% (patch).
