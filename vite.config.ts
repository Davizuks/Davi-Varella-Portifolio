/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const spotifyCard = (showOffline: boolean) => ({
  target: 'https://spotify-github-profile.kittinanx.com',
  changeOrigin: true,
  rewrite: () =>
    `/api/view?uid=31xpxag2vrv2jhiufbogqwf56b6a&cover_image=false&theme=novatorem&show_offline=${showOffline}`,
})

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/now-playing': spotifyCard(true),
      '/api/last-played': spotifyCard(false),
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    passWithNoTests: true,
  },
})
