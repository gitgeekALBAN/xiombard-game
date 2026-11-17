import { defineConfig } from 'vite';

// Builds the puppet lineup page on its own (npm run build:showcase), so it stays a single self-contained bundle.
export default defineConfig({
  base: './',
  build: { target: 'es2022', outDir: 'dist-showcase', rollupOptions: { input: 'showcase.html' } },
});
