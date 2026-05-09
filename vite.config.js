import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? (command === 'serve' ? '/' : '/Edwin_portfolio/'),
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
}))
