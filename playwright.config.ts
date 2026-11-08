import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ux',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4178',
    locale: 'es-MX',
    browserName: 'chromium',
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH, args: ['--no-sandbox'] }
      : undefined,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4178 --strictPort',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    env: { ...process.env, VITE_API_URL: 'https://api.example.com' },
    timeout: 120_000,
  },
});
