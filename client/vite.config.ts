import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service worker only active in production build; dev uses browser's network directly.
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'pwa-192.svg', 'pwa-512.svg', 'apple-touch-icon.svg'],
      manifest: {
        name: 'Resolver — Service Desk',
        short_name: 'Resolver',
        description: 'KSG Multi-Campus Service Desk',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/technician',
        icons: [
          { src: 'pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
          { src: 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
    }),
  ],
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
