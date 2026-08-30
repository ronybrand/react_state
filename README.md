# react_estado

[![CI](https://github.com/ronybrand/react_estado/actions/workflows/ci.yml/badge.svg)](https://github.com/ronybrand/react_estado/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ronybrand/react_estado/graph/badge.svg)](https://codecov.io/gh/ronybrand/react_estado)

CRUD de unidades federativas do Brasil (estados) — sigla, nome e timestamps de
cadastro/atualização — consumindo uma API REST em `/api/estado`.

## Stack

- [React 19](https://react.dev/) + TypeScript (strict) + [Vite](https://vite.dev/)
- [TanStack Query](https://tanstack.com/query) para data-fetching, cache e invalidação
- [Axios](https://axios-http.com/) com interceptors de request-id e timeout/retry
- [React Router](https://reactrouter.com/) (data router) com rotas lazy-loaded
- [React Hook Form](https://react-hook-form.com/) para validação de formulário
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/react) para testes de componente
- ESLint (typescript-eslint + react-hooks + jsx-a11y) + Prettier + Husky/lint-staged

## Estrutura

```
src/
├── paginas/            # ListaEstado, CriarEstado, EditarEstado (rotas)
├── compartilhado/
│   ├── FormEstado/       # form de criar/editar (React Hook Form)
│   ├── ErrorMsg/          # alerta de erro (role="alert") + hook useErrorMsg
│   ├── Spinner/            # indicador de carregamento (role="status")
│   ├── Icon/                # ícones SVG centralizados por nome
│   └── RotaErro/            # fallback de erro de renderização por rota
├── hooks/               # hooks de TanStack Query (listar, buscar, criar, atualizar, excluir)
├── lib/                 # httpClient (axios + interceptors), extratores de erro, formatarData
├── interfaces/          # tipo Estado
├── services/            # estadoService (chamadas HTTP)
└── router.tsx            # rotas com lazy loading
```

### Convenções

- Componentes de função + hooks, sem classes.
- Cache de dados via TanStack Query (`hooks/`) em vez de fetch manual por
  página — cada mutação invalida a query afetada, mantendo a lista
  sincronizada entre navegações.
- `httpClient` (`lib/httpClient.ts`) centraliza timeout (15s) e retry (até 2
  tentativas, só em GET) via interceptors do axios; o header `X-Request-Id`
  é gerado uma vez por ação e preservado nas tentativas de retry, para
  correlacionar todas elas como uma única ação nos logs do backend.
- Acessibilidade: `aria-invalid`/`aria-describedby` nos campos de formulário,
  `aria-label` dinâmico nos botões de ação por linha, `role="status"`/
  `role="alert"` para carregamento/erro.
- Erros de request (query/mutation) são tratados por página via
  `useErrorMsg`; erros de renderização não previstos são capturados pelo
  `errorElement` do React Router (`RotaErro`), evitando tela em branco.

## Pré-requisitos

Requer um backend da API de Estado rodando localmente em
`http://localhost:8090` — sem ele, `npm run dev` sobe a UI mas as chamadas a
`/api/*` falham (a lista mostra a mensagem de erro após esgotar o retry).

## Development server

```bash
npm run dev
```

O Vite faz proxy de `/api` para `http://localhost:8090` (ver
`vite.config.ts`). Abra `http://localhost:5173/`.

## Build

```bash
npm run build
```

Gera os artefatos em `dist/`.

## Lint e formatação

```bash
npm run lint          # eslint
npm run format:check  # prettier --check
npm run format        # prettier --write
```

Husky + lint-staged rodam `eslint --fix` e `prettier --write` no pre-commit.

## Testes

```bash
npm test               # vitest
npm run test:coverage  # vitest run --coverage
```

Vitest + React Testing Library, cobrindo os fluxos de listar, criar, editar,
excluir, a validação do formulário compartilhado, os componentes de suporte
(`Icon`, `Spinner`, `ErrorMsg`/`useErrorMsg`, `RotaErro`) e utilitários de
`lib/`. Cobertura reportada no CI via Codecov, com gate de 90% (projeto) /
80% (patch).
