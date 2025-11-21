import PropTypes from 'prop-types'
import { useState } from 'react'
import emailjs from '@emailjs/browser'

const EMAIL_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAIL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAIL_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAIL_ENABLED = Boolean(EMAIL_SERVICE_ID && EMAIL_TEMPLATE_ID && EMAIL_PUBLIC_KEY)

export default function Contact({ blogSettings }) {
  const contact = blogSettings || {}
  const links = contact.contactLinks || []

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.name || !form.email || !form.message) {
      setFeedback({ type: 'error', text: 'Please provide your name, email, and a message.' })
      return
    }

    if (!EMAIL_ENABLED) {
      const targetEmail = contact.contactEmail || 'hello@example.com'
      const mailto = `mailto:${targetEmail}?subject=${encodeURIComponent(form.subject || 'Portfolio contact')}&body=${encodeURIComponent(`${form.message}\n\nFrom: ${form.name} (${form.email})`)}`
      window.location.href = mailto
      return
    }

    setSending(true)
    setFeedback(null)
    try {
      await emailjs.send(
        EMAIL_SERVICE_ID,
        EMAIL_TEMPLATE_ID,
        {
          from_name: form.name,
          reply_to: form.email,
          subject: form.subject || 'Portfolio contact',
          message: `${form.message}\n\nReply at: ${form.name} <${form.email}>`,
          to_email: contact.contactEmail || 'hello@example.com',
        },
        EMAIL_PUBLIC_KEY
      )
      setFeedback({ type: 'success', text: 'Thanks for reaching out! I will reply shortly.' })
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error?.text || 'Message could not be sent. Please email me directly.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-8 py-10 md:px-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Let’s connect</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          {contact.contactHeadline || "Have a project in mind or just want to say hi? Drop a note and I’ll get back within two working days."}
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <textarea
            rows={6}
            placeholder="Tell me about your idea"
            value={form.message}
            onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="submit"
            disabled={sending}
            className="rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
          {feedback && (
            <div className={`text-sm ${feedback.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
              {feedback.text}
            </div>
          )}
          {!EMAIL_ENABLED && (
            <p className="text-xs text-slate-500">Email service isn’t configured, so your default mail app will open.</p>
          )}
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
            <p className="mt-1">{contact.contactLocation || 'Based in Australia. Working worldwide.'}</p>
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
