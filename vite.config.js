import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const from = resolve('public/_redirects')
        const to = resolve('dist/_redirects')
        if (existsSync(from)) {
          copyFileSync(from, to)
          console.log('✅ Copied _redirects to dist/')
        } else {
          console.warn('⚠️  _redirects file not found in /public')
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  publicDir: 'public',
})
