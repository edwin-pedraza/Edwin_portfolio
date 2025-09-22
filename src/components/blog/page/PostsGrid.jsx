import PropTypes from 'prop-types'

import { useNavigate } from 'react-router-dom'

export default function PostsGrid({ posts = [] }) {
  const navigate = useNavigate()
  if (!posts.length) return null
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <article
          key={post.id}
          onClick={() => navigate('blog-detail/' + post.id)}
          className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
        >
          {post.cover_url && <img src={post.cover_url} alt={post.title} className="h-44 w-full object-cover" />}
          <div className="flex flex-1 flex-col gap-3 p-5">
            {post.tag && <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">{post.tag}</span>}
            <h3 className="text-lg font-semibold text-slate-900">{post.title}</h3>
            {post.excerpt && <p className="text-sm text-slate-700 line-clamp-3">{post.excerpt}</p>}
            <span className="mt-auto text-xs text-slate-500">{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
PostsGrid.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    cover_url: PropTypes.string,
    title: PropTypes.string,
    tag: PropTypes.string,
    excerpt: PropTypes.string,
  })),
}
