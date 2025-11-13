import PropTypes from 'prop-types'

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildHeroTheme } from './heroTheme'
import { combineTagSources } from './tagUtils'

export default function FeaturedPost({ post, accent, themeColors }) {
  const navigate = useNavigate()
  const heroTheme = useMemo(() => buildHeroTheme(themeColors, accent?.base), [themeColors, accent?.base])
  const chipTags = useMemo(
    () => combineTagSources(post?.tag, post?.tech_tags),
    [post?.tag, post?.tech_tags]
  )

  if (!post) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/70 p-10 text-center text-slate-500 shadow-lg backdrop-blur">
        No posts yet. Publish one to light up this space.
      </div>
    )
  }
  return (
    <article
      onClick={() => navigate('blog-detail/' + post.id)}
      className="relative h-[280px] overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
    >
      {post.cover_url ? (
        <>
          <img src={post.cover_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundImage: heroTheme.overlay }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ backgroundImage: heroTheme.overlay }} />
      )}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        <div
          className="inline-flex w-full max-w-lg flex-col gap-3 rounded-3xl border px-5 py-4 text-white backdrop-blur"
          style={{ backgroundColor: heroTheme.cardBg, borderColor: heroTheme.cardBorder, boxShadow: heroTheme.cardShadow }}
        >
          {chipTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chipTags.map((token) => (
                <span
                  key={`featured-tag-${token}`}
                  className="rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em]"
                  style={{ backgroundColor: heroTheme.chipBg, color: heroTheme.chipText }}
                >
                  {token}
                </span>
              ))}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">{post.title}</h2>
            {post.excerpt && <p className="mt-2 hidden max-w-2xl text-sm text-white/85 md:block">{post.excerpt}</p>}
          </div>
        </div>
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
    tech_tags: PropTypes.arrayOf(PropTypes.string),
  }),
  themeColors: PropTypes.object,
  accent: PropTypes.shape({
    base: PropTypes.string,
  }),
}
