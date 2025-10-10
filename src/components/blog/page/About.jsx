import PropTypes from 'prop-types'

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

  function sanitizeHtml(html) {
    if (!html) return ''
    // very lightweight sanitization: strip script tags and on* handlers
    return String(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/ on[a-z]+="[^"]*"/gi, '')
      .replace(/ on[a-z]+='[^']*'/gi, '')
  }

  const isHtml = /<\w+[\s\S]*>/i.test(about.aboutContent || '')
  const contentNode = isHtml ? (
    <div
      className={`${about.aboutLargeText ? 'text-lg md:text-xl leading-relaxed' : 'leading-relaxed'} prose prose-slate max-w-none dark:prose-invert`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(about.aboutContent) }}
    />
  ) : (
    <p className={`${about.aboutLargeText ? 'text-lg md:text-xl leading-relaxed' : 'leading-relaxed'} text-slate-600 whitespace-pre-line`}>
      {highlight(about.aboutContent || 'Stories about building products, refining craft, and the lessons learned along the way.', about.aboutEmphasis, accent?.base)}
    </p>
  )

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-8 py-10 md:px-12" style={bgStyle}>
        <h1 className="text-3xl font-semibold text-slate-900">{about.aboutTitle || 'About this blog'}</h1>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,280px] lg:items-start">
          {contentNode}
          {imgUrl && (
            <div className="justify-self-center lg:justify-self-end">
              <img src={imgUrl} alt="About" className="h-52 w-52 rounded-2xl object-cover shadow-md ring-1 ring-slate-200" />
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
