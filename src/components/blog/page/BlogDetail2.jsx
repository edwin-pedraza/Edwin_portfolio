import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../../supabase/client'
import sanitizeHtml from '../../../utils/sanitizeHtml'
import useBlogSettings from '../useBlogSettings'
import ImageUploader from '../../admin/ImageUploader'
import RichTextEditor from '../../admin/RichTextEditor'
import { buildAccentPalette } from '../../admin/themeUtils'

export default function BlogDetail2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blog: blogSettings, theme } = useBlogSettings()
  const [post, setPost] = useState(null)
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', tag: '', cover_url: '', excerpt: '', content: '' })
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
        setPost({ ...data, content: cleanContent })
        setForm({
          title: data.title || '',
          tag: data.tag || '',
          cover_url: data.cover_url || '',
          excerpt: data.excerpt || '',
          content: cleanContent,
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
    const payload = {
      title: form.title,
      tag: form.tag,
      cover_url: form.cover_url || null,
      excerpt: form.excerpt || null,
      content: cleanContent || null,
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

  if (!post) {
    return <div className="min-h-screen bg-slate-100 px-6 py-10 text-center text-slate-500">Loading...</div>
  }

  const canEdit = session && allowedAdminEmails.length > 0 && allowedAdminEmails.includes((session.user?.email || '').toLowerCase())

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
          <article className="prose prose-slate mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: safePostContent }} />
        ) : (
          <div className="mt-8 space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg backdrop-blur">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className="rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Tag" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
            <ImageUploader
              label="Cover image"
              bucket="Postimg"
              pathPrefix="covers"
              value={form.cover_url}
              onChange={(value) => setForm({ ...form, cover_url: value })}
            />
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
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
