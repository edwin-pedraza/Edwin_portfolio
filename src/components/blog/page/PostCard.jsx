import { useNavigate } from 'react-router-dom'

export default function PostCard({ post }) {
  const navigate = useNavigate()
  return (
    <article
      onClick={()=>navigate('blog-detail/'+post.id)}
      className='group cursor-pointer rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition'
    >
      {post.cover_url && (
        <div className='relative'>
          <img src={post.cover_url} alt={post.title} className='w-full h-52 object-cover transition-transform duration-300 group-hover:scale-[1.03]' />
          {post.tag && (
            <span className='absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-black/60 border border-white/10'>
              {post.tag}
            </span>
          )}
        </div>
      )}
      <div className='p-4'>
        <h3 className='text-lg font-semibold leading-tight'>{post.title}</h3>
        {post.excerpt && <p className='mt-2 text-sm opacity-80 line-clamp-3'>{post.excerpt}</p>}
      </div>
    </article>
  )
}

