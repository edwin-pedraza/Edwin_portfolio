import PropTypes from 'prop-types'

import { useMemo } from 'react'

function deriveCategory(post, strategy = 'tag') {
  if (strategy === 'title') {
    return post?.title ? post.title.split(' ')[0] : 'General'
  }
  return post?.tag || 'General'
}

export default function Sidebar({ posts = [], onSelectCategory, activeCategory, strategy = 'tag', blogSettings }) {
  const tags = useMemo(() => {
    const base = new Set()
    posts.forEach((post) => base.add(deriveCategory(post, strategy)))
    return Array.from(base)
  }, [posts, strategy])

  return (
    <aside className="space-y-6">
      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur">
        <div className="flex items-center gap-4">
          {blogSettings?.authorAvatarUrl ? (
            <img src={blogSettings.authorAvatarUrl} alt={blogSettings.authorName} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <div className="h-14 w-14 rounded-full bg-slate-200" />
          )}
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">{blogSettings?.authorTitle || 'Author'}</div>
            <div className="text-lg font-semibold text-slate-900">{blogSettings?.authorName || 'Edwin Pedraza'}</div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">{blogSettings?.authorBio || 'Thoughts on web, data and product. Tutorials, notes and experiments.'}</p>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">Categories</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectCategory?.(tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                tag === activeCategory ? 'bg-slate-900 text-white border-slate-900 shadow' : 'border-white/60 text-slate-700 hover:border-white/70'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/70 p-6 shadow-lg backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">Newsletter</div>
        <p className="mt-2 text-sm text-slate-600">Get new posts in your inbox, once a month.</p>
        <input
          className="mt-4 w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm backdrop-blur focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="you@example.com"
        />
        <button className="mt-3 w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400">Subscribe</button>
      </div>
    </aside>
  )
}
Sidebar.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.object),
  onSelectCategory: PropTypes.func,
  activeCategory: PropTypes.string,
  strategy: PropTypes.oneOf(['tag', 'title']),
  blogSettings: PropTypes.shape({
    authorAvatarUrl: PropTypes.string,
    authorName: PropTypes.string,
    authorTitle: PropTypes.string,
    authorBio: PropTypes.string,
  }),
}
