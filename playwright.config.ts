import { defineConfig } from '@playwright/test';

const port = Number(process.env.PW_PORT ?? 5199);
export default defineConfig({
  testDir: 'e2e',
  outputDir: 'e2e-out',
  timeout: 90000,
  workers: 2,
  reporter: [['line']],
  use: { baseURL: `http://localhost:${port}/`, trace: 'off', viewport: { width: 1366, height: 768 } },
  webServer: {
    command: `npx vite preview --port ${port} --strictPort`,
    port,
    reuseExistingServer: true,
    env: { PW_PORT: String(port) },
  },
});
