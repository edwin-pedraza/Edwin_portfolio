import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
dotenv.config()

const UNSAFE_JWT_DEFAULTS = new Set(['changeme_set_in_prod', 'changeme', 'secret', ''])
if (!process.env.JWT_SECRET || UNSAFE_JWT_DEFAULTS.has(process.env.JWT_SECRET)) {
  console.warn('WARNING: JWT_SECRET is using an unsafe default. Set a strong secret in your .env file.')
}

import authRoutes from './routes/auth.js'
import postsRoutes from './routes/posts.js'
import uploadRoutes from './routes/upload.js'
import crudRouter from './routes/crud.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '10mb' }))

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads')
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1y',
  immutable: true,
}))

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/post',  postsRoutes)
app.use('/api/upload', uploadRoutes)

app.use('/api/profile',    crudRouter('profile',    { orderBy: 'created_at' }))
app.use('/api/education',  crudRouter('education',  { orderBy: '"order"' }))
app.use('/api/experience', crudRouter('experience', { orderBy: '"order"' }))
app.use('/api/technology', crudRouter('technology', { orderBy: '"order"' }))
app.use('/api/testimonial',crudRouter('testimonial',{ orderBy: '"order"' }))
app.use('/api/service',    crudRouter('service',    { orderBy: '"order"' }))
app.use('/api/hero-config', crudRouter('hero_config', { orderBy: 'created_at' }))
app.use('/api/hero_config', crudRouter('hero_config', { orderBy: 'created_at' }))
app.use('/api/settings',    crudRouter('settings',    { orderBy: 'created_at' }))
app.use('/api/project',     crudRouter('project',     { orderBy: '"order"' }))
app.use('/api/tag',         crudRouter('tag',         { orderBy: 'name' }))
app.use('/api/project_tag', crudRouter('project_tag', { orderBy: 'created_at' }))

app.get('/api/health', (_, res) => res.json({ ok: true }))

// 404 for unknown /api/* routes — must be BEFORE the SPA catch-all
app.use('/api', (_, res) => res.status(404).json({ error: 'Not found' }))

// Serve React SPA — must be AFTER /api routes
const publicDir = path.join(__dirname, '../public')
const assetsDir = path.join(publicDir, 'assets')

function servePrecompressedAsset(req, res, next) {
  if (!/\bgzip\b/.test(req.headers['accept-encoding'] || '')) return next()
  if (!/\.(js|css)$/.test(req.path)) return next()

  const requestedPath = path.normalize(req.path).replace(/^(\.\.[/\\])+/, '')
  const filePath = path.join(assetsDir, requestedPath)
  const gzipPath = `${filePath}.gz`

  if (!filePath.startsWith(assetsDir) || !fs.existsSync(gzipPath)) return next()

  res.setHeader('Content-Encoding', 'gzip')
  res.setHeader('Vary', 'Accept-Encoding')
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.type(path.extname(filePath))
  res.sendFile(gzipPath)
}

if (fs.existsSync(publicDir)) {
  app.use('/assets', servePrecompressedAsset, express.static(assetsDir, {
    maxAge: '1y',
    immutable: true,
  }))
  app.use(express.static(publicDir, {
    maxAge: '1h',
  }))
  app.get('*', (_, res) => res.sendFile(path.join(publicDir, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API running on :${PORT}`))
