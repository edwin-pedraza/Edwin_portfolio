import { useNavigate } from 'react-router-dom'

export default function FeaturedPost({ post }) {
  const navigate = useNavigate()
  if (!post) return null
  return (
    <div
      onClick={()=>navigate('blog-detail/'+post.id)}
      className='relative h-[280px] md:h-[360px] rounded-2xl overflow-hidden cursor-pointer'
    >
      {post.cover_url && <img src={post.cover_url} alt={post.title} className='absolute inset-0 w-full h-full object-cover' />}
      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />
      <div className='absolute bottom-6 left-6 right-6'>
        {post.tag && <div className='text-emerald-300 text-xs uppercase tracking-widest mb-2'>{post.tag}</div>}
        <h2 className='text-2xl md:text-3xl font-semibold leading-tight'>{post.title}</h2>
        {post.excerpt && <p className='hidden md:block opacity-90 mt-2 max-w-2xl'>{post.excerpt}</p>}
      </div>
    </div>
  )
}

