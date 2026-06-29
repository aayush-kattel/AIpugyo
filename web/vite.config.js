import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'AI Pugyo — Nepal Travel AI',
        short_name: 'AI Pugyo',
        description: "Nepal's AI-powered tourist assistant",
        theme_color: '#9d4300',
        background_color: '#fff8f4',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
  globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
},
    }),
  ],
})