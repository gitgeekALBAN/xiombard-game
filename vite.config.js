import { defineConfig } from 'vite';
import { buildInfo } from './build-info.js';

// Relative base so the build works on GitHub Pages under /<repo-name>/
export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(buildInfo()) }, // shown in the corner of the page
  build: { target: 'es2022' },
});
