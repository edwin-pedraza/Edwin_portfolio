import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../../supabase/client'
import sanitizeHtml from '../../../utils/sanitizeHtml'
import useBlogSettings from '../useBlogSettings'
import ImageUploader from '../../admin/ImageUploader'
import RichTextEditor from '../../admin/RichTextEditor'
import { buildAccentPalette } from '../../admin/themeUtils'

const MAX_GALLERY_IMAGES = 3

function normalizeExternalUrl(url) {
  if (!url) return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export default function BlogDetail2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blog: blogSettings, theme } = useBlogSettings()
  const [post, setPost] = useState(null)
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', tag: '', cover_url: '', excerpt: '', content: '', project_url: '', gallery_urls: [] })
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const readingTime = useMemo(() => {
    const clean = sanitizeHtml(form.content || post?.content || '')
    const plain = clean.replace(/<[^>]+>/g, ' ')
    const words = plain.split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [form.content, post?.content])

  const accent = useMemo(() => buildAccentPalette(theme, 'light'), [theme])
  const safePostContent = useMemo(() => sanitizeHtml(post?.content || ''), [post?.content])
  const galleryList = useMemo(() => (Array.isArray(form.gallery_urls) ? form.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []), [form.gallery_urls])

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
    async function load() {
      const { data } = await supabase.from('post').select('*').eq('id', id).single()
      if (data) {
        const cleanContent = sanitizeHtml(data.content || '')
        const gallery = Array.isArray(data.gallery_urls) ? data.gallery_urls.slice(0, MAX_GALLERY_IMAGES) : []
        setPost({ ...data, content: cleanContent, gallery_urls: gallery })
        setForm({
          title: data.title || '',
          tag: data.tag || '',
          cover_url: data.cover_url || '',
          excerpt: data.excerpt || '',
          content: cleanContent,
          project_url: data.project_url || '',
          gallery_urls: gallery,
        })

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
    const payload = {
      title: form.title,
      tag: form.tag,
      cover_url: form.cover_url || null,
      excerpt: form.excerpt || null,
      content: cleanContent || null,
      project_url: projectLink || null,
      gallery_urls: gallery,
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
    if (!error) navigate('/react/blog')
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
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-6 px-6 md:px-10">
          <div className="mx-auto max-w-5xl text-white">
            {post.tag && <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider">{post.tag}</span>}
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{post.title}</h1>
            <div className="mt-2 text-sm opacity-90">
              {new Date(post.published_at || post.created_at).toLocaleDateString()} · {readingTime} min read
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
        <button onClick={() => navigate('/react/blog')} className="text-sm font-medium text-sky-600 hover:text-sky-500">Back to Blog</button>

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
                        className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-slate-900 shadow-xl shadow-slate-900/10 transition hover:-translate-y-1/2 hover:bg-white"
                        aria-label="Previous gallery image"
                      >
                        <span aria-hidden>&lsaquo;</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cycleGallery(1)}
                        className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-slate-900 shadow-xl shadow-slate-900/10 transition hover:-translate-y-1/2 hover:bg-white"
                        aria-label="Next gallery image"
                      >
                        <span aria-hidden>&rsaquo;</span>
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

            <article
              className="prose prose-lg mt-8 max-w-none text-slate-700 prose-headings:text-slate-900 prose-headings:font-semibold prose-p:text-slate-700 prose-li:text-slate-700 prose-li:marker:text-slate-400 prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-slate-200 prose-blockquote:text-slate-500 prose-a:text-sky-600 prose-img:rounded-3xl prose-img:shadow-lg prose-pre:bg-white/80 prose-pre:text-slate-800 prose-pre:border prose-pre:border-slate-200 prose-pre:rounded-2xl prose-pre:px-5 prose-pre:py-4 prose-pre:whitespace-pre-wrap prose-pre:leading-relaxed prose-code:text-slate-900 prose-table:text-slate-700"
              dangerouslySetInnerHTML={{ __html: safePostContent }}
            />
          </>
        ) : (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <input
                className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-100 placeholder:text-slate-400"
                placeholder="Tag"
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
              />
            </div>
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
              onClick={() => navigate(`/react/blog/blog-detail/${prevNext.prev.id}`)}
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
              onClick={() => navigate(`/react/blog/blog-detail/${prevNext.next.id}`)}
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
                  onClick={() => navigate(`/react/blog/blog-detail/${item.id}`)}
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
    </div>
  )
}
