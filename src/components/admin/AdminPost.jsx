import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { listPosts, createPost, updatePost, deletePost as deletePostById } from '../../supabase/posts'
import ImageUploader from './ImageUploader'

export default function AdminPost() {
  const empty = { slug: '', title: '', excerpt: '', content: '', tag: '', cover_url: '' }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    const data = await listPosts()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const payload = {
      slug: form.slug || null,
      title: form.title || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      tag: form.tag || null,
      cover_url: form.cover_url || null,
    }
    try {
      if (editingId) {
        await updatePost(editingId, payload)
        setMsg('Updated')
        setEditingId(null)
        setForm(empty)
        fetchData()
      } else {
        await createPost(payload)
        setMsg('Inserted')
        setForm(empty)
        fetchData()
      }
    } catch (error) {
      setMsg(error.message || 'Operation failed')
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    setForm({ slug: row.slug || '', title: row.title || '', excerpt: row.excerpt || '', content: row.content || '', tag: row.tag || '', cover_url: row.cover_url || '' })
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post?')) return
    try {
      await deletePostById(id)
      fetchData()
    } catch (error) {
      setMsg(`Delete failed: ${error.message}`)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-5 rounded-xl border border-white/10 shadow">
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} />
        <input className="px-3 py-2 rounded bg-white/10" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="Tag" value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})} />
        <div className="md:col-span-2">
          <ImageUploader label="Cover image" bucket="Postimg" pathPrefix="covers" value={form.cover_url} onChange={(url)=>setForm({...form, cover_url:url})} />
        </div>
        <input className="px-3 py-2 rounded bg-white/10 md:col-span-2" placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})} />
        <textarea className="px-3 py-2 rounded bg-white/10 md:col-span-2" rows={6} placeholder="Content (Markdown or HTML)" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} />
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
                <th className="p-2">Published</th>
                <th className="p-2">Title</th>
                <th className="p-2">Tag</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2 whitespace-nowrap">{new Date(it.published_at || it.created_at).toLocaleDateString()}</td>
                  <td className="p-2">{it.title}</td>
                  <td className="p-2">{it.tag}</td>
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
