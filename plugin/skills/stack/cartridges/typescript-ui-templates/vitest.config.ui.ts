import { defineConfig } from 'vitest/config'

// UI projects run TWO test projects:
//  - node:    non-UI logic (the base typescript cartridge config)
//  - browser: component tests in a real DOM (truer than jsdom for layout/interaction)
export default defineConfig({
  test: {
    projects: [
      {
        // Non-UI logic — mirrors the base typescript cartridge.
        test: {
          name: 'node',
          include: ['tests/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Presentational components, colocated triples.
        test: {
          name: 'browser',
          include: ['src/components/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/components/**'],
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
  },
})
