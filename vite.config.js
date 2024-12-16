import vue from '@vitejs/plugin-vue'

import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineConfig({
  // server: {
  //   proxy: {
  //     '/sparql': {
  //       target: 'https://endpoint-with-cors/sparql',
  //       changeOrigin: true,
  //       secure: false,
  //       rewrite: (path) => path.replace(/^\/sparql/, '')
  //     },
  //   },
  // },
  plugins: [
    vue(), nodePolyfills({
      include: ['path', 'stream', 'util'], exclude: ['http'], globals: {
        Buffer: true, global: true, process: true,
      }, overrides: {
        fs: 'memfs',
      }, protocolImports: true,
    })],
})
