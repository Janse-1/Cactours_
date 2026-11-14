import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')
          if (normalizedId.includes('/node_modules/gsap/')) {
            return 'animation-vendor'
          }
          if (!normalizedId.includes('/node_modules/three/src/')) return

          const threeEngineDirectories = [
            '/renderers/',
            '/materials/',
            '/nodes/',
            '/objects/',
            '/scenes/',
            '/cameras/',
            '/lights/',
            '/extras/',
          ]
          if (normalizedId.endsWith('/extras/ImageUtils.js')) return 'three-core'
          if (threeEngineDirectories.some((directory) => normalizedId.includes(directory))) {
            return 'three-engine'
          }
          return 'three-core'
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
