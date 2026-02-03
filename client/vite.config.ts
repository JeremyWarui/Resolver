import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  server: {
    proxy: {
      "/data.json": {
        target: "http://localhost:3000", // Target the http-server
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunk
          'ui-vendor': [
            '@tanstack/react-table', 
            'sonner', 
            'react-hook-form', 
            '@hookform/resolvers',
            'zod'
          ],
          
          // Chart/visualization libraries
          'charts-vendor': ['recharts'],
          
          // Utilities and icons chunk  
          'utils-vendor': ['clsx', 'tailwind-merge', 'lucide-react', 'axios']
        }
      }
    },
    // Increase chunk size warning limit to 1000kb (current is 500kb)
    chunkSizeWarningLimit: 1000
  }
})
