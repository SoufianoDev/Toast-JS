import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // `*.test.mjs` belongs to Vitest; `*.spec.mjs` belongs to Playwright (tests/browser).
    include: ['tests/**/*.test.mjs'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      // Numeric thresholds wait for a stable baseline (DEC-024).
    },
  },
});
