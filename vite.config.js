import { defineConfig } from 'vite';

export default defineConfig({
  base: '/linknit/',
  root: './',
  publicDir: 'public',
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true
  }
});
