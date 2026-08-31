# CLAUDE.md

## Antes de commitar

Sempre que criar ou editar arquivos fora do fluxo normal do `npm run lint`/`npm run format` (ex: `.github/workflows/*.yml`, `.github/dependabot.yml` escritos direto via Write/Edit), rode `npx prettier --write <arquivo>` antes de commitar. O CI roda `npm run format:check` e falha em arquivos com aspas/indentação fora do padrão do Prettier — já aconteceu com YAMLs de workflow criados manualmente.

O hook do husky (`lint-staged`) só formata arquivos que estão staged no commit atual; não confie nele para pegar formatação de arquivos criados em commits anteriores.

## dependabot.yml — regras de `ignore`

Há 4 regras de `ignore` para major bumps em `.github/dependabot.yml`, cada uma resolvendo um `npm ci`/lint quebrado real (não teórico):

- `eslint` major — `eslint-plugin-jsx-a11y@6.10.2` (última versão publicada) trava peer em `eslint ^9`.
- `@eslint/js` major — precisa andar em lockstep com `eslint` (senão `@eslint/js@10` exige `eslint ^10` sozinho e quebra do outro lado).
- `typescript` major — `typescript-eslint@8.68.0` trava peer em `typescript <6.1.0`. Mesma restrição existe no repo irmão `angular_estado`.
- `eslint-plugin-react-hooks` major — não é peer-dep, é bug funcional: o `recommended-latest` da v7.x exporta config no formato eslintrc antigo (`plugins` como array), incompatível com flat config do ESLint 9. Reproduz com `Oops! Something went wrong!` no `npm run lint`.

Existe um workflow mensal (`.github/workflows/dependabot-ignore-check.yml`, também disparável manualmente via `workflow_dispatch` na aba Actions) que reavalia essas 4 travas e abre/atualiza uma issue única no repo quando alguma pode ser removida. Não remova uma regra de `ignore` sem antes deixar o dependabot abrir o PR de bump e confirmar que o CI passa.

## Repo irmão

`angular_estado` (sibling folder em `angular-projects/`) tem a mesma stack de CI (dependabot, CodeQL, auto-merge) — útil como referência, mas as constraints de peer dependency são diferentes por causa das libs usadas (React usa `eslint-plugin-jsx-a11y`, Angular usa `angular-eslint`). Não assuma que uma regra resolvida lá se aplica igual aqui sem checar a árvore de dependências.

## CI (`.github/workflows/`)

- `ci.yml`: `lint` (format:check + eslint), `test` (vitest + coverage → Codecov), `build` — todos rodam em PR e push para `master`.
- `codeql.yml`: scan de segurança, roda em PR/push/semanal.
- `dependabot-auto-merge.yml`: auto-merge só para PRs do dependabot que não sejam major bump, gated pelos checks obrigatórios.
