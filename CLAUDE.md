# CLAUDE.md

## Before committing

Whenever you create or edit files outside the normal `npm run lint`/`npm run format` flow (e.g. `.github/workflows/*.yml`, `.github/dependabot.yml` written directly via Write/Edit), run `npx prettier --write <file>` before committing. CI runs `npm run format:check` and fails on quote/indentation style that doesn't match Prettier's — this already happened with manually written workflow YAML files.

Husky's `lint-staged` hook only formats files staged in the current commit; don't rely on it to catch formatting in files created in earlier commits.

## dependabot.yml — `ignore` rules

Each major-bump `ignore` rule in `.github/dependabot.yml` fixes a real (not theoretical) broken `npm ci`/lint. See the comment next to each rule for why — don't duplicate that reasoning here, keep it in one place so it can't drift out of sync.

There are currently no `ignore` rules: the ones that existed pre-Next.js-migration (`eslint`/`@eslint/js`/`typescript`/`eslint-plugin-react-hooks` peer-dependency traps) were about packages that are no longer direct dependencies — `eslint-config-next` bundles its own equivalents now. `.github/workflows/dependabot-ignore-check.yml` (the workflow that used to re-evaluate them) was removed along with the rules it checked; if a similar peer-dependency trap resurfaces through `eslint-config-next` or another dependency, add both a new `ignore` rule (with its own comment explaining the real breakage) and a matching automated check, following the pattern the removed workflow used.

## Coverage gate

`codecov.yml` sets a 90% project / 80% patch coverage target, enforced via the
`codecov/project` and `codecov/patch` PR status checks (requires the Codecov
GitHub App to be installed on the repo — a token-only upload doesn't post PR
statuses). Branch protection on `master` requires `build`, `lint`, `test`,
`analyze`.

## CI (`.github/workflows/`)

- `ci.yml`: `lint` (format:check + eslint), `test` (vitest + coverage → Codecov), `build` — all run on PR and push to `master`.
- `codeql.yml`: security scan, runs on PR/push/weekly.
- `dependabot-auto-merge.yml`: auto-merges only non-major dependabot PRs, gated on required checks.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
