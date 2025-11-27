import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../../supabase/client'
import sanitizeHtml from '../../../utils/sanitizeHtml'
import useBlogSettings from '../useBlogSettings'
import ImageUploader from '../../admin/ImageUploader'
import FileUploader from '../../admin/FileUploader'
import RichTextEditor from '../../admin/RichTextEditor'
import { buildAccentPalette } from '../../admin/themeUtils'
import { buildHeroTheme } from './heroTheme'
import { combineTagSources } from './tagUtils'
import Footer from './Footer'

const MAX_GALLERY_IMAGES = 3
const MAX_TECH_TAGS = 8

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
    const clean = String(value || '').trim()
    if (!clean) return
    const key = clean.toLowerCase()
    if (seen.has(key) || results.length >= MAX_TECH_TAGS) return
    seen.add(key)
    results.push(clean)
  }

  list.forEach((item) => {
    if (typeof item === 'string' && item.includes(',')) {
      item.split(',').forEach(addTag)
    } else {
      addTag(item)
    }
  })
  return results
}

function extractTechTagsFromInput(value) {
  if (!value) return []
  return sanitizeTechTags(String(value).split(','))
}

export default function BlogDetail2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blog: blogSettings, theme: themeColors } = useBlogSettings()
  const [post, setPost] = useState(null)
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', tag: '', cover_url: '', excerpt: '', content: '', project_url: '', download_label: '', download_url: '', gallery_urls: [], tech_tags: [] })
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [techInput, setTechInput] = useState('')

  const readingTime = useMemo(() => {
    const clean = sanitizeHtml(form.content || post?.content || '')
    const plain = clean.replace(/<[^>]+>/g, ' ')
    const words = plain.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [form.content, post?.content])

  const accent = useMemo(() => buildAccentPalette(themeColors, 'light'), [themeColors])
  const heroTheme = useMemo(() => buildHeroTheme(themeColors, accent.base), [themeColors, accent.base])
  const galleryNavButtonStyle = useMemo(
    () => ({
      backgroundColor: 'rgba(255,255,255,0.95)',
      color: accent.base,
      borderColor: accent.border,
      boxShadow: accent.cardGlow,
      '--tw-ring-color': accent.soft,
    }),
    [accent]
  )
  const safePostContent = useMemo(() => sanitizeHtml(post?.content || ''), [post?.content])
  const galleryList = useMemo(() => (Array.isArray(form.gallery_urls) ? form.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []), [form.gallery_urls])
  const categoryTags = useMemo(() => combineTagSources(post?.tag, post?.tech_tags), [post?.tag, post?.tech_tags])

  const [prevNext, setPrevNext] = useState({ prev: null, next: null })
  const [related, setRelated] = useState([])

  const allowedAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

useEffect(() => {
  if (!editing) {
    const current = Array.isArray(form.tech_tags) ? form.tech_tags : []
    setTechInput(current.join(', '))
  }
}, [editing, form.tech_tags])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('post').select('*').eq('id', id).single()
      if (data) {
        const cleanContent = sanitizeHtml(data.content || '')
        const gallery = Array.isArray(data.gallery_urls) ? data.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []
        const techTags = sanitizeTechTags(data.tech_tags || [])
        setPost({ ...data, content: cleanContent, gallery_urls: gallery, tech_tags: techTags })
        setForm({
          title: data.title || '',
          tag: data.tag || '',
          cover_url: data.cover_url || '',
          excerpt: data.excerpt || '',
          content: cleanContent,
          project_url: data.project_url || '',
      gallery_urls: gallery,
      download_label: data.download_label || '',
      download_url: data.download_url || '',
      tech_tags: techTags,
    })
        setTechInput(techTags.join(', '))

        if (data.published_at) {
          const { data: prev } = await supabase
            .from('post')
            .select('id,title,cover_url')
            .lt('published_at', data.published_at)
            .order('published_at', { ascending: false })
            .limit(1)
          const { data: next } = await supabase
            .from('post')
            .select('id,title,cover_url')
            .gt('published_at', data.published_at)
            .order('published_at', { ascending: true })
            .limit(1)
          setPrevNext({ prev: prev?.[0] || null, next: next?.[0] || null })
        } else {
          setPrevNext({ prev: null, next: null })
        }

        if (data.tag) {
          const { data: rel } = await supabase
            .from('post')
            .select('id,title,excerpt,cover_url,tag')
            .eq('tag', data.tag)
            .neq('id', data.id)
            .order('published_at', { ascending: false })
            .limit(3)
          setRelated(rel || [])
        } else {
          setRelated([])
        }
      }
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    setMsg('')
    const cleanContent = sanitizeHtml(form.content)
    const gallery = galleryList.map((url) => (url || '').trim()).filter(Boolean)
    const projectLink = normalizeExternalUrl(form.project_url || '')
    const techTags = sanitizeTechTags(form.tech_tags || [])
    const categoryString = techTags.join(', ') || form.tag || null
    const payload = {
      title: form.title,
      tag: categoryString,
      cover_url: form.cover_url || null,
      excerpt: form.excerpt || null,
      content: cleanContent || null,
      project_url: projectLink || null,
      download_label: form.download_label || null,
      download_url: form.download_url || null,
      gallery_urls: gallery,
      tech_tags: techTags,
    }
    const { error } = await supabase.from('post').update(payload).eq('id', id)
    if (error) {
      setMsg(error.message || 'Update failed')
    } else {
      setMsg('Updated')
      setEditing(false)
      setPost({ ...post, ...payload, content: cleanContent })
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('post').delete().eq('id', id)
    if (!error) navigate('/blog')
  }

  function addGalleryImageSlot() {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls : []
      if (current.length >= MAX_GALLERY_IMAGES) return prev
      return { ...prev, gallery_urls: [...current, ''] }
    })
  }

  function updateGalleryImageSlot(index, value) {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls : []
      if (index < 0 || index >= current.length) return prev
      const next = [...current]
      next[index] = value
      return { ...prev, gallery_urls: next }
    })
  }

  function removeGalleryImageSlot(index) {
    setForm((prev) => {
      const current = Array.isArray(prev.gallery_urls) ? prev.gallery_urls : []
      if (index < 0 || index >= current.length) return prev
      const next = current.filter((_, idx) => idx !== index)
      return { ...prev, gallery_urls: next }
    })
  }

  function cycleGallery(direction) {
    setGalleryIndex((prev) => {
      if (postGallery.length === 0) return 0
      const next = (prev + direction + postGallery.length) % postGallery.length
      return next
    })
  }

  const canEdit = session && allowedAdminEmails.length > 0 && allowedAdminEmails.includes((session.user?.email || '').toLowerCase())
  const postGallery = Array.isArray(post?.gallery_urls)
    ? post.gallery_urls
        .filter((url) => typeof url === 'string' && url.trim().length > 0)
        .slice(0, MAX_GALLERY_IMAGES)
    : []

  useEffect(() => {
    setGalleryIndex(0)
  }, [post?.id])

  useEffect(() => {
    if (postGallery.length === 0) {
      setGalleryIndex(0)
    } else if (galleryIndex >= postGallery.length) {
      setGalleryIndex(0)
    }
  }, [postGallery.length, galleryIndex])

  const projectLink = post?.project_url ? normalizeExternalUrl(post.project_url) : ''
  const downloadLink = post?.download_url ? normalizeExternalUrl(post.download_url) : ''

  if (!post) {
    return <div className="min-h-screen bg-slate-100 px-6 py-10 text-center text-slate-500">Loading...</div>
  }

  return (
    <div
      className="min-h-screen"
      style={{
        color: '#0f172a',
        backgroundImage: `radial-gradient(60% 60% at -10% -10%, ${accent.softer} 0%, transparent 60%), radial-gradient(50% 50% at 110% 0%, ${accent.soft} 0%, transparent 60%), linear-gradient(180deg, ${accent.lightShell} 0%, #e2e8f0 35%, ${accent.lightShell} 100%)`,
        backgroundColor: accent.lightShell,
      }}
    >
      <div className="relative w-full">
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} className="h-[260px] w-full bg-slate-900/5 object-contain md:h-[360px]" />
        )}
        <div className="absolute inset-0" style={{ backgroundImage: heroTheme.overlay }} />
        <div className="absolute inset-x-0 bottom-6 px-6 md:px-10">
          <div className="mx-auto max-w-5xl">
            <div
              className="inline-flex w-full max-w-3xl flex-col gap-4 rounded-3xl border px-6 py-5 text-white backdrop-blur"
              style={{ backgroundColor: heroTheme.cardBg, borderColor: heroTheme.cardBorder, boxShadow: heroTheme.cardShadow }}
            >
              {categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((token) => (
                    <span
                      key={`hero-tag-${token}`}
                      className="rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em]"
                      style={{ backgroundColor: heroTheme.chipBg, color: heroTheme.chipText }}
                    >
                      {token}
                    </span>
                  ))}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">{post.title}</h1>
                <p className="mt-2 text-sm font-medium text-white/80">
                  {new Date(post.published_at || post.created_at).toLocaleDateString()} · {readingTime} min read
                </p>
              </div>
              {post.excerpt && (
                <p className="text-sm text-white/80">
                  {post.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <button onClick={() => navigate('/blog')} className="text-sm font-medium text-sky-600 hover:text-sky-500">Back to Blog</button>

        <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/50 bg-white/70 px-5 py-4 shadow-lg backdrop-blur">
          <div className="text-sm text-slate-600">
            <div className="font-medium text-slate-900">{blogSettings?.authorName || 'Edwin Pedraza'}</div>
            <div>{blogSettings?.authorTitle || 'Author'}</div>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button onClick={() => setEditing((value) => !value)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                {editing ? 'Close editor' : 'Edit'}
              </button>
              <button onClick={handleDelete} className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400">Delete</button>
            </div>
          )}
        </div>

        {!editing ? (
          <>
            {post.excerpt && (
              <div className="mt-8 rounded-3xl border border-white/70 bg-white/90 p-6 text-lg font-medium leading-relaxed text-slate-700 shadow-xl shadow-slate-900/5 backdrop-blur">
                <p className="text-slate-800">{post.excerpt}</p>
              </div>
            )}
            {categoryTags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <span key={`tech-pill-${tag}`} className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {projectLink && (
              <a
                href={projectLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-between rounded-3xl border border-slate-900/10 bg-slate-900 px-6 py-4 text-white shadow-xl shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/70">Project link</div>
                  <div className="mt-1 text-lg font-semibold">View the live admin experience</div>
                </div>
                <span aria-hidden className="text-2xl">↗</span>
              </a>
            )}
            {downloadLink && (
              <a
                href={downloadLink}
                target="_blank"
                rel="noreferrer"
                download
                className="mt-4 inline-flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-400/40 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/15 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-base">⬇</span>
                <span>{post.download_label || 'Download file'}</span>
              </a>
            )}

            {postGallery.length > 0 && (
              <div className="mt-6">
                <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-lg shadow-slate-900/5">
                  <img
                    src={postGallery[galleryIndex]}
                    alt={`Project showcase ${galleryIndex + 1}`}
                    loading="lazy"
                    className="h-64 w-full object-cover md:h-80 lg:h-[360px]"
                  />
                  {postGallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => cycleGallery(-1)}
                        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition duration-200 hover:-translate-y-[55%] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={galleryNavButtonStyle}
                        aria-label="Previous gallery image"
                      >
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M15 6L9 12l6 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleGallery(1)}
                        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition duration-200 hover:-translate-y-[55%] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        style={galleryNavButtonStyle}
                        aria-label="Next gallery image"
                      >
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M9 6l6 6-6 6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                {postGallery.length > 1 && (
                  <div className="mt-3 flex justify-center gap-2">
                    {postGallery.map((_, idx) => (
                      <button
                        key={`gallery-dot-${idx}`}
                        type="button"
                        onClick={() => setGalleryIndex(idx)}
                        className={`h-2.5 w-2.5 rounded-full border border-slate-900/10 transition ${idx === galleryIndex ? 'bg-slate-900' : 'bg-slate-200 hover:bg-slate-300'}`}
                        aria-label={`Show gallery image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <article className="relative mt-10 overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-b from-white/90 via-white/80 to-white/60 p-10 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <div className="prose prose-lg max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-li:marker:text-slate-400 prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-slate-200 prose-blockquote:bg-slate-50 prose-blockquote:text-slate-600 prose-blockquote:italic prose-a:text-sky-600 hover:prose-a:text-sky-500 prose-img:rounded-3xl prose-img:shadow-xl prose-pre:bg-white prose-pre:text-slate-900 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-2xl prose-pre:px-5 prose-pre:py-4 prose-pre:leading-relaxed prose-pre:shadow-inner prose-pre:shadow-slate-900/5 prose-pre:whitespace-pre-wrap prose-pre:break-words prose-pre:overflow-hidden prose-code:text-rose-500 prose-table:text-slate-700">
                <div
                  className="space-y-6 [&>h1]:pb-2 [&>h1]:text-slate-900 [&>h1]:border-b [&>h1]:border-slate-200 [&>h2]:mt-12 [&>h2]:text-slate-900 [&>h2]:border-l-4 [&>h2]:border-slate-900 [&>h2]:pl-4 [&>h3]:uppercase [&>h3]:tracking-[0.2em] [&>ul]:space-y-3 [&>ul]:pl-6 [&>ol]:space-y-3 [&>ol]:pl-6 [&>p]:text-lg [&>p]:leading-8"
                  dangerouslySetInnerHTML={{ __html: safePostContent }}
                />
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/30 shadow-inner shadow-white/40" />
            </article>
          </>
        ) : (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <ImageUploader
              label="Cover image"
              bucket="Postimg"
              pathPrefix="covers"
              value={form.cover_url}
              onChange={(value) => setForm({ ...form, cover_url: value })}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              placeholder="Excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              placeholder="Project link (https://...)"
              value={form.project_url}
              onChange={(e) => setForm({ ...form, project_url: e.target.value })}
            />
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
              placeholder="Download label (e.g. Case study PDF)"
              value={form.download_label}
              onChange={(e) => setForm({ ...form, download_label: e.target.value })}
            />
            <FileUploader
              label="Download file URL"
              value={form.download_url}
              onChange={(value) => setForm({ ...form, download_url: value })}
            />
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Technologies used</label>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                placeholder="e.g. React, Supabase"
                value={techInput}
                onChange={(e) => {
                  const value = e.target.value
                  setTechInput(value)
                  const parsed = extractTechTagsFromInput(value)
                  setForm((prev) => ({
                    ...prev,
                    tech_tags: parsed,
                    tag: parsed[0] || '',
                  }))
                }}
              />
              <p className="text-xs text-slate-500">Separate technologies with commas. Up to {MAX_TECH_TAGS} entries.</p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Additional gallery images</label>
                <button
                  type="button"
                  onClick={addGalleryImageSlot}
                  disabled={galleryList.length >= MAX_GALLERY_IMAGES}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Add image
                </button>
              </div>
              {galleryList.length === 0 && <p className="text-sm text-slate-500">Show up to {MAX_GALLERY_IMAGES} supporting screenshots.</p>}
              {galleryList.map((url, idx) => (
                <div key={`gallery-edit-${idx}`} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <ImageUploader
                    label={`Gallery image ${idx + 1}`}
                    bucket="Postimg"
                    pathPrefix="post-gallery"
                    value={url}
                    onChange={(value) => updateGalleryImageSlot(idx, value)}
                  />
                  <div className="mt-3 flex justify-end">
                    <button type="button" onClick={() => removeGalleryImageSlot(idx)} className="text-xs font-semibold text-rose-500">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Post body</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                accent={accent}
                placeholder="Write, format, and link content. Use the toolbar above to style your post."
                onUploadImage={async (file) => {
                  const bucket = 'Postimg'
                  const ext = file.name.split('.').pop()
                  const filePath = `post-assets/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
                  const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true, cacheControl: '0' })
                  if (error) throw error
                  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
                  const url = data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : ''
                  return url
                }}
              />
            </div>
            <div className="flex items-center gap-3">
              <button disabled={saving} onClick={handleSave} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-600/60">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              {msg && <span className="text-sm text-slate-500">{msg}</span>}
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {prevNext.prev && (
            <button
              onClick={() => navigate(`/blog/blog-detail/${prevNext.prev.id}`)}
              aria-label="Previous post"
              className="group flex items-center gap-4 rounded-2xl border border-white/50 bg-white/70 p-4 text-left shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-xl"
            >
              {prevNext.prev.cover_url ? (
                <img src={prevNext.prev.cover_url} alt={prevNext.prev.title} className="h-16 w-24 flex-none rounded-md object-cover" />
              ) : (
                <div className="h-16 w-24 flex-none rounded-md bg-slate-100 ring-1 ring-slate-200" />
              )}
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">Previous</div>
                <div className="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:underline">{prevNext.prev.title}</div>
              </div>
            </button>
          )}
          {prevNext.next && (
            <button
              onClick={() => navigate(`/blog/blog-detail/${prevNext.next.id}`)}
              aria-label="Next post"
              className="group flex items-center justify-end gap-4 rounded-2xl border border-white/50 bg-white/70 p-4 text-right shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:border-white/60 hover:shadow-xl"
            >
              <div className="order-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">Next</div>
                <div className="mt-1 font-semibold text-slate-900 line-clamp-2 group-hover:underline">{prevNext.next.title}</div>
              </div>
              {prevNext.next.cover_url ? (
                <img src={prevNext.next.cover_url} alt={prevNext.next.title} className="order-1 h-16 w-24 flex-none rounded-md object-cover" />
              ) : (
                <div className="order-1 h-16 w-24 flex-none rounded-md bg-slate-100 ring-1 ring-slate-200" />
              )}
            </button>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <div className="text-xs uppercase tracking-wide text-slate-500">More in {post.tag}</div>
            <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/blog/blog-detail/${item.id}`)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/50 bg-white/70 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:border-white/60 hover:shadow-xl"
                >
                  {item.cover_url && <img src={item.cover_url} alt={item.title} className="h-36 w-full object-cover" />}
                  <div className="space-y-2 p-4">
                    {item.tag && (
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                        {item.tag}
                      </span>
                    )}
                    <div className="font-semibold text-slate-900 line-clamp-2 group-hover:underline">{item.title}</div>
                    {item.excerpt && <div className="text-sm text-slate-600 line-clamp-2">{item.excerpt}</div>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mx-auto mt-12 max-w-5xl px-6 md:px-10 pb-16">
        <Footer blogSettings={blogSettings} />
      </div>
    </div>
  )
}
