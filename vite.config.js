import { defineConfig } from 'vite';
import { buildMeta, buildJson } from './build-info.js';

const meta = buildMeta();
// Relative base so the build works on GitHub Pages under /<repo-name>/
export default defineConfig({
  base: './',
  define: {
    __BUILD__: JSON.stringify(meta.label), // shown in the corner of the page
    __BUILD_N__: JSON.stringify(meta.n),   // compared with build.json to offer an update
  },
  plugins: [buildJson(meta)],
  build: { target: 'es2022' },
});
