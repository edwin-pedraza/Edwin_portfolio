import PropTypes from 'prop-types'

export default function About({ blogSettings }) {
  const about = blogSettings || {}
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-purple-500/15 px-8 py-10 md:px-12">
        <h1 className="text-3xl font-semibold text-slate-900">{about.aboutTitle || 'About this blog'}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line">
          {about.aboutContent || 'Stories about building products, refining craft, and the lessons learned along the way.'}
        </p>
      </div>
      <div className="px-8 py-10 md:px-12 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">What you can expect</h2>
          <ul className="grid gap-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              Deep-dives on front-end architecture, performance and delightful UX.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              Product strategy notes from real-world builds and experiments.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              Behind-the-scenes updates on what I'm learning and shipping next.
            </li>
          </ul>
        </div>
        <aside className="lg:w-72 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Stay in the loop</h3>
          <p className="text-sm text-slate-600">Subscribe for new posts, no spam. Just ideas worth building.</p>
          <form className="space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-400"
            >
              Join the list
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}
About.propTypes = {
  blogSettings: PropTypes.shape({
    aboutTitle: PropTypes.string,
    aboutContent: PropTypes.string,
  }),
}
