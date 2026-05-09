import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const orderBy = req.query.orderBy || 'published_at'
    const asc = req.query.ascending === 'true' ? 'ASC' : 'DESC'
    res.json(await query(`SELECT * FROM post ORDER BY ${orderBy} ${asc}`))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/prev-next', async (req, res) => {
  try {
    const { publishedAt } = req.query
    if (!publishedAt) return res.json({ prev: null, next: null })
    const [prevRows, nextRows] = await Promise.all([
      query(`SELECT id, title, cover_url FROM post WHERE published_at < $1 ORDER BY published_at DESC LIMIT 1`, [publishedAt]),
      query(`SELECT id, title, cover_url FROM post WHERE published_at > $1 ORDER BY published_at ASC LIMIT 1`, [publishedAt]),
    ])
    res.json({ prev: prevRows[0] || null, next: nextRows[0] || null })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/related/:tag', async (req, res) => {
  try {
    const { tag } = req.params
    const { excludeId, limit = 3 } = req.query
    res.json(await query(
      `SELECT id, title, excerpt, cover_url, tag FROM post WHERE tag = $1 AND id != $2 ORDER BY published_at DESC LIMIT $3`,
      [tag, excludeId, limit]
    ))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const rows = await query(`SELECT * FROM post WHERE id = $1`, [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const keys = Object.keys(req.body)
    const vals = Object.values(req.body)
    const cols = keys.map(k => `"${k}"`).join(', ')
    const phs = keys.map((_, i) => `$${i + 1}`).join(', ')
    const rows = await query(`INSERT INTO post (${cols}) VALUES (${phs}) RETURNING id`, vals)
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const keys = Object.keys(req.body)
    const vals = Object.values(req.body)
    const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
    const rows = await query(
      `UPDATE post SET ${sets} WHERE id = $${keys.length + 1} RETURNING id`,
      [...vals, req.params.id]
    )
    if (!rows.length) throw new Error('No rows updated')
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query(`DELETE FROM post WHERE id = $1`, [req.params.id])
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
