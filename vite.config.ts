import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: { outDir: 'dist', target: 'es2022' },
  server: { port: Number(process.env.PW_PORT ?? 5173), strictPort: true },
  preview: { port: Number(process.env.PW_PORT ?? 5173), strictPort: true },
  test: { include: ['tests/**/*.test.ts'], testTimeout: 60000 },
});
