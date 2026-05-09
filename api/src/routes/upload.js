import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = req.params.bucket || 'misc'
    const folder = req.params.folder || ''
    const dir = path.join(process.env.UPLOADS_DIR || './uploads', bucket, folder)
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 10)
    cb(null, `${ts}-${rand}${path.extname(file.originalname)}`)
  }
})

const ALLOWED_MIME = /^image\/(jpeg|png|gif|webp|svg\+xml|avif)$/

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.test(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Only image files are allowed'), { status: 400 }))
  },
})

router.post('/:bucket/:folder?', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  const bucket = req.params.bucket
  const folder = req.params.folder || ''
  const publicPath = `/uploads/${bucket}/${folder ? folder + '/' : ''}${req.file.filename}`
  res.json({ url: publicPath, path: publicPath })
})

router.delete('/:bucket/*', requireAuth, (req, res) => {
  const filePath = path.join(process.env.UPLOADS_DIR || './uploads', req.params.bucket, req.params[0])
  try {
    fs.unlinkSync(filePath)
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'File not found' })
  }
})

export default router
