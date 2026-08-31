# CLAUDE.md

## Before committing

Whenever you create or edit files outside the normal `npm run lint`/`npm run format` flow (e.g. `.github/workflows/*.yml`, `.github/dependabot.yml` written directly via Write/Edit), run `npx prettier --write <file>` before committing. CI runs `npm run format:check` and fails on quote/indentation style that doesn't match Prettier's — this already happened with manually written workflow YAML files.

Husky's `lint-staged` hook only formats files staged in the current commit; don't rely on it to catch formatting in files created in earlier commits.

## dependabot.yml — `ignore` rules

There are 4 major-bump `ignore` rules in `.github/dependabot.yml`, each fixing a real (not theoretical) broken `npm ci`/lint. See the comments next to each rule in that file for why — don't duplicate that reasoning here, keep it in one place so it can't drift out of sync.

There's a monthly workflow (`.github/workflows/dependabot-ignore-check.yml`, also triggerable manually via `workflow_dispatch` in the Actions tab) that re-evaluates these 4 constraints and opens/updates a single tracking issue when one becomes removable. Don't remove an `ignore` rule without first letting dependabot open the bump PR and confirming CI passes.

## Sibling repo

`angular_estado` (sibling folder under `angular-projects/`) has the same CI stack (dependabot, CodeQL, auto-merge) — useful as a reference, but its peer-dependency constraints differ because of the libraries in use (React uses `eslint-plugin-jsx-a11y`, Angular uses `angular-eslint`). Don't assume a rule solved there applies here without checking this repo's own dependency tree.

## CI (`.github/workflows/`)

- `ci.yml`: `lint` (format:check + eslint), `test` (vitest + coverage → Codecov), `build` — all run on PR and push to `master`.
- `codeql.yml`: security scan, runs on PR/push/weekly.
- `dependabot-auto-merge.yml`: auto-merges only non-major dependabot PRs, gated on required checks.
