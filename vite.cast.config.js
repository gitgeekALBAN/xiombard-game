import { defineConfig } from 'vite';
import { buildInfo } from './build-info.js';

// Builds the cast page on its own (npm run build:cast), so it stays a single self-contained bundle.
export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(buildInfo()) }, // shown in the corner of the page
  build: { target: 'es2022', outDir: 'dist-cast', rollupOptions: { input: 'cast.html' } },
});
