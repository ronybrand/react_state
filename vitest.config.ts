import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/navigation': path.resolve(__dirname, 'node_modules/next/navigation.js'),
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    server: {
      deps: {
        inline: ['next-intl'],
      },
    },
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
        'src/testUtils.tsx',
        '.next/',
        // Framework/tooling config, not app logic - nothing exercises these
        // at test time, so v8's coverage report otherwise counts every line
        // as a patch-coverage miss on any PR that touches them.
        'eslint.config.mjs',
        'next.config.ts',
        'vitest.config.ts',
        'postcss.config.mjs',
        'playwright.config.ts',
        'next-env.d.ts',
      ],
    },
    exclude: ['node_modules/**', '.next/**', 'e2e/**'],
  },
});
