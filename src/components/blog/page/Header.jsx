import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../../assets/LogoEdwin.svg'
import { supabase } from '../../../supabase/client'

const navItems = [
  { to: '/react/blog', label: 'Home', end: true },
  { to: '/react/blog/about', label: 'About' },
  { to: '/react/blog/contact', label: 'Contact' },
  { to: '/react/', label: 'Portfolio' },
]

export default function Header({ accent }) {
  const navigate = useNavigate()
  const [loginLabel, setLoginLabel] = useState('Login')
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [session, setSession] = useState(null)

  const redirectTo = `${window.location.origin}/react/blog`

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoginLabel(data.session ? 'Logout' : 'Login')
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoginLabel(nextSession ? 'Logout' : 'Login')
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  async function signInWithEmail() {
    try {
      setLoading(true)
      setMsg('')
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      if (error) throw error
      setMsg('Check your email for a login link.')
      setShowForm(false)
      setEmail('')
    } catch (err) {
      setMsg(err.message || 'Could not send login link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign out error', error)
  }

  function handleLoginClick() {
    if (session) {
      signOut()
    } else {
      setShowForm((value) => !value)
    }
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/50 bg-white/70 px-6 py-4 shadow-lg backdrop-blur">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl shadow flex items-center justify-center"
          style={{
            background: accent?.logoGradient || 'linear-gradient(135deg, #0ea5e9 0%, rgba(56,189,248,.6) 60%, #6366f1 100%)',
            boxShadow: accent?.logoShadow || '0 20px 45px -26px rgba(56,189,248,0.12)',
          }}
        >
          <img src={logo} className="w-9 h-9" alt="logo" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Edwin Pedraza</h1>
          <p className="text-xs text-slate-500">Product design | Engineering | Notes</p>
        </div>
      </div>

      <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
        {navItems.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `rounded-full px-3 py-1 transition ${isActive ? 'bg-slate-900 text-white shadow' : 'hover:text-slate-900'}`
          }
        >
          {label}
        </NavLink>
      ))}
        {session && (
          <button
            onClick={() => navigate('/react/blog/create')}
            className="rounded-full bg-sky-500 px-3 py-1 text-white shadow hover:bg-sky-400"
          >
            New post
          </button>
        )}
      </nav>

      <div className="relative flex items-center gap-3">
        <button
          onClick={handleLoginClick}
          className="rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 backdrop-blur hover:bg-white/80"
        >
          {loginLabel}
        </button>
        {showForm && (
          <div className="absolute right-0 top-12 w-72 rounded-2xl border border-white/50 bg-white/70 p-4 shadow-xl backdrop-blur">
            <div className="text-sm font-medium text-slate-700">Sign in with your email</div>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-3 w-full rounded-xl border border-white/60 bg-white/60 px-3 py-2 text-sm backdrop-blur focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            <button
              disabled={loading || !email}
              onClick={signInWithEmail}
              className="mt-3 w-full rounded-xl bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-sky-400 disabled:bg-sky-400/50"
            >
              {loading ? 'Sending...' : 'Send link'}
            </button>
            {msg && <div className="mt-2 text-xs text-slate-500">{msg}</div>}
          </div>
        )}
      </div>
    </header>
  )
}
