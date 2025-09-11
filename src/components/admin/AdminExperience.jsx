import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

export default function AdminExperience() {
  const empty = { order: '', title: '', company_name: '', icon_url: '', icon_bg: '#383E56', date: '', achievement_subtitle: 'Achievements', achievement_points: '', respon_subtitle: 'Responsibilities', respon_points: '' }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    const { data, error } = await supabase.from('experience').select('*').order('order')
    if (!error) setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function toArray(text) {
    return (text || '').split('\n').map(s => s.trim()).filter(Boolean)
  }

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const payload = {
      order: form.order ? Number(form.order) : null,
      title: form.title,
      company_name: form.company_name,
      icon_url: form.icon_url || null,
      icon_bg: form.icon_bg || '#383E56',
      date: form.date,
      achievement_subtitle: form.achievement_subtitle || 'Achievements',
      achievement_points: toArray(form.achievement_points),
      respon_subtitle: form.respon_subtitle || 'Responsibilities',
      respon_points: toArray(form.respon_points),
    }
    if (editingId) {
      const { error } = await supabase.from('experience').update(payload).eq('id', editingId)
      if (error) setMsg(`Update failed: ${error.message}`); else { setMsg('Updated'); setEditingId(null); setForm(empty); fetchData() }
    } else {
      const { error } = await supabase.from('experience').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`); else { setMsg('Inserted'); setForm(empty); fetchData() }
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    setForm({
      order: row.order ?? '',
      title: row.title || '',
      company_name: row.company_name || '',
      icon_url: row.icon_url || '',
      icon_bg: row.icon_bg || '#383E56',
      date: row.date || '',
      achievement_subtitle: row.achievement_subtitle || 'Achievements',
      achievement_points: Array.isArray(row.achievement_points) ? row.achievement_points.join('\n') : (row.achievement_points || ''),
      respon_subtitle: row.respon_subtitle || 'Responsibilities',
      respon_points: Array.isArray(row.respon_points) ? row.respon_points.join('\n') : (row.respon_points || ''),
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('experience').delete().eq('id', id)
    if (error) setMsg(`Delete failed: ${error.message}`)
    else fetchData()
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Experience</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/10 shadow">
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Order" value={form.order} onChange={e=>setForm({...form, order:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Company Name" value={form.company_name} onChange={e=>setForm({...form, company_name:e.target.value})} />
        <div className="md:col-span-2">
          <ImageUploader label="Icon" pathPrefix="experience" value={form.icon_url} onChange={(url)=>setForm({...form, icon_url:url})} />
        </div>
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Icon BG (#383E56)" value={form.icon_bg} onChange={e=>setForm({...form, icon_bg:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Date (e.g., 2015 - 2016)" value={form.date} onChange={e=>setForm({...form, date:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="Achievement subtitle" value={form.achievement_subtitle} onChange={e=>setForm({...form, achievement_subtitle:e.target.value})} />
        <textarea className="px-3 py-2 rounded bg-white/10 md:col-span-2" rows={4} placeholder="One achievement per line" value={form.achievement_points} onChange={e=>setForm({...form, achievement_points:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="Responsibilities subtitle" value={form.respon_subtitle} onChange={e=>setForm({...form, respon_subtitle:e.target.value})} />
        <textarea className="px-3 py-2 rounded bg-white/10 md:col-span-2" rows={4} placeholder="One responsibility per line" value={form.respon_points} onChange={e=>setForm({...form, respon_points:e.target.value})} />
        <div className="md:col-span-2 flex gap-2">
          <button disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded" type="submit">{editingId ? (saving ? 'Updating…' : 'Update') : (saving ? 'Creating…' : 'Create')}</button>
          {editingId && <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white" onClick={()=>{setEditingId(null); setForm(empty)}}>Cancel</button>}
          {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
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
                <th className="p-2">Company</th>
                <th className="p-2">Date</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2">{it.order}</td>
                  <td className="p-2">{it.title}</td>
                  <td className="p-2">{it.icon_url ? <img src={it.icon_url} alt="icon" className="w-9 h-9 rounded object-cover"/> : <span className="opacity-60">—</span>}</td>
                  <td className="p-2">{it.company_name}</td>
                  <td className="p-2">{it.date}</td>
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
