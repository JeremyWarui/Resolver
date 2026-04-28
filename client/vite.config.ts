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
        manualChunks: (id: string) => {
          // Vendor chunk for React and core libraries
          if (id.includes('react') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // UI library chunk
          if (id.includes('@tanstack/react-table') || id.includes('sonner') || 
              id.includes('react-hook-form') || id.includes('@hookform') || 
              id.includes('zod')) {
            return 'ui-vendor';
          }
          // Chart/visualization libraries
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          // Utilities and icons chunk
          if (id.includes('clsx') || id.includes('tailwind-merge') || 
              id.includes('lucide-react') || id.includes('axios')) {
            return 'utils-vendor';
          }
        }
      }
    },
    // Increase chunk size warning limit to 1000kb (current is 500kb)
    chunkSizeWarningLimit: 1000
  }
})
