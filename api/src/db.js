import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portfolio',
  user: process.env.DB_USER || 'portfolio',
  password: process.env.DB_PASSWORD,
})

export async function query(text, params) {
  const { rows } = await pool.query(text, params)
  return rows
}
