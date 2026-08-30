// Overwrites the dev placeholder with the real commit/date of the build -
// shown in the footer to check whether a deploy is up to date. Vercel doesn't
// keep full git history in the build container, so prefer its env var over
// running git.
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

function shortCommit() {
  if (process.env.VERCEL_GIT_COMMIT_SHA) {
    return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  }
  return execSync('git rev-parse --short HEAD').toString().trim();
}

const version = {
  commit: shortCommit(),
  buildDate: new Date().toISOString(),
};

writeFileSync('public/version.json', JSON.stringify(version, null, 2) + '\n');
