import PropTypes from 'prop-types'

import { useMemo } from 'react'
import { deriveCategories } from './categoryUtils'

export default function Sidebar({ posts = [], onSelectCategory, activeCategory, strategy = 'tag', blogSettings }) {
  const tags = useMemo(() => {
    const base = new Set()
    posts.forEach((post) => {
      deriveCategories(post, strategy).forEach((category) => base.add(category))
    })
    return Array.from(base)
  }, [posts, strategy])
  const categoryList = tags.length ? tags : ['General']
  const selectedCategory = activeCategory || categoryList[0]

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
          {categoryList.map((label) => {
            const isActive = selectedCategory === label
            return (
              <button
                type="button"
                key={`sidebar-cat-${label}`}
                onClick={() => onSelectCategory?.(label)}
                className={`inline-flex items-center rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
                  isActive ? 'bg-slate-900 text-white shadow' : 'bg-slate-900/5 text-slate-700 hover:bg-slate-900/10'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Newsletter section removed */}
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
