import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://0.0.0.0:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Heavy document libs — only used in lazy-loaded export pages
            if (id.includes('/docx/') || id.includes('/xlsx/'))
              return 'docs-vendor';
            // Charts — only used in lazy-loaded dashboard/reports
            if (id.includes('/recharts/') || id.includes('/d3-'))
              return 'charts-vendor';
            // All other vendor deps in one chunk (avoids circular deps)
            return 'vendor';
          }
        },
      },
    },
  },
}) 