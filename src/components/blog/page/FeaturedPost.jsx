import PropTypes from 'prop-types'

import { useNavigate } from 'react-router-dom'

export default function FeaturedPost({ post }) {
  const navigate = useNavigate()
  if (!post) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-400 shadow-sm">
        No posts yet. Publish one to light up this space.
      </div>
    )
  }
  return (
    <article
      onClick={() => navigate('blog-detail/' + post.id)}
      className="relative h-[280px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
    >
      {post.cover_url && <img src={post.cover_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
      <div className="absolute bottom-6 left-6 right-6 text-white">
        {post.tag && <div className="text-xs uppercase tracking-widest text-emerald-200">{post.tag}</div>}
        <h2 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">{post.title}</h2>
        {post.excerpt && <p className="mt-3 hidden max-w-2xl opacity-90 md:block">{post.excerpt}</p>}
      </div>
    </article>
  )
}
FeaturedPost.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cover_url: PropTypes.string,
    title: PropTypes.string,
    tag: PropTypes.string,
    excerpt: PropTypes.string,
  }),
}
