import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Develop at root, but build for GitHub Pages (/Edwin_portfolio/)
  base: command === 'serve' ? '/' : '/Edwin_portfolio/',
}))
