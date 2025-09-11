import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

export default function AdminTestimonial() {
  const empty = { order: '', testimonial: '', name: '', designation: '', company: '', image_url: '' }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('testimonial').select('*').order('order')
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const payload = {
      order: form.order ? Number(form.order) : null,
      testimonial: form.testimonial || null,
      name: form.name || null,
      designation: form.designation || null,
      company: form.company || null,
      image_url: form.image_url || null,
    }
    if (editingId) {
      const { error } = await supabase.from('testimonial').update(payload).eq('id', editingId)
      if (error) setMsg(`Update failed: ${error.message}`); else { setMsg('Updated'); setEditingId(null); setForm(empty); fetchData() }
    } else {
      const { error } = await supabase.from('testimonial').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`); else { setMsg('Inserted'); setForm(empty); fetchData() }
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    setForm({
      order: row.order ?? '',
      testimonial: row.testimonial || '',
      name: row.name || '',
      designation: row.designation || '',
      company: row.company || '',
      image_url: row.image_url || '',
    })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('testimonial').delete().eq('id', id)
    if (error) setMsg(`Delete failed: ${error.message}`)
    else fetchData()
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Testimonials</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/10 shadow">
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Order" value={form.order} onChange={e=>setForm({...form, order:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Designation" value={form.designation} onChange={e=>setForm({...form, designation:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Company" value={form.company} onChange={e=>setForm({...form, company:e.target.value})} />
        <div className="md:col-span-2">
          <ImageUploader label="Avatar" pathPrefix="testimonial" value={form.image_url} onChange={(url)=>setForm({...form, image_url:url})} />
        </div>
        <textarea className="px-3 py-2 rounded bg-white/10 md:col-span-2" rows={3} placeholder="Testimonial" value={form.testimonial} onChange={e=>setForm({...form, testimonial:e.target.value})} />
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
                <th className="p-2">Name</th>
                <th className="p-2">Company</th>
                <th className="p-2">Avatar</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2">{it.order}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.company}</td>
                  <td className="p-2">{it.image_url ? <img src={it.image_url} alt="avatar" className="w-9 h-9 rounded-full object-cover" /> : <span className="opacity-60">—</span>}</td>
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
