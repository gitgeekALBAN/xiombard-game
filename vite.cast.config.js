import { defineConfig } from 'vite';

// Builds the cast page on its own (npm run build:cast), so it stays a single self-contained bundle.
export default defineConfig({
  base: './',
  build: { target: 'es2022', outDir: 'dist-cast', rollupOptions: { input: 'cast.html' } },
});
