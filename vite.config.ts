import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/']
    }
  }
});
