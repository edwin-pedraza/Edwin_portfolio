import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

const defaultForm = {
  order: '',
  title: '',
  slug: '',
  icon_url: '',
  short_description: '',
  focus_areas: '',
  toolset_list: '',
  cta_text: '',
}

const slugify = (value = '') =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export default function AdminService() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...defaultForm })
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('service').select('*').order('order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const effectiveSlug = useMemo(() => form.slug || slugify(form.title), [form.slug, form.title])

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const payload = {
      order: form.order ? Number(form.order) : null,
      title: form.title,
      slug: effectiveSlug || null,
      icon_url: form.icon_url || null,
      short_description: form.short_description || null,
      focus_areas: form.focus_areas || null,
      toolset_list: form.toolset_list || null,
      cta_text: form.cta_text || null,
    }
    if (editingId) {
      const { error } = await supabase.from('service').update(payload).eq('id', editingId)
      if (error) setMsg(`Update failed: ${error.message}`); else { setMsg('Updated'); setEditingId(null); setForm({ ...defaultForm }); fetchData() }
    } else {
      const { error } = await supabase.from('service').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`); else { setMsg('Inserted'); setForm({ ...defaultForm }); fetchData() }
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    setForm({
      order: row.order ?? '',
      title: row.title || '',
      slug: row.slug || '',
      icon_url: row.icon_url || '',
      short_description: row.short_description || '',
      focus_areas: row.focus_areas || '',
      toolset_list: row.toolset_list || '',
      cta_text: row.cta_text || '',
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('service').delete().eq('id', id)
    if (error) setMsg(`Delete failed: ${error.message}`)
    else fetchData()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">Services</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Order" value={form.order} onChange={e=>setForm({...form, order:e.target.value})} />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" placeholder="Slug (optional)" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} />
        <div className="md:col-span-3">
          <ImageUploader label="Icon" pathPrefix="service" value={form.icon_url} onChange={(url)=>setForm({...form, icon_url:url})} />
        </div>
        <textarea className="md:col-span-3 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" rows={3} placeholder="Short description" value={form.short_description} onChange={e=>setForm({...form, short_description:e.target.value})} />
        <textarea className="md:col-span-3 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" rows={3} placeholder="Focus areas (one per line)" value={form.focus_areas} onChange={e=>setForm({...form, focus_areas:e.target.value})} />
        <textarea className="md:col-span-3 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" rows={2} placeholder="Toolset (one per line)" value={form.toolset_list} onChange={e=>setForm({...form, toolset_list:e.target.value})} />
        <textarea className="md:col-span-3 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100" rows={2} placeholder="Call to action" value={form.cta_text} onChange={e=>setForm({...form, cta_text:e.target.value})} />
        <div className="md:col-span-3 flex gap-2 flex-wrap">
          <button disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded" type="submit">{editingId ? (saving ? 'Updating…' : 'Update') : (saving ? 'Creating…' : 'Create')}</button>
          {editingId && <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white" onClick={()=>{setEditingId(null); setForm({ ...defaultForm })}}>Cancel</button>}
          {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
          <div className="text-xs text-slate-500 dark:text-slate-400">Slug preview: <span className="font-mono">{effectiveSlug || 'n/a'}</span></div>
        </div>
      </form>

      <div className="mt-6">
        {loading ? (
          <div>Loading…</div>
        ) : (
          <table className="w-full text-sm rounded-xl overflow-hidden">
            <thead className="text-left opacity-80">
              <tr>
                <th className="p-2">Order</th>
                <th className="p-2">Title</th>
                <th className="p-2">Icon</th>
                <th className="p-2">Slug</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2">{it.order}</td>
                  <td className="p-2">{it.title}</td>
                  <td className="p-2">
                    {it.icon_url ? <img src={it.icon_url} alt="icon" className="w-9 h-9 rounded object-cover"/> : <span className="opacity-60">—</span>}
                  </td>
                  <td className="p-2 font-mono text-xs text-slate-500">{it.slug || 'auto'}</td>
                  <td className="p-2 flex gap-2">
                    <button className="px-3 py-1 rounded bg-amber-600 text-white" onClick={()=>handleEdit(it)}>Edit</button>
                    <button className="px-3 py-1 rounded bg-rose-600 text-white" onClick={()=>handleDelete(it.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
