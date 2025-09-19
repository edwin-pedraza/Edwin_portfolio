import PropTypes from 'prop-types'

export default function Contact({ blogSettings }) {
  const contact = blogSettings || {}
  const links = contact.contactLinks || []
  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-8 py-10 md:px-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Let's connect</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          {contact.contactHeadline || 'Have a project in mind or just want to say hi? Drop a note and I\'ll get back within two working days.'}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input type="text" placeholder="Name" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200" />
            <input type="email" placeholder="Email" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          </div>
          <input type="text" placeholder="Subject" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          <textarea rows={6} placeholder="Tell me about your idea" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200" />
          <button type="submit" className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-400">Send message</button>
        </form>
        <aside className="space-y-5 text-sm text-slate-600">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</div>
            <a href={`mailto:${contact.contactEmail || 'hello@example.com'}`} className="mt-1 inline-block text-slate-700 hover:text-sky-500">
              {contact.contactEmail || 'hello@example.com'}
            </a>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</div>
            <p className="mt-1">{contact.contactLocation || 'Based in Australia · Working worldwide'}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Elsewhere</div>
            <ul className="mt-2 space-y-2">
              {links.map((item, idx) => (
                <li key={idx}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-slate-700 hover:text-sky-500">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
Contact.propTypes = {
  blogSettings: PropTypes.shape({
    contactHeadline: PropTypes.string,
    contactEmail: PropTypes.string,
    contactLocation: PropTypes.string,
    contactLinks: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      url: PropTypes.string,
    })),
  }),
}
