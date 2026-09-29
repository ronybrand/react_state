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
