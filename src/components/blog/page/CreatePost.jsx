import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabase/client'
import ImageUploader from '../../admin/ImageUploader'

function slugify(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CreatePost() {
  const [session, setSession] = useState(null)
  const [form, setForm] = useState({ title: '', tag: '', excerpt: '', content: '', cover_url: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => authListener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!session) {
      setMsg('You must be signed in to publish posts.')
      return
    }
    setSaving(true)
    setMsg('')
    const payload = {
      title: form.title,
      slug: slugify(form.title),
      tag: form.tag || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_url: form.cover_url || null,
    }
    const { data, error } = await supabase.from('post').insert(payload).select('id').single()
    if (error) {
      setMsg(error.message)
    } else if (data?.id) {
      navigate(`/react/blog/blog-detail/${data.id}`)
    }
    setSaving(false)
  }

  if (!session) {
    return (
      <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-8 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to create a post</h1>
        <p className="mt-3 text-slate-600">Use the login button in the header to request an access link.</p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-8 py-10 md:px-12">
      <h1 className="text-3xl font-semibold text-slate-900">New post</h1>
      <p className="mt-2 text-sm text-slate-500">Draft your article and publish it in one go.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-4">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Post title"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={form.tag}
            onChange={(event) => setForm((prev) => ({ ...prev, tag: event.target.value }))}
            placeholder="Tag / category"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <input
            value={form.excerpt}
            onChange={(event) => setForm((prev) => ({ ...prev, excerpt: event.target.value }))}
            placeholder="One-line summary"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <ImageUploader
          label="Cover image"
          bucket="Postimg"
          pathPrefix="covers"
          value={form.cover_url}
          onChange={(value) => setForm((prev) => ({ ...prev, cover_url: value }))}
        />
        <textarea
          value={form.content}
          onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          placeholder="Write your post (Markdown or plain text)"
          rows={12}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          required
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:bg-emerald-600/60"
          >
            {saving ? 'Publishing…' : 'Publish post'}
          </button>
          {msg && <span className="text-sm text-rose-500">{msg}</span>}
        </div>
      </form>
    </section>
  )
}
