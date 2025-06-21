import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"
import { resolve } from 'path'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    {
      name: 'copy-redirects',
      closeBundle() {
        const from = path.resolve(__dirname, 'public/_redirects')
        const to = path.resolve(__dirname, 'dist/_redirects')
        fs.copyFileSync(from, to)
        console.log('✅ Copied _redirects to dist/')
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
