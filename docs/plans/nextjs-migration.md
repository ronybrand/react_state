# Plano mínimo: migração react_estado (Vite) → Next.js

Status: não iniciado. Guardado para quando fizer sentido investir tempo nisso
(não é urgente por causa de uma vaga específica - ver contexto abaixo).

## Contexto

Next.js apareceu como requisito em mais de uma vaga (ex.: K2/Cogna Educação),
mas não vale criar um terceiro front-end só pra isso - já existem dois
(Angular em produção, React/Vite como alternativo). Se for investir tempo,
a opção mais coerente é migrar o react_estado existente para Next.js, não
criar mais um projeto pra manter.

## Objetivo do escopo mínimo

Trocar a estrutura por App Router e ganhar 1 API route real - não reescrever
tudo para Server Components/SSR de primeira. "Lift and shift" primeiro,
otimização depois, se algum dia fizer sentido.

## Passos

### 1. Scaffold

`npx create-next-app@latest` (TypeScript, Tailwind, ESLint) num branch novo,
ao lado do Vite atual até a migração fechar.

### 2. Roteamento (mapeamento direto, app é pequeno)

- `/estados` (lista) → `app/estados/page.tsx`
- `/estados/[id]` (detalhe) → `app/estados/[id]/page.tsx`
- Manter tudo como Client Component (`'use client'`) inicialmente - não força
  Server Components ainda.

### 3. Data fetching

Mantém TanStack Query como está. Envolve o app num `QueryClientProvider`
(client component). Não reescreve pra fetching server-side agora - é o corte
que mantém o escopo pequeno.

### 4. Forms

`react-hook-form` + `zod` portam praticamente sem mudança (client
components).

### 5. 1 API route real

O ponto que prova "API routes" pras vagas: um endpoint simples em
`app/api/estados/route.ts` fazendo proxy pro backend real - mesmo padrão BFF
já implementado pro `/ask` no Angular (`angular_estado`). Não precisa de mais
que isso.

### 6. Testes

Vitest + Testing Library portam com ajuste de config. Playwright e2e mantém,
só troca a base URL/comando de dev server. axe-core continua igual.

### 7. Deploy

Vercel nativo, zero-config - sem pipeline de CI/CD customizado.

## Fora do escopo mínimo (depois, se quiser)

- Server Components/Server Actions de verdade
- SSR/SSG otimizado
- i18n (não relevante pro domínio deste app)

## Estimativa

App é pequeno (CRUD de estados) - esforço de ~1-2 dias focado, não reescrita
de semanas.

## Comparativo de estrutura: Vite vs Next.js

Implementado em PR #56 (`feat/nextjs-migration`). Mapeamento real de
arquivos/pastas para consulta rápida:

| Vite (`react_estado`)                                                                    | Next.js App Router                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                                                                             | `src/app/layout.tsx` (root layout)                                                                                                                                                  |
| `src/main.tsx`                                                                           | `src/app/layout.tsx` + `src/app/providers.tsx`                                                                                                                                      |
| `src/App.tsx`                                                                            | removido - roteamento vira file-based                                                                                                                                               |
| `src/router.tsx`                                                                         | removido - roteamento vira file-based                                                                                                                                               |
| `src/queryClient.ts`                                                                     | `src/queryClient.ts` (mantido) + `src/app/providers.tsx` (`QueryClientProvider` client component)                                                                                   |
| `src/pages/StateList/StateList.tsx`                                                      | `src/app/page.tsx` (rota `/`)                                                                                                                                                       |
| `src/pages/Login/Login.tsx`                                                              | `src/app/login/page.tsx` (rota `/login`)                                                                                                                                            |
| `src/pages/CreateState/CreateState.tsx`                                                  | `src/app/(protected)/state/new/page.tsx`                                                                                                                                            |
| `src/pages/EditState/EditState.tsx`                                                      | `src/app/(protected)/state/[id]/edit/page.tsx` (dynamic segment; usa `useParams()` do `next/navigation` em vez da prop `params`, pois é Client Component)                           |
| `src/shared/ProtectedRoute/ProtectedRoute.tsx` (wrapper de rota via react-router)        | `src/app/(protected)/layout.tsx` (route group layout) + `src/shared/ProtectedRoute/ProtectedRoute.tsx` (guard, agora usando `next/navigation`)                                      |
| `src/shared/Layout/Layout.tsx` (envolve `<Outlet/>` do react-router)                     | `src/shared/Layout/Layout.tsx` (envolve `{children}`, chamado a partir de `src/app/layout.tsx`)                                                                                     |
| `src/shared/RouteError/RouteError.tsx`                                                   | `src/app/error.tsx` (error boundary do App Router) + componente mantido                                                                                                             |
| `src/hooks/`, `src/interfaces/`, `src/services/`, `src/lib/`                             | mesmos caminhos sob `src/` - portados quase sem mudança (agnósticos de framework)                                                                                                   |
| `src/shared/*` (ConfirmDialog, ErrorMessage, Footer, FormPage, Icon, Spinner, StateForm) | mesmos caminhos - viram Client Components (`'use client'`)                                                                                                                          |
| `src/index.css`                                                                          | `src/app/globals.css`                                                                                                                                                               |
| `src/vite-env.d.ts`                                                                      | `next-env.d.ts` (gerado pelo Next)                                                                                                                                                  |
| `vite.config.ts`                                                                         | `next.config.ts`                                                                                                                                                                    |
| `@tailwindcss/vite` (plugin no `vite.config.ts`)                                         | `postcss.config.mjs` (integração Tailwind via PostCSS)                                                                                                                              |
| `eslint.config.js`                                                                       | `eslint.config.mjs` (`eslint-config-next`)                                                                                                                                          |
| `tsconfig.app.json` + `tsconfig.node.json`                                               | `tsconfig.json` único                                                                                                                                                               |
| — (sem API route)                                                                        | `src/app/api/estados/route.ts` (proxy GET para `/estado/paginado` do backend - único endpoint provado; demais chamadas seguem indo direto pro `NEXT_PUBLIC_API_URL`, ver gap na PR) |
| `vercel.json` (rewrites/CSP)                                                             | removido - CSP movido para `headers()` em `next.config.ts`                                                                                                                          |
| `vitest.config.ts` (via `@vitejs/plugin-react`)                                          | `vitest.config.ts` (mantido Vitest, não `next/jest`)                                                                                                                                |
| `playwright.config.ts` (baseURL porta 5173)                                              | `playwright.config.ts` (baseURL porta 3000)                                                                                                                                         |
| `scripts/generate-version.mjs` (`prebuild`)                                              | mesmo caminho, mesmo hook `prebuild`                                                                                                                                                |

Specs (`*.spec.tsx`/`*.spec.ts`) acompanham cada arquivo portado no mesmo
caminho relativo. Deviations não cobertas pela tabela (uso de
`window.location.assign` no handler de 401 do `httpClient.ts`, mocks de
`next/navigation` e `next/link` nos testes) estão documentadas inline no
código e na descrição do PR #56.
