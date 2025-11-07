import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { listPosts, createPost, updatePost, deletePost as deletePostById } from '../../supabase/posts'
import { supabase } from '../../supabase/client'
import sanitizeHtml from '../../utils/sanitizeHtml'
import ImageUploader from './ImageUploader'
import RichTextEditor from './RichTextEditor'

const MAX_GALLERY_IMAGES = 3

function normalizeExternalUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default function AdminPost({ accent }) {
  const empty = { slug: '', title: '', excerpt: '', content: '', tag: '', cover_url: '', project_url: '', gallery_urls: [] }
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
    const gallery = Array.isArray(form.gallery_urls) ? form.gallery_urls.map((url) => (url || '').trim()).filter(Boolean) : []
    const projectLink = normalizeExternalUrl(form.project_url || '')
    const payload = {
      slug: form.slug || null,
      title: form.title || null,
      excerpt: form.excerpt || null,
      content: sanitizeHtml(form.content) || null,
      tag: form.tag || null,
      cover_url: form.cover_url || null,
      project_url: projectLink || null,
      gallery_urls: gallery,
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
    setForm({
      slug: row.slug || '',
      title: row.title || '',
      excerpt: row.excerpt || '',
      content: sanitizeHtml(row.content || ''),
      tag: row.tag || '',
      cover_url: row.cover_url || '',
      project_url: row.project_url || '',
      gallery_urls: Array.isArray(row.gallery_urls) ? row.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : [],
    })
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

  const galleryList = Array.isArray(form.gallery_urls) ? form.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []

  function addGalleryImageSlot() {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []
      if (current.length >= MAX_GALLERY_IMAGES) return prev
      return { ...prev, gallery_urls: [...current, ''] }
    })
  }

  function updateGalleryImageSlot(index, value) {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []
      if (index < 0 || index >= current.length) return prev
      const next = [...current]
      next[index] = value
      return { ...prev, gallery_urls: next }
    })
  }

  function removeGalleryImageSlot(index) {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []
      if (index < 0 || index >= current.length) return prev
      const next = current.filter((_, idx) => idx !== index)
      return { ...prev, gallery_urls: next }
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Blog Posts</h2>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800" placeholder="Slug" value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})} />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2" placeholder="Tag" value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})} />
        <div className="md:col-span-2">
          <ImageUploader label="Cover image" bucket="Postimg" pathPrefix="covers" value={form.cover_url} onChange={(url)=>setForm({...form, cover_url:url})} />
        </div>
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2" placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})} />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2" placeholder="Project link (https://...)" value={form.project_url} onChange={e=>setForm({...form, project_url:e.target.value})} />
        <div className="md:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Additional gallery images</label>
            <button type="button" onClick={addGalleryImageSlot} disabled={galleryList.length >= MAX_GALLERY_IMAGES} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50">
              Add image
            </button>
          </div>
          {galleryList.length === 0 && <p className="text-sm text-slate-500">Add up to {MAX_GALLERY_IMAGES} supporting screenshots for this project.</p>}
          {galleryList.map((url, idx) => (
            <div key={`admin-gallery-${idx}`} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
              <ImageUploader label={`Gallery image ${idx + 1}`} bucket="Postimg" pathPrefix="post-gallery" value={url} onChange={(value)=>updateGalleryImageSlot(idx, value)} />
              <div className="mt-2 flex justify-end">
                <button type="button" onClick={()=>removeGalleryImageSlot(idx)} className="text-xs font-semibold text-rose-500">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Post body</label>
          <RichTextEditor
            value={form.content}
            onChange={(html)=>setForm({...form, content: html})}
            accent={accent}
            placeholder="Write, format, and link content. Use the toolbar above to style your post."
          />
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

AdminPost.propTypes = {
  accent: PropTypes.object,
}
