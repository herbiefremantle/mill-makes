import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the built app works from any folder or sub-path (Netlify, GitHub Pages, a USB stick...)
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Mill Makes',
        short_name: 'Mill Makes',
        description: 'Step-by-step build guides for scaffold-board furniture.',
        theme_color: '#2b2620',
        background_color: '#f6f1e9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
        // Photos you drop into public/images later are cached the first time they load
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'CacheFirst',
            options: { cacheName: 'mill-photos', expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
})
