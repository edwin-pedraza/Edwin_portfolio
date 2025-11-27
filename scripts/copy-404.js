import { cpSync, existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const indexPath = join(distDir, 'index.html')
const fallbackPath = join(distDir, '404.html')

if (!existsSync(indexPath)) {
  console.error('build output not found at dist/index.html; run `npm run build` first')
  process.exit(1)
}

mkdirSync(distDir, { recursive: true })
cpSync(indexPath, fallbackPath)
console.log('Created dist/404.html for SPA fallback')
