import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Stale build output left on disk from the pre-migration Vite app
    // (already gitignored, not tracked - just not part of eslint's
    // default ignore list, so lint picked up its bundled/minified JS).
    'dist/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    // Locally installed agent skills (gitignored, see .gitignore) - not
    // part of this app, shouldn't be linted as if it were.
    '.agents/**',
    '.claude/**',
  ]),
]);

export default eslintConfig;
