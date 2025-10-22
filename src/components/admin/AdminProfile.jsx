import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

export default function AdminProfile() {
  const empty = { full_name: '', github_url: '', linkedin_url: '', about_text: '', photo_url: '' }
  const [row, setRow] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('profile').select('*').order('id').limit(1)
    const first = (data && data[0]) || null
    setRow(first)
    setForm({
      full_name: first?.full_name || '',
      github_url: first?.github_url || '',
      linkedin_url: first?.linkedin_url || '',
      about_text: first?.about_text || '',
      photo_url: first?.photo_url || '',
    })
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      full_name: form.full_name || null,
      github_url: form.github_url || null,
      linkedin_url: form.linkedin_url || null,
      about_text: form.about_text || null,
      photo_url: form.photo_url || null,
    }
    if (row?.id) {
      const { error } = await supabase.from('profile').update(payload).eq('id', row.id)
      if (error) setMsg(`Update failed: ${error.message}`); else { setMsg('Updated'); fetchData() }
    } else {
      const { error } = await supabase.from('profile').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`); else { setMsg('Inserted'); fetchData() }
    }
    setSaving(false)
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
          <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Full name" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
          <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="GitHub URL" value={form.github_url} onChange={e=>setForm({...form, github_url:e.target.value})} />
          <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="LinkedIn URL" value={form.linkedin_url} onChange={e=>setForm({...form, linkedin_url:e.target.value})} />
          <div className="md:col-span-2">
            <ImageUploader label="Photo" pathPrefix="profile" value={form.photo_url} onChange={(url)=>setForm({...form, photo_url:url})} />
          </div>
          <textarea className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" rows={6} placeholder="About text (one paragraph per line)" value={form.about_text} onChange={e=>setForm({...form, about_text:e.target.value})} />
          <div className="md:col-span-2 flex gap-2">
            <button disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded" type="submit">{saving ? 'Saving…' : (row?.id ? 'Update' : 'Create')}</button>
            {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
          </div>
        </form>
      )}
    </div>
  )
}
