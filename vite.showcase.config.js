import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills()
  ],
  root: './showcase',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  resolve: {
    // No alias needed with direct relative imports
  },
  base: '/rdf-tree/', // GitHub Pages base path
  server: {
    port: 3000
  }
})
