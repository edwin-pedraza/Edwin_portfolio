import { useNavigate } from 'react-router-dom'

export default function PostsGrid({ posts = [] }) {
  const navigate = useNavigate()
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 md:px-10 lg:px-16 mt-8'>
      {posts.map((p) => (
        <article key={p.id} className='bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition cursor-pointer' onClick={()=>navigate('blog-detail/'+p.id)}>
          {p.cover_url && (
            <img src={p.cover_url} alt={p.title} className='w-full h-44 object-cover'/>
          )}
          <div className='p-4'>
            {p.tag && <div className='text-xs uppercase tracking-wide text-emerald-400 mb-1'>{p.tag}</div>}
            <h3 className='text-lg font-semibold mb-2'>{p.title}</h3>
            {p.excerpt && <p className='text-sm opacity-80 line-clamp-3'>{p.excerpt}</p>}
          </div>
        </article>
      ))}
    </div>
  )
}

