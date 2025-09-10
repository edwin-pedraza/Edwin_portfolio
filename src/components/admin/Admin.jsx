import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import AdminEducation from './AdminEducation'
import AdminExperience from './AdminExperience'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('education')
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
    <div className="min-h-screen text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <button onClick={()=>supabase.auth.signOut()} className="px-3 py-2 rounded bg-rose-600">Sign out</button>
      </div>
      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-2 rounded ${tab==='education'?'bg-blue-600':'bg-white/10'}`} onClick={()=>setTab('education')}>Education</button>
        <button className={`px-3 py-2 rounded ${tab==='experience'?'bg-blue-600':'bg-white/10'}`} onClick={()=>setTab('experience')}>Experience</button>
      </div>
      {tab==='education' && <AdminEducation />}
      {tab==='experience' && <AdminExperience />}
    </div>
  )
}

