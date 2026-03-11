import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), visualizer({
    filename: 'rollup-visualiser-stats.html',
    template: 'treemap',
    gzipSize: true,
    brotliSize: true,
  })],
  resolve: {
    alias: {
      '@': '/src',
      three: path.resolve(__dirname, 'node_modules/three'),
      'three-stdlib': path.resolve(__dirname, 'node_modules/three-stdlib')
    }
  },
  optimizeDeps: {
    include: ['three-stdlib']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei', 'three-stdlib'],
          'vendor-ui': ['react-toastify', 'leva', 'motion'],
          'vendor-crypto': ['tweetnacl', 'tweetnacl-util'],
          'vendor-state': ['jotai', 'tunnel-rat', 'react-use-websocket'],
          'vendor-other': ['howler', '@yudiel/react-qr-scanner', 'lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    allowedHosts: [
      '.trycloudflare.com',
      '.ngrok-free.app',
    ]
  }
})
