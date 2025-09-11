import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { logo } from '../../assets'
import AdminEducation from './AdminEducation'
import AdminExperience from './AdminExperience'
import AdminService from './AdminService'
import AdminTechnology from './AdminTechnology'
import AdminProject from './AdminProject'
import AdminTestimonial from './AdminTestimonial'
import AdminPost from './AdminPost'
import AdminProfile from './AdminProfile'
import AdminHero from './AdminHero'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => authListener.subscription.unsubscribe()
  }, [])

  async function sendMagicLink() {
    setSending(true)
    setMsg('')
    const redirectTo = window.location.origin + '/react/admin'
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    if (error) setMsg('Could not send login link'); else setMsg('Check your email for the login link')
    setSending(false)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/5 p-6 rounded-xl text-white">
          <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
          <p className="text-sm opacity-80 mb-3">Enter your email to receive a magic login link.</p>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-3 py-2 rounded bg-white/10" />
          <button disabled={!email || sending} onClick={sendMagicLink} className="mt-3 w-full px-3 py-2 rounded bg-blue-600 disabled:bg-blue-600/50">{sending ? 'Sending…' : 'Send link'}</button>
          {msg && <div className="mt-2 text-sm">{msg}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white p-0 md:p-4">
      <div className="flex justify-between items-center px-4 md:px-0 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="logo" className="w-10 h-10 rounded-lg border border-white/10 bg-primary" />
          <div>
            <h1 className="text-2xl font-semibold leading-tight">Admin Console</h1>
            <div className="text-xs opacity-70">Manage your portfolio content</div>
          </div>
        </div>
        <button onClick={()=>supabase.auth.signOut()} className="px-3 py-2 rounded bg-rose-600 hover:bg-rose-500">Sign out</button>
      </div>
      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 bg-white/5 rounded-xl border border-white/10 p-2">
          {[
            ['dashboard','Dashboard'],
            ['profile','Profile'],
            ['hero','Hero'],
            ['education','Education'],
            ['experience','Experience'],
            ['service','Services'],
            ['technology','Technologies'],
            ['project','Projects'],
            ['posts','Blog Posts'],
            ['testimonial','Testimonials'],
          ].map(([key,label]) => (
            <button key={key} onClick={()=>setTab(key)} className={`w-full text-left px-3 py-2 rounded-lg transition ${tab===key ? 'bg-blue-600' : 'hover:bg-white/10'}`}>{label}</button>
          ))}
        </aside>

        {/* Content */}
        <main className="flex-1">
          {tab==='dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['project','Projects','Manage and update projects'],
                ['posts','Blog Posts','Write and publish posts'],
                ['technology','Technologies','Manage tech icons'],
                ['service','Services','What you do'],
                ['education','Education','Resume — Education'],
                ['experience','Experience','Resume — Experience'],
              ].map(([key,title,desc]) => (
                <div key={key} className="bg-white/5 rounded-xl border border-white/10 p-4 hover:bg-white/10 transition cursor-pointer" onClick={()=>setTab(key)}>
                  <div className="text-lg font-semibold mb-1">{title}</div>
                  <div className="text-sm opacity-70">{desc}</div>
                  <div className="mt-3 text-blue-400 text-sm">Open →</div>
                </div>
              ))}
            </div>
          )}

          {tab==='profile' && <AdminProfile />}
          {tab==='hero' && <AdminHero />}
          {tab==='education' && <AdminEducation />}
          {tab==='experience' && <AdminExperience />}
          {tab==='service' && <AdminService />}
          {tab==='technology' && <AdminTechnology />}
          {tab==='project' && <AdminProject />}
          {tab==='posts' && <AdminPost />}
          {tab==='testimonial' && <AdminTestimonial />}
        </main>
      </div>
    </div>
  )
}
