import PropTypes from 'prop-types'
import sanitizeHtml from '../../../utils/sanitizeHtml'

function highlight(text, words = [], color = '#0ea5e9') {
  if (!text || !Array.isArray(words) || words.length === 0) return text
  const pattern = new RegExp(`(${words.map((w)=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`, 'gi')
  const parts = String(text).split(pattern)
  return parts.map((part, idx) =>
    words.some((w) => new RegExp(`^${w}$`, 'i').test(part))
      ? (<span key={idx} style={{ color }}>{part}</span>)
      : (<span key={idx}>{part}</span>)
  )
}

export default function About({ blogSettings, accent }) {
  const about = blogSettings || {}
  const bgStyle = about.aboutAccentBackground
    ? { backgroundImage: `radial-gradient(60% 60% at -10% -10%, ${accent?.softer} 0%, transparent 60%), radial-gradient(50% 50% at 110% 0%, ${accent?.soft} 0%, transparent 60%)` }
    : {}
  const imgUrl = about.aboutImageUrl || about.authorAvatarUrl || about.bannerUrl || ''

  const isHtml = /<\w+[\s\S]*>/i.test(about.aboutContent || '')
  const contentNode = isHtml ? (
    <div
      className={`${about.aboutLargeText ? 'text-lg md:text-xl leading-relaxed' : 'leading-relaxed'} prose prose-lg prose-slate max-w-none text-slate-600 dark:prose-invert`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.aboutContent) }}
    />
  ) : (
    <div className="space-y-4 text-slate-600">
      {(about.aboutContent || 'Stories about building products, refining craft, and the lessons learned along the way.')
        .split('\n')
        .filter(Boolean)
        .map((paragraph, idx) => (
          <p
            key={`about-paragraph-${idx}`}
            className={`${about.aboutLargeText ? 'text-lg md:text-xl leading-relaxed' : 'leading-relaxed'}`}
          >
            {highlight(paragraph, about.aboutEmphasis, accent?.base)}
          </p>
        ))}
    </div>
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 overflow-hidden">
      <div className="px-8 py-10 md:px-12" style={bgStyle}>
        <h1 className="text-3xl font-semibold text-slate-900">{about.aboutTitle || 'About this blog'}</h1>
        <div className="mt-6 grid gap-12 lg:grid-cols-[1fr,280px] lg:items-start">
          {contentNode}
          {imgUrl && (
            <div className="justify-self-center lg:justify-self-end">
              <div className="relative">
                <img src={imgUrl} alt="About" className="h-52 w-52 rounded-2xl object-cover shadow-xl ring-1 ring-slate-200" />
                <div className="absolute -bottom-4 inset-x-0 rounded-2xl bg-white/90 px-3 py-2 text-center text-xs font-medium text-slate-600 shadow-lg">
                  {about.authorAvatarUrl ? about.authorName || 'Author' : 'Life & Work'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 
About.propTypes = {
  blogSettings: PropTypes.shape({
    aboutTitle: PropTypes.string,
    aboutContent: PropTypes.string,
    aboutImageUrl: PropTypes.string,
    aboutLargeText: PropTypes.bool,
    aboutAccentBackground: PropTypes.bool,
    aboutEmphasis: PropTypes.arrayOf(PropTypes.string),
    authorAvatarUrl: PropTypes.string,
    bannerUrl: PropTypes.string,
  }),
  accent: PropTypes.object,
}
