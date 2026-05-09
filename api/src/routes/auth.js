import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const [user] = await query('SELECT * FROM admin_user WHERE email = $1', [email])
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token, user: { email: user.email } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.json({ user: null })
  try {
    const user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    res.json({ user })
  } catch {
    res.json({ user: null })
  }
})

export default router
