# CLAUDE.md

## Before committing

Whenever you create or edit files outside the normal `npm run lint`/`npm run format` flow (e.g. `.github/workflows/*.yml`, `.github/dependabot.yml` written directly via Write/Edit), run `npx prettier --write <file>` before committing. CI runs `npm run format:check` and fails on quote/indentation style that doesn't match Prettier's — this already happened with manually written workflow YAML files.

Husky's `lint-staged` hook only formats files staged in the current commit; don't rely on it to catch formatting in files created in earlier commits.

## dependabot.yml — `ignore` rules

Each major-bump `ignore` rule in `.github/dependabot.yml` fixes a real (not theoretical) broken `npm ci`/lint. See the comment next to each rule for why — don't duplicate that reasoning here, keep it in one place so it can't drift out of sync.

There are currently two `ignore` rules, both major-bump traps through `eslint-config-next`'s bundled `typescript-eslint` / `eslint-plugin-react` (`typescript` and `eslint`). `.github/workflows/dependabot-ignore-check.yml` runs `scripts/check-dependabot-ignore-rules.sh` monthly and opens (or refreshes) an issue titled "Dependabot ignore rules can be relaxed" only when a rule is tighter than it needs to be - either the newest release is now supported (drop the rule) or only an older major is (narrow it to `versions: ['>=X']` instead of ignoring every major). It closes that issue again once nothing is left to relax and stays silent otherwise, so no open issue means the rules are as tight as needed (the signals are always in the job summary). If you add another `ignore` rule, add its own comment explaining the real breakage **and** extend that script with the matching check, or the rule will never be re-evaluated.

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
