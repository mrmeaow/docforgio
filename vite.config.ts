import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@stores': resolve(__dirname, './src/stores'),
      '@db': resolve(__dirname, './src/db'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@templates': resolve(__dirname, './src/templates'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
  },
  server: {
    port: 3000,
    open: true,
  },
})
