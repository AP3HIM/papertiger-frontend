import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    svgr(),
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
