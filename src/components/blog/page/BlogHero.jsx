import PropTypes from 'prop-types'
import bannerFallback from '../../../assets/banner.jpg'
import { getReadableTextColor } from '../../admin/themeUtils'

export default function BlogHero({ blogSettings, loading, accent }) {
  const bannerUrl = blogSettings?.bannerUrl || bannerFallback
  const heading = blogSettings?.bannerHeading || 'Edwin Pedraza - Blog'
  const subheading = blogSettings?.bannerSubheading || 'Insights and updates on building useful products.'
  const accentColor = accent?.base || '#0ea5e9'
  const accentContrast = getReadableTextColor(accentColor)

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <img
        src={bannerUrl}
        alt="Blog banner"
        className="h-[220px] w-full object-cover md:h-[320px]"
        loading={loading ? 'lazy' : 'eager'}
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, rgba(15, 23, 42, 0.65), ${accentColor}33)` }}
      />
      <div className="absolute bottom-6 left-8 right-8 text-white">
        <div className="text-xs uppercase tracking-[0.3rem]" style={{ color: accentContrast }}>
          {blogSettings?.authorTitle || 'Journal'}
        </div>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm opacity-90 md:text-base">{subheading}</p>
      </div>
    </div>
  )
}

BlogHero.propTypes = {
  blogSettings: PropTypes.shape({
    bannerUrl: PropTypes.string,
    bannerHeading: PropTypes.string,
    bannerSubheading: PropTypes.string,
    authorTitle: PropTypes.string,
  }),
  loading: PropTypes.bool,
  accent: PropTypes.shape({
    base: PropTypes.string,
  }),
}