import PropTypes from 'prop-types'

export default function Footer({ blogSettings }) {
  const links = blogSettings?.contactLinks || []
  return (
    <footer className="rounded-3xl border border-slate-200 bg-white px-6 py-6 text-sm text-slate-500 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-slate-700 font-semibold">{blogSettings?.authorName || 'Edwin Pedraza'}</div>
          <div>{blogSettings?.contactLocation || 'Based in Australia. Working worldwide.'}</div>
        </div>
        <div className="flex flex-wrap gap-4">
          {links.map((item, idx) => (
            <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-sky-500">
              {item.label}
            </a>
          ))}
        </div>
        <div className="text-xs text-slate-400">&copy; {new Date().getFullYear()} Edwin Pedraza. All rights reserved.</div>
      </div>
    </footer>
  )
}
Footer.propTypes = {
  blogSettings: PropTypes.shape({
    authorName: PropTypes.string,
    contactLocation: PropTypes.string,
    contactLinks: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
    })),
  }),
}
