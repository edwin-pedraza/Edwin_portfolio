import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { listPosts, createPost, updatePost, deletePost as deletePostById } from '../../supabase/posts'
import { supabase } from '../../supabase/client'
import sanitizeHtml from '../../utils/sanitizeHtml'
import ImageUploader from './ImageUploader'
import FileUploader from './FileUploader'
import RichTextEditor from './RichTextEditor'

const MAX_GALLERY_IMAGES = 3
const MAX_TECH_TAGS = 8

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeExternalUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function sanitizeTechTags(list) {
  const results = []
  const seen = new Set()
  if (!Array.isArray(list)) return results

  const addTag = (value) => {
    const tag = String(value || '').trim()
    if (!tag) return
    const key = tag.toLowerCase()
    if (seen.has(key) || results.length >= MAX_TECH_TAGS) return
    seen.add(key)
    results.push(tag)
  }

  list.forEach((value) => {
    if (typeof value === 'string' && value.includes(',')) {
      value.split(',').forEach(addTag)
    } else {
      addTag(value)
    }
  })
  return results
}

function extractTechTagsFromInput(value) {
  if (!value) return []
  return sanitizeTechTags(String(value).split(','))
}

export default function AdminPost({ accent }) {
  const empty = {
    title: '',
    excerpt: '',
    content: '',
    cover_url: '',
    project_url: '',
    download_label: '',
    download_url: '',
    gallery_urls: [],
    tech_tags: [],
    portfolio_featured: false,
    portfolio_order: 999,
  }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [techInput, setTechInput] = useState('')

  async function fetchData() {
    setLoading(true)
    const data = await listPosts()
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  function resetFormValues() {
    setForm(empty)
    setTechInput('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    const gallery = Array.isArray(form.gallery_urls) ? form.gallery_urls.map((url) => (url || '').trim()).filter(Boolean) : []
    const projectLink = normalizeExternalUrl(form.project_url || '')
    const downloadLink = normalizeExternalUrl(form.download_url || '')
    const techTags = sanitizeTechTags(form.tech_tags || [])
    const categoryString = techTags.join(', ')
    const slugValue = form.title ? slugify(form.title) : ''
    const payload = {
      slug: slugValue || null,
      title: form.title || null,
      excerpt: form.excerpt || null,
      content: sanitizeHtml(form.content) || null,
      tag: categoryString || null,
      cover_url: form.cover_url || null,
      project_url: projectLink || null,
      download_label: form.download_label || null,
      download_url: downloadLink || null,
      gallery_urls: gallery,
      tech_tags: techTags,
      portfolio_featured: Boolean(form.portfolio_featured),
      portfolio_order: Number.isFinite(form.portfolio_order) ? form.portfolio_order : 999,
    }
    try {
      if (editingId) {
        await updatePost(editingId, payload)
        setMsg('Updated')
        setEditingId(null)
        resetFormValues()
        fetchData()
      } else {
        await createPost(payload)
        setMsg('Inserted')
        resetFormValues()
        fetchData()
      }
    } catch (error) {
      setMsg(error.message || 'Operation failed')
    }
    setSaving(false)
  }

  function handleEdit(row) {
    setEditingId(row.id)
    const techTags = sanitizeTechTags(row.tech_tags || [])
    setForm({
      title: row.title || '',
      excerpt: row.excerpt || '',
      content: sanitizeHtml(row.content || ''),
      cover_url: row.cover_url || '',
      project_url: row.project_url || '',
      download_label: row.download_label || '',
      download_url: row.download_url || '',
      gallery_urls: Array.isArray(row.gallery_urls) ? row.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : [],
      tech_tags: techTags,
      portfolio_featured: Boolean(row.portfolio_featured),
      portfolio_order: typeof row.portfolio_order === 'number' ? row.portfolio_order : 999,
    })
    setTechInput(techTags.join(', '))
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
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800" placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
        <div className="md:col-span-2">
          <ImageUploader label="Cover image" bucket="Postimg" pathPrefix="covers" value={form.cover_url} onChange={(url)=>setForm({...form, cover_url:url})} />
        </div>
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2" placeholder="Excerpt" value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})} />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2" placeholder="Project link (https://...)" value={form.project_url} onChange={e=>setForm({...form, project_url:e.target.value})} />
        <input className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800" placeholder="Download label (e.g. Deck, Resume)" value={form.download_label} onChange={e=>setForm({...form, download_label:e.target.value})} />
        <div className="md:col-span-2">
          <FileUploader label="Download file URL" value={form.download_url} onChange={(value)=>setForm({...form, download_url:value})} />
        </div>
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">Show in portfolio projects</p>
              <p className="text-xs text-slate-500">Feature this post as a project card on your portfolio page.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={Boolean(form.portfolio_featured)}
                onChange={(event) => setForm((prev) => ({ ...prev, portfolio_featured: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300"
              />
              Featured
            </label>
          </div>
          {form.portfolio_featured && (
            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Display order</label>
              <input
                type="number"
                min={1}
                className="w-24 rounded-2xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2"
                value={form.portfolio_order ?? 999}
                onChange={(event) => setForm((prev) => ({ ...prev, portfolio_order: Number(event.target.value) || 999 }))}
              />
            </div>
          )}
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Technologies used</label>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2"
            placeholder="e.g. React, Supabase"
            value={techInput}
            onChange={(e) => {
              const value = e.target.value
              setTechInput(value)
              const parsed = extractTechTagsFromInput(value)
              setForm((prev) => ({
                ...prev,
                tech_tags: parsed,
              }))
            }}
          />
          <p className="text-xs text-slate-500">Separate technologies with commas. Up to {MAX_TECH_TAGS} entries.</p>
        </div>
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
          {editingId && <button type="button" className="px-4 py-2 rounded bg-gray-600 text-white" onClick={()=>{setEditingId(null); resetFormValues()}}>Cancel</button>}
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
                <th className="p-2">Tag & stack</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-t border-white/10">
                  <td className="p-2 whitespace-nowrap">{new Date(it.published_at || it.created_at).toLocaleDateString()}</td>
                  <td className="p-2">{it.title}</td>
                  <td className="p-2">
                    <div>{it.tag}</div>
                    {Array.isArray(it.tech_tags) && it.tech_tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {it.tech_tags.slice(0, MAX_TECH_TAGS).map((tag) => (
                          <span key={`${it.id}-${tag}`} className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
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
