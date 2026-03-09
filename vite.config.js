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
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
              return 'react-vendor';
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge') || id.includes('lucide-react') || id.includes('cmdk'))
              return 'ui-vendor';
            if (id.includes('recharts') || id.includes('d3-'))
              return 'charts-vendor';
            if (id.includes('docx') || id.includes('xlsx'))
              return 'docs-vendor';
            if (id.includes('framer-motion'))
              return 'animation-vendor';
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod'))
              return 'forms-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
}) 