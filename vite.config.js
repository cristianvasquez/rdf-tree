import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build configuration
    return {
      plugins: [
        vue(),
        nodePolyfills({
          include: ['path', 'stream', 'util'],
          exclude: ['http'],
          globals: {
            Buffer: true,
            global: true,
            process: true,
          },
          overrides: {
            fs: 'memfs',
          },
          protocolImports: true,
        })
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.js'),
          name: 'RdfTree',
          fileName: (format) => `rdf-tree.${format}.js`
        },
        rollupOptions: {
          external: ['vue', 'naive-ui', 'pinia'],
          output: {
            globals: {
              vue: 'Vue',
              'naive-ui': 'NaiveUI',
              pinia: 'Pinia'
            }
          }
        }
      }
    }
  }

  // Development configuration
  return {
    base: './',
    plugins: [
      vue(),
      nodePolyfills({
        include: ['path', 'stream', 'util'],
        exclude: ['http'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        overrides: {
          fs: 'memfs',
        },
        protocolImports: true,
      })
    ]
  }
})