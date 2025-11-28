import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      entry: 'src/index.tsx'
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ],
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    // Use esbuild for faster minification (terser is too slow)
    minify: 'esbuild',
    // Target modern browsers for smaller output
    target: 'es2020',
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Disable sourcemaps for smaller output
    sourcemap: false
  },
  esbuild: {
    // ⚠️ TEMPORARILY ENABLE CONSOLE FOR DEBUGGING (normally drop: ['console', 'debugger'])
    // drop: ['console', 'debugger'],
    // Tree shaking optimization
    treeShaking: true,
    // Remove legal comments
    legalComments: 'none',
    // Target modern JavaScript
    target: 'es2020',
    // Minify options
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['hono', 'zod'],
    exclude: ['@sentry/node', '@sentry/browser']
  }
})
