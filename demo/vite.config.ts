import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: '/alpha-video-kit/',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  publicDir: '../public',
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
});
