import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

export default function AdminProject() {
  const empty = { order: '', name: '', description: '', image_url: '', model_url: '', source_code_link: '', source_link_web: '' }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [tags, setTags] = useState([])
  const [selectedTags, setSelectedTags] = useState([])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('project').select('*').order('order')
    setItems(data || [])
    const { data: tagRows } = await supabase.from('tag').select('*').order('name')
    setTags(tagRows || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const payload = {
      order: form.order ? Number(form.order) : null,
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      model_url: form.model_url || null,
      source_code_link: form.source_code_link || null,
      source_link_web: form.source_link_web || null,
    }
    if (editingId) {
      const { error } = await supabase.from('project').update(payload).eq('id', editingId)
      if (error) setMsg(`Update failed: ${error.message}`)
      else {
        await syncProjectTags(editingId, selectedTags)
        setMsg('Updated')
        setEditingId(null); setForm(empty); setSelectedTags([]); fetchData()
      }
    } else {
      const { data: inserted, error } = await supabase.from('project').insert(payload).select('id').single()
      if (error) setMsg(`Insert failed: ${error.message}`)
      else {
        await syncProjectTags(inserted.id, selectedTags)
        setMsg('Inserted')
        setForm(empty); setSelectedTags([]); fetchData()
      }
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    setForm({
      order: row.order ?? '',
      name: row.name || '',
      description: row.description || '',
      image_url: row.image_url || '',
      model_url: row.model_url || '',
      source_code_link: row.source_code_link || '',
      source_link_web: row.source_link_web || '',
    })
    loadProjectTags(row.id)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('project').delete().eq('id', id)
    if (error) setMsg(`Delete failed: ${error.message}`)
    else fetchData()
  }

  function toggleTag(tagId) {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t)=>t!==tagId) : [...prev, tagId])
  }

  async function loadProjectTags(projectId) {
    const { data } = await supabase.from('project_tag').select('tag_id').eq('project_id', projectId)
    setSelectedTags((data || []).map((r)=>r.tag_id))
  }

  async function syncProjectTags(projectId, tagIds) {
    await supabase.from('project_tag').delete().eq('project_id', projectId)
    if (tagIds.length) {
      const rows = tagIds.map((tid)=>({ project_id: projectId, tag_id: tid }))
      await supabase.from('project_tag').insert(rows)
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/10 shadow">
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Order" value={form.order} onChange={e=>setForm({...form, order:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        <div className="md:col-span-2">
          <ImageUploader label="Project image" pathPrefix="project" value={form.image_url} onChange={(url)=>setForm({...form, image_url:url})} />
        </div>
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="3D model GLB/GLTF URL (optional)" value={form.model_url} onChange={e=>setForm({...form, model_url:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Source code link" value={form.source_code_link} onChange={e=>setForm({...form, source_code_link:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="Live link" value={form.source_link_web} onChange={e=>setForm({...form, source_link_web:e.target.value})} />
        <textarea className="px-3 py-2 rounded bg-white/10 md:col-span-2" rows={4} placeholder="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
        <div className="md:col-span-2">
          <div className="text-sm opacity-80 mb-1">Tags</div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t)=>(
              <button type="button" key={t.id} onClick={()=>toggleTag(t.id)} className={`px-2 py-1 rounded-full border ${selectedTags.includes(t.id) ? 'bg-emerald-600 border-emerald-500' : 'bg-white/10 border-white/10'}`}>{t.name}</button>
            ))}
          </div>
        </div>
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
                <th className="p-2">Image</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2">{it.order}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.image_url ? <img src={it.image_url} alt="img" className="w-12 h-9 object-cover rounded"/> : <span className="opacity-60">—</span>}</td>
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

      <div className="mt-3 text-xs opacity-80">Tip: Click tags to toggle selection. Add new tags in table <code>tag</code>.</div>
    </div>
  )
}
