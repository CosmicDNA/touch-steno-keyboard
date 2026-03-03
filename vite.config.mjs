import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      // ensure all imports of three resolve to the single node_modules copy
      three: path.resolve(__dirname, 'node_modules/three')
    }
  },
  server: {
    allowedHosts: [
      '.trycloudflare.com',
      '.ngrok-free.app',
    ]
  }
})
