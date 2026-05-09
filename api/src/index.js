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
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (_, res) => res.sendFile(path.join(publicDir, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API running on :${PORT}`))
