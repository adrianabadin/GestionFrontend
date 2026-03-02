import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 *
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',

  // Timeout por test: 30 segundos
  timeout: 30 * 1000,

  // Expect timeout: 5 segundos (para waitFor, toBeVisible, etc.)
  expect: {
    timeout: 5000
  },

  // Ejecutar tests en paralelo
  fullyParallel: true,

  // Fallar el build si quedaron test.only
  forbidOnly: !!process.env.CI,

  // Reintentar tests que fallan en CI
  retries: process.env.CI ? 2 : 0,

  // Número de workers (paralelización)
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Configuración compartida para todos los tests
  use: {
    // Base URL (ajustar según tu entorno)
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    // Trace para debugging (solo en retry)
    trace: 'on-first-retry',

    // Screenshot solo en failure
    screenshot: 'only-on-failure',

    // Video solo en retry
    video: 'retain-on-failure',

    // Timeout de navegación
    navigationTimeout: 10 * 1000,

    // Timeout de acción
    actionTimeout: 5 * 1000,
  },

  // Configuración de browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile viewports (opcional)
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  // Servidor de desarrollo local (auto-start)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para que Next.js compile
  },
});
