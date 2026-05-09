import pg from 'pg'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'portfolio',
  user: process.env.DB_USER || 'portfolio',
  password: process.env.DB_PASSWORD,
})

const DATA_DIR = process.env.DATA_DIR || path.resolve('../migration/data')
const API_URL = process.env.API_URL || 'http://localhost:3001'
const SUPA_BASE = 'https://plqvyrdvuinsmiudmwek.supabase.co/storage/v1/object/public'

function rewriteUrl(url) {
  if (!url || typeof url !== 'string') return url
  return url.replace(new RegExp(SUPA_BASE.replace('.', '\\.'), 'g'), `${API_URL}/uploads`)
            .replace(/\?v=[^"&\s]*/g, '')
}

function rewriteDeep(obj) {
  if (typeof obj === 'string') return rewriteUrl(obj)
  if (Array.isArray(obj)) return obj.map(rewriteDeep)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, rewriteDeep(v)]))
  }
  return obj
}

async function run() {
  const withSeed = process.env.SEED_DATA === 'true'
  const client = await pool.connect()
  try {
    console.log('Creating schema...')
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      CREATE TABLE IF NOT EXISTS admin_user (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS profile (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text, profession text, experience text, education text,
        full_name text, github_url text, linkedin_url text,
        about_text text, photo_url text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS education (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int, title text, company_name text,
        icon_url text, icon_bg text DEFAULT '#383E56',
        date text, achievement_subtitle text DEFAULT 'Achievements',
        achievement_points jsonb DEFAULT '[]',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS experience (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int, title text, company_name text,
        icon_url text, icon_bg text DEFAULT '#383E56',
        date text, achievement_subtitle text DEFAULT 'Achievements',
        achievement_points jsonb DEFAULT '[]',
        respon_subtitle text DEFAULT 'Responsibilities',
        respon_points jsonb DEFAULT '[]',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS technology (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int, name text, icon_url text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS testimonial (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int, testimonial text, name text,
        designation text, company text, image_url text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS service (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int, title text, icon_url text, slug text,
        short_description text, focus_areas text, toolset_list text, cta_text text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS hero_config (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        default_mode text, logo_text text,
        headline_words jsonb DEFAULT '[]',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS post (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text UNIQUE, title text, excerpt text, content text,
        tag text, cover_url text, project_url text,
        download_label text, download_url text,
        portfolio_featured boolean DEFAULT false,
        portfolio_order int DEFAULT 999,
        tech_tags jsonb DEFAULT '[]',
        gallery_urls jsonb DEFAULT '[]',
        published_at timestamptz DEFAULT now(),
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        theme jsonb, blog jsonb,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS tag (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        color text DEFAULT 'text-secondary',
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "order" int DEFAULT 999,
        name text NOT NULL,
        description text,
        image_url text,
        model_url text,
        source_code_link text,
        source_link_web text,
        created_at timestamptz DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project_tag (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id uuid REFERENCES project(id) ON DELETE CASCADE,
        tag_id uuid REFERENCES tag(id) ON DELETE CASCADE,
        created_at timestamptz DEFAULT now()
      );
    `)
    console.log('Schema created ✓')

    if (withSeed) {
      const tables = ['profile','education','experience','technology','testimonial','service','hero_config','post','settings']
      for (const table of tables) {
        const file = path.join(DATA_DIR, `${table}.json`)
        if (!fs.existsSync(file)) { console.log(`Skipping ${table} (no file)`); continue }
        const rows = JSON.parse(fs.readFileSync(file, 'utf8'))
        await client.query(`DELETE FROM ${table}`)
        for (const row of rows) {
          const clean = rewriteDeep(row)
          const keys = Object.keys(clean).filter(k => k !== 'author_id' && k !== 'theme_color')
          const vals = keys.map(k => {
            const v = clean[k]
            return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v
          })
          const cols = keys.map(k => `"${k}"`).join(', ')
          const phs  = keys.map((_, i) => `$${i+1}`).join(', ')
          await client.query(`INSERT INTO ${table} (${cols}) VALUES (${phs}) ON CONFLICT (id) DO NOTHING`, vals)
        }
        console.log(`Imported ${table}: ${rows.length} rows ✓`)
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'edw.pedraza@gmail.com'
    const adminPass  = process.env.ADMIN_PASSWORD || 'changeme123'
    const hash = await bcrypt.hash(adminPass, 10)
    await client.query(
      `INSERT INTO admin_user (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      [adminEmail, hash]
    )
    console.log(`Admin user created: ${adminEmail} ✓`)
    console.log('\nMigration complete!')
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(err => { console.error(err); process.exit(1) })
