import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    // Scoped to src/ so Vitest doesn't also try to run e2e/*.spec.ts -
    // those use @playwright/test's own test()/describe(), which throws
    // ("did not expect test.describe() to be called here") when collected
    // by Vitest's runner instead of Playwright's.
    include: ['src/**/*.spec.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/**/*.spec.{ts,tsx}'],
    },
  },
});
