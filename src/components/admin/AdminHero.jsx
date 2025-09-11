import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'

const MODES = ['laptop','donut','scatter','logo']

export default function AdminHero() {
  const empty = { default_mode: 'laptop', logo_text: 'EDWIN • DEV • DATA', headline_words: 'Professional Coder.\nFull Stack Developer.\nUI Designer.' }
  const [row, setRow] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('hero_config').select('*').order('created_at').limit(1)
    const first = (data && data[0]) || null
    setRow(first)
    setForm({
      default_mode: first?.default_mode || empty.default_mode,
      logo_text: first?.logo_text || empty.logo_text,
      headline_words: Array.isArray(first?.headline_words) ? first.headline_words.join('\n') : (first?.headline_words || empty.headline_words),
    })
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      default_mode: form.default_mode,
      logo_text: form.logo_text || null,
      headline_words: form.headline_words ? form.headline_words.split('\n').map(s=>s.trim()).filter(Boolean) : null,
    }
    if (row?.id) {
      const { error } = await supabase.from('hero_config').update(payload).eq('id', row.id)
      if (error) setMsg(`Update failed: ${error.message}`); else { setMsg('Updated'); fetchData() }
    } else {
      const { error } = await supabase.from('hero_config').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`); else { setMsg('Inserted'); fetchData() }
    }
    setSaving(false)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Hero</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/10 shadow">
          <div>
            <label className="block text-sm opacity-80 mb-1">Default 3D mode</label>
            <select className="w-full px-3 py-2 rounded bg-white/10" value={form.default_mode} onChange={e=>setForm({...form, default_mode:e.target.value})}>
              {MODES.map((m)=> (<option key={m} value={m}>{m}</option>))}
            </select>
          </div>
          <input className="px-3 py-2 rounded bg-white/10" placeholder="Logo text (for 'logo' mode)" value={form.logo_text} onChange={e=>setForm({...form, logo_text:e.target.value})} />
          <div className="md:col-span-2">
            <label className="block text-sm opacity-80 mb-1">Headline words (typewriter) — one per line</label>
            <textarea className="px-3 py-2 rounded bg:white/10 bg-white/10 w-full" rows={5} value={form.headline_words} onChange={e=>setForm({...form, headline_words:e.target.value})} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded" type="submit">{saving ? 'Saving…' : (row?.id ? 'Update' : 'Create')}</button>
            {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
          </div>
        </form>
      )}
    </div>
  )
}

