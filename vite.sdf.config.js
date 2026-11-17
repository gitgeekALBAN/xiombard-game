import { defineConfig } from 'vite';

// Builds the shader crew page on its own (npm run build:sdf), so it stays a single self-contained bundle.
export default defineConfig({
  base: './',
  build: { target: 'es2022', outDir: 'dist-sdf', rollupOptions: { input: 'sdf.html' } },
});
