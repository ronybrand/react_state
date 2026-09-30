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
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    // git can fail here for reasons unrelated to the build itself - e.g.
    // a Docker container job (the e2e workflow's playwright container)
    // where the checked-out repo is owned by a different user than the
    // one running the build, which Git's post-CVE-2022-24765 "dubious
    // ownership" check refuses to touch. The footer's commit label is
    // informational, not worth failing the whole build over.
    return 'unknown';
  }
}

const version = {
  commit: shortCommit(),
  buildDate: new Date().toISOString(),
};

writeFileSync('public/version.json', JSON.stringify(version, null, 2) + '\n');
