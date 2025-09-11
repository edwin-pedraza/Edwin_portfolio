import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../supabase/client'

export default function BlogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [session, setSession] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', tag: '', cover_url: '', excerpt: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const readingTime = useMemo(() => {
    const words = (form.content || post?.content || '').split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.round(words / 200))
  }, [form.content, post?.content])

  const [prevNext, setPrevNext] = useState({ prev: null, next: null })
  const [related, setRelated] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
  }, [])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('post').select('*').eq('id', id).single()
      setPost(data)
      if (data) setForm({ title: data.title||'', tag: data.tag||'', cover_url: data.cover_url||'', excerpt: data.excerpt||'', content: data.content||'' })

      // fetch prev/next by published_at
      if (data?.published_at) {
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
      }

      // related posts by same tag
      if (data?.tag) {
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
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    setMsg('')
    const payload = { title: form.title, tag: form.tag, cover_url: form.cover_url||null, excerpt: form.excerpt||null, content: form.content||null }
    const { error } = await supabase.from('post').update(payload).eq('id', id)
    if (error) setMsg(`Update failed: ${error.message}`)
    else { setMsg('Updated'); setEditing(false); setPost({ ...post, ...payload }) }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const { error } = await supabase.from('post').delete().eq('id', id)
    if (!error) navigate('/react/blog')
  }

  if (!post) return <div className='rootBlog min-h-screen p-6'>Loading…</div>

  return (
    <div className='rootBlog min-h-screen'>
      {/* Header / Cover */}
      <div className='relative w-full'>
        {post.cover_url && (
          <img src={post.cover_url} alt={post.title} className='w-full h-[260px] md:h-[360px] object-cover' />
        )}
        <div className='absolute inset-0 bg-gradient-to-r from-indigo-900/60 via-purple-800/40 to-cyan-700/40' />
        <div className='absolute inset-x-0 bottom-6 px-6 md:px-10'>
          <div className='max-w-5xl mx-auto'>
            {post.tag && <span className='inline-block text-xs px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur'>{post.tag}</span>}
            <h1 className='mt-2 text-3xl md:text-4xl font-semibold leading-tight'>{post.title}</h1>
            <div className='mt-2 text-sm opacity-90'>
              {new Date(post.published_at || post.created_at).toLocaleDateString()} · {readingTime} min read
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-5xl mx-auto px-6 md:px-10'>
        {/* Back to list */}
        <div className='py-4'>
          <button onClick={()=>navigate('/react/blog')} className='text-sky-400 hover:text-sky-300 text-sm'>← Back to Blog</button>
        </div>
        {/* Share + Edit */}
        <div className='flex items-center justify-between py-4'>
          <div className='flex gap-2'>
            <button className='px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm' onClick={()=>{
              const u = window.location.href
              window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(post.title)}`,'_blank')
            }}>Share</button>
            <button className='px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-sm' onClick={()=>navigator.clipboard.writeText(window.location.href)}>Copy link</button>
          </div>
          {session && (
            <div className='flex gap-2'>
              <button onClick={()=>setEditing((s)=>!s)} className='px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm'>{editing ? 'Close editor' : 'Edit'}</button>
              <button onClick={handleDelete} className='px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm'>Delete</button>
            </div>
          )}
        </div>

        {!editing ? (
          <article className='prose prose-invert max-w-none mt-2 prose-headings:tracking-tight prose-a:text-sky-400'>
            {post.excerpt && <p className='opacity-90 text-lg'>{post.excerpt}</p>}
            <div className='whitespace-pre-wrap mt-4 leading-7'>{post.content}</div>
          </article>
        ) : (
          <div className='bg-gradient-to-br from-indigo-900/40 via-purple-800/30 to-cyan-700/30 rounded-2xl border border-white/10 p-4 mt-2 space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <input className='px-3 py-2 rounded bg-white/10 border border-white/10' placeholder='Title' value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
              <input className='px-3 py-2 rounded bg-white/10 border border-white/10' placeholder='Tag' value={form.tag} onChange={e=>setForm({...form, tag:e.target.value})} />
            </div>
            <input className='w-full px-3 py-2 rounded bg-white/10 border border-white/10' placeholder='Cover URL' value={form.cover_url} onChange={e=>setForm({...form, cover_url:e.target.value})} />
            <input className='w-full px-3 py-2 rounded bg-white/10 border border-white/10' placeholder='Excerpt' value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})} />
            <textarea className='w-full px-3 py-2 rounded bg-white/10 border border-white/10' rows={12} placeholder='Content' value={form.content} onChange={e=>setForm({...form, content:e.target.value})} />
            <div className='flex gap-2'>
              <button disabled={saving} onClick={handleSave} className='px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50'>{saving ? 'Saving…' : 'Save changes'}</button>
              {msg && <div className='self-center text-sm opacity-80'>{msg}</div>}
            </div>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className='mt-10 grid grid-cols-2 gap-3'>
          <div>
            {prevNext.prev && (
              <button onClick={()=>navigate(`/react/blog/blog-detail/${prevNext.prev.id}`)} className='w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10'>
                <div className='text-xs opacity-70'>Previous</div>
                <div className='font-semibold line-clamp-2'>{prevNext.prev.title}</div>
              </button>
            )}
          </div>
          <div className='text-right'>
            {prevNext.next && (
              <button onClick={()=>navigate(`/react/blog/blog-detail/${prevNext.next.id}`)} className='w-full text-right px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10'>
                <div className='text-xs opacity-70'>Next</div>
                <div className='font-semibold line-clamp-2'>{prevNext.next.title}</div>
              </button>
            )}
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className='mt-10'>
            <div className='text-sm uppercase tracking-wider opacity-80 mb-3'>More in {post.tag}</div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {related.map((r) => (
                <article key={r.id} onClick={()=>navigate(`/react/blog/blog-detail/${r.id}`)} className='cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition'>
                  {r.cover_url && <img src={r.cover_url} alt={r.title} className='w-full h-40 object-cover' />}
                  <div className='p-3'>
                    <div className='text-xs opacity-70'>{r.tag}</div>
                    <div className='font-semibold line-clamp-2'>{r.title}</div>
                    {r.excerpt && <div className='text-sm opacity-80 line-clamp-2 mt-1'>{r.excerpt}</div>}
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
