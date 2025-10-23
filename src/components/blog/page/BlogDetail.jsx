import { useEffect, useMemo, useState } from \"react\"
import { useNavigate, useParams } from \"react-router-dom\"
import { supabase } from \"../../../supabase/client\"
import sanitizeHtml from \"../../../utils/sanitizeHtml\"
import RichTextEditor from \"../../admin/RichTextEditor\"
import { buildAccentPalette } from \"../../admin/themeUtils\"
import useBlogSettings from \"../useBlogSettings\"

export default function BlogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { blog: blogSettings, theme } = useBlogSettings()
  const [post, setPost] = useState(null)
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: \"\", tag: \"\", cover_url: \"\", excerpt: \"\", content: \"\" })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(\"\")
  const accent = useMemo(() => buildAccentPalette(theme, \"light\"), [theme])
  const readingTime = useMemo(() => {
    const clean = sanitizeHtml(form.content || post?.content || \"\")
    const words = clean.replace(/<[^>]+>/g, \" \" ).split(/\\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [form.content, post?.content])
  const safePostContent = useMemo(() => sanitizeHtml(post?.content || \"\"), [post?.content])

  const [prevNext, setPrevNext] = useState({ prev: null, next: null })
  const [related, setRelated] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from(\"post\").select(\"*\").eq(\"id\", id).single()
      if (data) {
        const cleanContent = sanitizeHtml(data.content || \"\")
        setPost({ ...data, content: cleanContent })
        setForm({
          title: data.title || \"\",
          tag: data.tag || \"\",
          cover_url: data.cover_url || \"\",
          excerpt: data.excerpt || \"\",
          content: cleanContent,
        })

        if (data.published_at) {
          const { data: prev } = await supabase
            .from(\"post\")
            .select(\"id,title,cover_url\")
            .lt(\"published_at\", data.published_at)
            .order(\"published_at\", { ascending: false })
            .limit(1)
          const { data: next } = await supabase
            .from(\"post\")
            .select(\"id,title,cover_url\")
            .gt(\"published_at\", data.published_at)
            .order(\"published_at\", { ascending: true })
            .limit(1)
          setPrevNext({ prev: prev?.[0] || null, next: next?.[0] || null })
        } else {
          setPrevNext({ prev: null, next: null })
        }

        if (data.tag) {
          const { data: rel } = await supabase
            .from(\"post\")
            .select(\"id,title,excerpt,cover_url,tag\")
            .eq(\"tag\", data.tag)
            .neq(\"id\", data.id)
            .order(\"published_at\", { ascending: false })
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
    setMsg(\"\")
    const cleanContent = sanitizeHtml(form.content)
    const payload = {
      title: form.title,
      tag: form.tag,
      cover_url: form.cover_url || null,
      excerpt: form.excerpt || null,
      content: cleanContent || null,
    }
    const { error } = await supabase.from(\"post\").update(payload).eq(\"id\", id)
    if (error) {
      setMsg(Update failed: )
    } else {
      setMsg(\"Updated\")
      setEditing(false)
      setPost({ ...post, ...payload, content: cleanContent })
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(\"Delete this post?\")) return
    const { error } = await supabase.from(\"post\").delete().eq(\"id\", id)
    if (!error) navigate(\"/react/blog\")
  }

  if (!post) {
    return <div className=\"min-h-screen bg-slate-100 px-6 py-10 text-center text-slate-500\">Loading...</div>
  }

  return (
    <div className=\"min-h-screen\" style={{ backgroundColor: theme.lightShell }}>
      <div className=\"relative w-full\">
        {post.cover_url && <img src={post.cover_url} alt={post.title} className=\"h-[260px] w-full object-cover md:h-[360px]\" />}
        <div className=\"absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent\" />
        <div className=\"absolute inset-x-0 bottom-6 px-6 md:px-10\">
          <div className=\"mx-auto max-w-5xl text-white\">
            {post.tag && <span className=\"inline-block rounded-full bg-white/15 px-3 py-1 text-xs uppercase tracking-wider\">{post.tag}</span>}
            <h1 className=\"mt-3 text-3xl font-semibold leading-tight md:text-4xl\">{post.title}</h1>
            <div className=\"mt-2 text-sm opacity-90\">
              {new Date(post.published_at || post.created_at).toLocaleDateString()} | {readingTime} min read
            </div>
          </div>
        </div>
      </div>

      <div className=\"mx-auto max-w-5xl px-6 py-10 md:px-10\">
        <button onClick={() => navigate(\"/react/blog\")} className=\"text-sm font-medium text-sky-600 hover:text-sky-500\">Back to Blog</button>

        <div className=\"mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm\">
          <div className=\"text-sm text-slate-600\">
            <div className=\"font-medium text-slate-900\">{blogSettings?.authorName || \"Edwin Pedraza\"}</div>
            <div>{blogSettings?.authorTitle || \"Author\"}</div>
          </div>
          {session && (
            <div className=\"flex gap-2\">
              <button onClick={() => setEditing((value) => !value)} className=\"rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100\">
                {editing ? \"Close editor\" : \"Edit\"}
              </button>
              <button onClick={handleDelete} className=\"rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-400\">Delete</button>
            </div>
          )}
        </div>

        {!editing ? (
          <article className=\"prose prose-slate mt-8 max-w-none\" dangerouslySetInnerHTML={{ __html: safePostContent }} />
        ) : (
          <div className=\"mt-8 space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm\">
            <div className=\"grid gap-4 md:grid-cols-2\">
              <input className=\"rounded-xl border border-slate-200 px-4 py-2 text-sm\" placeholder=\"Title\" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input className=\"rounded-xl border border-slate-200 px-4 py-2 text-sm\" placeholder=\"Tag\" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} />
            </div>
            <input className=\"w-full rounded-xl border border-slate-200 px-4 py-2 text-sm\" placeholder=\"Cover URL\" value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
            <input className=\"w-full rounded-xl border border-slate-200 px-4 py-2 text-sm\" placeholder=\"Excerpt\" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <div className=\"space-y-2\">
              <label className=\"block text-xs font-semibold uppercase tracking-wide text-slate-500\">Post body</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm({ ...form, content: html })}
                accent={accent}
                placeholder=\"Write, format, and link content. Use the toolbar above to style your post.\"
              />
            </div>
            <div className=\"flex items-center gap-3\">
              <button disabled={saving} onClick={handleSave} className=\"rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-emerald-600/60\">
                {saving ? \"Saving...\" : \"Save changes\"}
              </button>
              {msg && <span className=\"text-sm text-slate-500\">{msg}</span>}
            </div>
          </div>
        )}

        <div className=\"mt-12 grid gap-4 md:grid-cols-2\">
          {prevNext.prev && (
            <button onClick={() => navigate(/react/blog/blog-detail/)} className=\"rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm hover:border-slate-300\">
              <div className=\"text-xs uppercase tracking-wide text-slate-500\">Previous</div>
              <div className=\"mt-1 font-semibold text-slate-900 line-clamp-2\">{prevNext.prev.title}</div>
            </button>
          )}
          {prevNext.next && (
            <button onClick={() => navigate(/react/blog/blog-detail/)} className=\"rounded-2xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm hover:border-slate-300\">
              <div className=\"text-xs uppercase tracking-wide text-slate-500\">Next</div>
              <div className=\"mt-1 font-semibold text-slate-900 line-clamp-2\">{prevNext.next.title}</div>
            </button>
          )}
        </div>

        {related.length > 0 && (
          <div className=\"mt-12\">
            <div className=\"text-xs uppercase tracking-wide text-slate-500\">More in {post.tag}</div>
            <div className=\"mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3\">
              {related.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(/react/blog/blog-detail/)}
                  className=\"cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:shadow-md\"
                >
                  {item.cover_url && <img src={item.cover_url} alt={item.title} className=\"h-36 w-full object-cover\" />}
                  <div className=\"space-y-2 p-4\">
                    <div className=\"text-xs uppercase tracking-wide text-slate-500\">{item.tag}</div>
                    <div className=\"font-semibold text-slate-900 line-clamp-2\">{item.title}</div>
                    {item.excerpt && <div className=\"text-sm text-slate-600 line-clamp-2\">{item.excerpt}</div>}
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
