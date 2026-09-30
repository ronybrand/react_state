# react_state

[![CI](https://github.com/ronybrand/react_state/actions/workflows/ci.yml/badge.svg)](https://github.com/ronybrand/react_state/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ronybrand/react_state/actions/workflows/codeql.yml/badge.svg)](https://github.com/ronybrand/react_state/actions/workflows/codeql.yml)
[![codecov](https://codecov.io/gh/ronybrand/react_state/graph/badge.svg)](https://codecov.io/gh/ronybrand/react_state)

🔗 **[Live application](https://react-state-flax.vercel.app/)**

CRUD for Brazilian federative units (states) — abbreviation, name, and
created/updated timestamps — consuming the [Estado project](https://github.com/ronybrand/estado)'s
REST API at `/api/estado`. An alternate React frontend for the same backend, alongside the
original [Angular one](https://github.com/ronybrand/angular_estado). See the backend's
[CASE_STUDY.md](https://github.com/ronybrand/estado/blob/master/CASE_STUDY.md) for the
end-to-end system write-up (architecture, decisions, trade-offs).

## Architecture

```mermaid
flowchart LR
    Browser["Browser"]

    subgraph Vercel["Vercel"]
        direction LR
        Static["Next.js app\n(React bundle)"]
        Rewrite["/api route handler\n(BFF proxy)"]
    end

    subgraph EC2["EC2 (Docker)"]
        direction LR
        App["estado-app\n(Spring Boot + Spring Security)"]
        DB[("Postgres")]
    end

    Browser -- "/ (static)" --> Static
    Browser -- "/api/*" --> Rewrite
    Rewrite --> App
    App --> DB
```

The app never talks to the backend's own origin — the catch-all route
handler `src/app/api/[...path]/route.ts` forwards `/api/*` to it
server-side (target: `BACKEND_API_URL`), so the browser only ever sees the
deployment's own origin
(see [Deployment](#deployment) below). This diagram is infra/network
topology, not API routes — it doesn't distinguish `GET` from
`POST`/`PUT`/`DELETE` on `/estado`, so JWT auth (an internal concern of
the Spring Boot app itself) doesn't add a box or arrow here either.
`POST /auth/login` returns a short-lived JWT, kept in `localStorage` and
attached as `Authorization: Bearer <token>` by an axios request
interceptor on state-mutating calls only — listing and reading states
stays public, matching the backend's own authorization rule.

Demo credentials (intentionally public): see the backend's
[`estado`](https://github.com/ronybrand/estado#readme) README.

## Screenshots

<img src="docs/screenshot-state-list.png" alt="States list" width="500" />
<img src="docs/screenshot-create-state.png" alt="Create state form" width="360" />

## Stack

- [React 19](https://react.dev/) + TypeScript (strict) + [Next.js](https://nextjs.org/) (App Router)
- [TanStack Query](https://tanstack.com/query) for data-fetching, caching, and invalidation
- [Axios](https://axios-http.com/) with request-id and timeout/retry interceptors
- [React Hook Form](https://react-hook-form.com/) for form validation
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) for component tests
- ESLint (`eslint-config-next`) + Prettier + Husky/lint-staged

## Structure

```
src/
├── app/                 # App Router: pages, layouts, providers, /api proxy route, error.tsx
├── shared/
│   ├── Layout/             # app shell: title bar + children + Footer
│   ├── Footer/              # FE/BE build info, hides silently on failure
│   ├── StateForm/            # create/edit form (React Hook Form)
│   ├── FormPage/              # shared create/edit page shell (title + ErrorMessage wrapper)
│   ├── ErrorMessage/          # error alert (role="alert") + useErrorMessage hook
│   ├── ProtectedRoute/          # redirects to /login when the JWT is missing/expired
│   ├── Spinner/                   # loading indicator (role="status")
│   ├── Icon/                       # SVG icons centralized by name
│   └── RouteError/                  # render-error fallback per route
├── hooks/                # TanStack Query hooks (list, get, create, update, delete,
│                            login, frontend/backend version for the footer)
├── lib/                  # httpClient (axios + interceptors), tokenStorage (JWT in
│                            localStorage), error extractors, formatDate
├── interfaces/           # State / NewState / FrontendVersion / BackendInfo domain types
├── services/             # stateService + stateApiMapper (wire <-> domain), authService,
│                            infoService
└── proxy.ts                # Next proxy (ex-middleware): sets the CSP header

scripts/
└── generate-version.mjs  # writes public/version.json (commit + build date) on build,
                             read by the footer to show the deployed frontend version
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
  `useErrorMessage`; unexpected render errors are caught by the App Router's
  `app/error.tsx` (`RouteError`), avoiding a blank screen.
- `stateService.list` fetches the whole dataset in a single request instead
  of exposing page-size/pagination controls in the UI: the domain is closed
  at 27 items (the Brazilian states), so real pagination never triggers in
  practice. The backend only exposes the paginated endpoint
  (`/estado/paginado`, see ADR 0018 in the `estado` repo) — the frontend
  still consumes that contract, it just doesn't surface paging in the UI
  for a dataset that always fits on one page.

## Prerequisites

Requires a State API backend running locally at `http://localhost:8090` —
without it, `npm run dev` still serves the UI, but calls to `/api/*` fail
(the list shows the error message once the retry is exhausted).

## Development server

```bash
npm install
npm run dev
```

The `/api` route handler proxies to `http://localhost:8080` by default; to
target the local backend on 8090, create `.env.local` with
`BACKEND_API_URL=http://localhost:8090`. Open `http://localhost:3000/`.

### Environment variables

`BACKEND_API_URL` — server-side only: the backend base URL the `/api` route
handler forwards to. Required in production (the route answers 500 if it's
missing); defaults to `http://localhost:8080` in development. Deliberately
**not** a `NEXT_PUBLIC_` variable: that would be inlined into the client
bundle and make the browser call the backend directly, bypassing the proxy
and tripping the CSP's `connect-src 'self'`. `httpClient` always uses the
same-origin `/api`.

## Build

```bash
npm run build
```

Outputs the production build to `.next/` (run it with `npm start`).

## Deployment

Live at **[react-state-flax.vercel.app](https://react-state-flax.vercel.app/)**.
Deployed on Vercel as a Next.js app (zero-config, no `vercel.json`). The
`/api` route handler forwards to the live backend named by the
`BACKEND_API_URL` project env var — the browser only ever talks to the
deployment's own origin, so it avoids CORS entirely (the backend only
allows its own CloudFront origin). Run `npx vercel --prod` from a
Vercel-linked checkout.

There's no one-click "Deploy with Vercel" button: `BACKEND_API_URL` must
point at a backend you control, and this project's own backend only allows
its own origin.

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
