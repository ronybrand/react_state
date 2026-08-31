# CLAUDE.md

## Before committing

Whenever you create or edit files outside the normal `npm run lint`/`npm run format` flow (e.g. `.github/workflows/*.yml`, `.github/dependabot.yml` written directly via Write/Edit), run `npx prettier --write <file>` before committing. CI runs `npm run format:check` and fails on quote/indentation style that doesn't match Prettier's — this already happened with manually written workflow YAML files.

Husky's `lint-staged` hook only formats files staged in the current commit; don't rely on it to catch formatting in files created in earlier commits.

## dependabot.yml — `ignore` rules

Each major-bump `ignore` rule in `.github/dependabot.yml` fixes a real (not theoretical) broken `npm ci`/lint. See the comment next to each rule for why — don't duplicate that reasoning here, keep it in one place so it can't drift out of sync.

`.github/workflows/dependabot-ignore-check.yml` (monthly + manually triggerable via `workflow_dispatch` in the Actions tab) re-evaluates those rules and opens/updates a single tracking issue when one becomes removable. Don't remove an `ignore` rule without first letting dependabot open the bump PR and confirming CI passes. When you add a new `ignore` rule, add a matching check to that workflow.

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
