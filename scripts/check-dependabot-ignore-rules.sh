#!/usr/bin/env bash
# Checks whether the major-bump `ignore` rules in .github/dependabot.yml can be
# relaxed. Each rule exists because a newer major of a package breaks
# `npm ci`/lint through a dependency bundled by eslint-config-next (see the
# comment next to each rule for the real breakage); a rule can be relaxed once
# the peer ranges of those dependencies accept a newer major.
#
# For each package it finds the highest stable version that satisfies EVERY
# relevant peer range, then prints one line per package and, when that version
# is a major ahead of what package.json declares:
#   ACTIONABLE:<pkg>                   - the newest release is supported: drop the rule
#   PARTIAL:<pkg>:<highest>:<blocked>  - only an older major is supported (<highest>);
#                                        narrow the rule to `versions: ['>=<blocked>']`
#                                        instead of ignoring every major
# No ACTIONABLE/PARTIAL line means the rules are still exactly as tight as needed.
# Run locally with: bash scripts/check-dependabot-ignore-rules.sh
set -euo pipefail

major_of() { npx --yes semver -c "$1" | cut -d. -f1; }
declared() { node -p "require('./package.json').devDependencies['$1']"; }

# Stable versions only (a prerelease would otherwise look like "the newest").
stable_versions() {
  npm view "$1" versions --json | node -e '
    const v = JSON.parse(require("fs").readFileSync(0, "utf8"));
    console.log(v.filter((x) => /^\d+\.\d+\.\d+$/.test(x)).join(" "));'
}

# analyze <package> <peer-package>:<peer-field>...
# The highest stable <package> version satisfying every listed peer range.
analyze() {
  local pkg=$1
  shift
  local declared_range latest all range_args=() spec range
  declared_range=$(declared "$pkg")
  latest=$(npm view "$pkg" version)
  all=$(stable_versions "$pkg")

  for spec in "$@"; do
    range=$(npm view "${spec%%:*}" "peerDependencies.${spec##*:}")
    echo "$pkg: ${spec%%:*} peer '$range'"
    range_args+=(-r "$range")
  done

  local highest blocked=""
  # shellcheck disable=SC2086 # $all is a deliberate space-separated list
  highest=$(npx --yes semver "${range_args[@]}" $all | tail -1 || true)
  echo "$pkg: declared $declared_range, latest $latest, highest allowed by peers: ${highest:-none}"

  if [ -n "$highest" ] && [ "$(major_of "$highest")" -gt "$(major_of "$declared_range")" ]; then
    if [ "$highest" = "$latest" ]; then
      echo "ACTIONABLE:$pkg"
    else
      # shellcheck disable=SC2086
      blocked=$(npx --yes semver $all | awk -v h="$highest" 'f { print; exit } $0 == h { f = 1 }')
      echo "PARTIAL:$pkg:$highest:$blocked"
    fi
  fi
}

# typescript: bounded by the bundled typescript-eslint
analyze typescript typescript-eslint:typescript

# eslint: bounded by every bundled package that peers on it
analyze eslint typescript-eslint:eslint eslint-plugin-react:eslint eslint-config-next:eslint
exit 0
