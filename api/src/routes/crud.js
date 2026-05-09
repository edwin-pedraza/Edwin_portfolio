import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const SAFE_COL = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function validateKeys(keys) {
  if (!keys.length) throw Object.assign(new Error('No fields provided'), { status: 400 })
  for (const k of keys) {
    if (!SAFE_COL.test(k)) throw Object.assign(new Error(`Invalid field: ${k}`), { status: 400 })
  }
}

function crudRouter(table, { publicGet = true, orderBy = '"order"', extraGet } = {}) {
  const router = Router()

  router.get('/', async (req, res) => {
    try {
      const sql = extraGet || `SELECT * FROM ${table} ORDER BY ${orderBy} ASC NULLS LAST`
      res.json(await query(sql))
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  router.get('/:id', async (req, res) => {
    try {
      const rows = await query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id])
      if (!rows.length) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  router.post('/', requireAuth, async (req, res) => {
    try {
      const keys = Object.keys(req.body)
      validateKeys(keys)
      const vals = Object.values(req.body)
      const cols = keys.map(k => `"${k}"`).join(', ')
      const phs = keys.map((_, i) => `$${i + 1}`).join(', ')
      const rows = await query(
        `INSERT INTO ${table} (${cols}) VALUES (${phs}) RETURNING *`,
        vals
      )
      res.status(201).json(rows[0])
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  })

  router.put('/:id', requireAuth, async (req, res) => {
    try {
      const keys = Object.keys(req.body)
      validateKeys(keys)
      const vals = Object.values(req.body)
      const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ')
      const rows = await query(
        `UPDATE ${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`,
        [...vals, req.params.id]
      )
      if (!rows.length) return res.status(404).json({ error: 'Not found' })
      res.json(rows[0])
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message })
    }
  })

  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id])
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  return router
}

export default crudRouter
