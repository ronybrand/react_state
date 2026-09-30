#!/usr/bin/env bash
# Checks whether the major-bump `ignore` rules in .github/dependabot.yml are
# still needed. Each rule exists because the newest major of a package breaks
# `npm ci`/lint through a dependency bundled by eslint-config-next (see the
# comment next to each rule for the real breakage); the rule can go once that
# dependency's declared peer range accepts the newest major.
#
# Prints one line per signal, then "ACTIONABLE:<package>" for every rule that
# can be removed now. No ACTIONABLE line means both rules are still needed.
# Run locally with: bash scripts/check-dependabot-ignore-rules.sh
set -euo pipefail

# semver CLI exit code: 0 when the version satisfies the range.
satisfies() { npx --yes semver -r "$2" "$1" >/dev/null 2>&1; }
major_of() { npx --yes semver -c "$1" | cut -d. -f1; }
declared() { node -p "require('./package.json').devDependencies['$1']"; }

# --- typescript: newest TS vs. the peer range of the bundled typescript-eslint
ts_declared=$(declared typescript)
ts_latest=$(npm view typescript version)
ts_range=$(npm view typescript-eslint peerDependencies.typescript)
ts_ok=no
if satisfies "$ts_latest" "$ts_range" && [ "$(major_of "$ts_latest")" -gt "$(major_of "$ts_declared")" ]; then
  ts_ok=yes
fi
echo "typescript: declared $ts_declared, latest $ts_latest, typescript-eslint peer '$ts_range' -> removable: $ts_ok"

# --- eslint: newest ESLint vs. every bundled package that peers on it
eslint_declared=$(declared eslint)
eslint_latest=$(npm view eslint version)
eslint_ok=yes
for pkg in typescript-eslint eslint-plugin-react eslint-config-next; do
  range=$(npm view "$pkg" peerDependencies.eslint)
  if satisfies "$eslint_latest" "$range"; then verdict=accepts; else verdict=rejects; eslint_ok=no; fi
  echo "eslint: $pkg peer '$range' $verdict $eslint_latest"
done
if [ "$(major_of "$eslint_latest")" -le "$(major_of "$eslint_declared")" ]; then
  eslint_ok=no
fi
echo "eslint: declared $eslint_declared, latest $eslint_latest -> removable: $eslint_ok"

[ "$ts_ok" = yes ] && echo "ACTIONABLE:typescript"
[ "$eslint_ok" = yes ] && echo "ACTIONABLE:eslint"
exit 0
