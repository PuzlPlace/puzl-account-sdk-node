import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/package/**', 'node_modules/**'],
    environment: 'node',
    restoreMocks: true,
  },
});
