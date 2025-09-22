import { useEffect, useMemo, useState } from 'react'
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
import AdminSettings from './AdminSettings'
import {
  DEFAULT_THEME_COLORS,
  DEFAULT_BLOG_SETTINGS,
  getReadableTextColor,
  hexToRgb,
  normalizeThemeColors,
  normalizeBlogSettings,
  parseSettingsPayload,
  serializeSettingsPayload,
  toRgba,
} from './themeUtils'

const allowedAdminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

const navigationItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'hero', label: 'Hero' },
  { key: 'education', label: 'Education' },
  { key: 'experience', label: 'Experience' },
  { key: 'service', label: 'Services' },
  { key: 'technology', label: 'Technologies' },
  { key: 'project', label: 'Projects' },
  { key: 'posts', label: 'Blog Posts' },
  { key: 'testimonial', label: 'Testimonials' },
  { key: 'settings', label: 'Settings' },
]

const dashboardPanels = [
  { key: 'project', title: 'Projects', description: 'Manage and update projects' },
  { key: 'posts', title: 'Blog Posts', description: 'Write and publish posts' },
  { key: 'technology', title: 'Technologies', description: 'Manage tech icons' },
  { key: 'service', title: 'Services', description: 'What you do' },
  { key: 'education', title: 'Education', description: 'Resume - Education' },
  { key: 'experience', title: 'Experience', description: 'Resume - Experience' },
  { key: 'settings', title: 'Theme', description: 'Adjust branding colors' },
]

const themeConfig = {
  light: {
    shell: 'text-slate-900 bg-white',
    sidebar: 'bg-white/90 border border-slate-200 text-slate-600 shadow-sm',
    sidebarNavButton: 'text-slate-600 hover:bg-slate-100',
    header: 'bg-white/90 border border-slate-200 text-slate-900 shadow-sm',
    headerDescription: 'text-slate-500',
    mobileSelect: 'bg-white border-slate-300 text-slate-600 focus:border-slate-400 focus:ring-slate-200',
    card: 'border-slate-200 bg-white text-slate-900',
    cardTitle: 'text-slate-900',
    cardDescription: 'text-slate-500',
    contentPanel: 'bg-white/95 border border-slate-200 text-slate-900 shadow-sm',
    signedInPanel: 'bg-slate-50 border border-slate-200 text-slate-500',
    logoRing: 'border-slate-100',
    muted: 'text-slate-500',
    segmented: 'border-slate-200 bg-white/80',
    segmentedButton: 'text-slate-500 hover:bg-slate-100',
  },
  dark: {
    shell: 'text-slate-100 bg-slate-900',
    sidebar: 'bg-slate-900/60 border border-slate-800 text-slate-300 shadow-lg shadow-black/20 backdrop-blur',
    sidebarNavButton: 'text-slate-300 hover:bg-slate-800/60',
    header: 'bg-slate-900/60 border border-slate-800 text-slate-100 shadow-lg shadow-black/20 backdrop-blur',
    headerDescription: 'text-slate-400',
    mobileSelect: 'bg-slate-900/70 border-slate-700 text-slate-200 focus:border-slate-600 focus:ring-slate-700',
    card: 'border-slate-800 bg-slate-900/60 text-slate-100',
    cardTitle: 'text-white',
    cardDescription: 'text-slate-300',
    contentPanel: 'bg-slate-900/70 border border-slate-800 text-slate-100 shadow-lg shadow-black/20 backdrop-blur',
    signedInPanel: 'bg-slate-900/40 border border-slate-800 text-slate-400',
    logoRing: 'border-slate-800',
    muted: 'text-slate-400',
    segmented: 'border-slate-700 bg-slate-900/40',
    segmentedButton: 'text-slate-400 hover:bg-slate-800/70',
  },
}

function createAccentPalette(themeColors, theme) {
  const normalized = normalizeThemeColors(themeColors)
  const { base, button, logo, lightShell, darkShell } = normalized

  const baseRgb = hexToRgb(base)
  const buttonRgb = button ? hexToRgb(button) : baseRgb
  const logoRgb = logo ? hexToRgb(logo) : baseRgb

  const baseContrast = getReadableTextColor(base)
  const buttonContrast = getReadableTextColor(button || base)

  const soft = baseRgb ? toRgba(baseRgb, theme === 'light' ? 0.18 : 0.3) : 'rgba(56, 189, 248, 0.18)'
  const softer = baseRgb ? toRgba(baseRgb, theme === 'light' ? 0.08 : 0.18) : 'rgba(56, 189, 248, 0.08)'
  const border = baseRgb ? toRgba(baseRgb, theme === 'light' ? 0.35 : 0.45) : 'rgba(56, 189, 248, 0.35)'
  const cardGlow = baseRgb
    ? theme === 'light'
      ? `0 22px 45px -28px ${toRgba(baseRgb, 0.5)}`
      : `0 26px 55px -30px ${toRgba(baseRgb, 0.55)}`
    : undefined

  const logoGradient = logoRgb
    ? theme === 'light'
      ? `linear-gradient(135deg, ${toRgba(logoRgb, 0.9)} 0%, ${toRgba(logoRgb, 0.35)} 60%, ${toRgba(logoRgb, 0.08)} 100%)`
      : `linear-gradient(135deg, ${toRgba(logoRgb, 0.7)} 0%, ${toRgba(logoRgb, 0.3)} 55%, ${toRgba(logoRgb, 0.08)} 100%)`
    : undefined

  const logoShadow = logoRgb
    ? theme === 'light'
      ? `0 20px 45px -26px ${toRgba(logoRgb, 0.5)}`
      : `0 22px 55px -32px ${toRgba(logoRgb, 0.55)}`
    : undefined

  return {
    base,
    button: button || base,
    logo: logo || base,
    lightShell,
    darkShell,
    baseContrast,
    buttonContrast,
    soft,
    softer,
    border,
    cardGlow,
    logoGradient,
    logoShadow,
    cssVars: {
      '--admin-accent-base': base,
      '--admin-accent-base-contrast': baseContrast,
      '--admin-accent-button': button || base,
      '--admin-accent-button-contrast': buttonContrast,
      '--admin-accent-soft': soft,
      '--admin-accent-softer': softer,
      '--admin-shell-light': lightShell,
      '--admin-shell-dark': darkShell,
    },
  }
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [tab, setTab] = useState('dashboard')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [theme, setTheme] = useState('light')
  const [themeColors, setThemeColors] = useState(DEFAULT_THEME_COLORS)
  const [blogSettings, setBlogSettings] = useState(DEFAULT_BLOG_SETTINGS)
  const [settingsRowId, setSettingsRowId] = useState(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState('')
  const [settingsError, setSettingsError] = useState('')

  const sessionEmail = session?.user?.email?.toLowerCase() || ''
  const isSessionAuthorized = allowedAdminEmails.includes(sessionEmail)
  const themeStyles = themeConfig[theme]

  const accent = useMemo(() => createAccentPalette(themeColors, theme), [themeColors, theme])

  const sectionComponents = {
    profile: <AdminProfile />,
    hero: <AdminHero />,
    education: <AdminEducation />,
    experience: <AdminExperience />,
    service: <AdminService />,
    technology: <AdminTechnology />,
    project: <AdminProject />,
    posts: <AdminPost />,
    testimonial: <AdminTestimonial />,
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session || !isSessionAuthorized) return
    let canceled = false
    async function loadSettings() {
      try {
        setSettingsLoading(true)
        setSettingsError('')
        const { data, error } = await supabase.from('settings').select('id, theme, blog, theme_color').limit(1)
        if (error) throw error
        const row = data?.[0]
        if (!canceled) {
          if (row) {
            setSettingsRowId(row.id)
            if (row.theme || row.blog) {
              setThemeColors(normalizeThemeColors(row.theme || DEFAULT_THEME_COLORS))
              setBlogSettings(normalizeBlogSettings(row.blog || DEFAULT_BLOG_SETTINGS))
            } else {
              const parsed = parseSettingsPayload(row.theme_color)
              setThemeColors(parsed.theme)
              setBlogSettings(parsed.blog)
            }
          } else {
            setSettingsRowId(null)
            setThemeColors({ ...DEFAULT_THEME_COLORS })
          }
        }
      } catch (error) {
        if (!canceled) setSettingsError(error.message || 'Could not load settings')
      } finally {
        if (!canceled) setSettingsLoading(false)
      }
    }
    loadSettings()
    return () => { canceled = true }
  }, [session, isSessionAuthorized])

  useEffect(() => {
    if (session && !isSessionAuthorized) {
      setMsg('This account is not authorized to access the admin console')
      supabase.auth.signOut()
    }
  }, [session, isSessionAuthorized])

  async function sendMagicLink() {
    setSending(true)
    setMsg('')
    const normalizedEmail = email.trim().toLowerCase()

    if (!allowedAdminEmails.length) {
      setMsg('Admin access is not configured. Set VITE_ADMIN_EMAILS and reload the page.')
      setSending(false)
      return
    }

    if (!allowedAdminEmails.includes(normalizedEmail)) {
      setMsg('This email is not authorized to access the admin console')
      setSending(false)
      return
    }

    const redirectTo = window.location.origin + '/react/admin'
    const { error } = await supabase.auth.signInWithOtp({ email: normalizedEmail, options: { emailRedirectTo: redirectTo } })
    if (error) setMsg('Could not send login link'); else setMsg('Check your email for the login link')
    setSending(false)
  }

  function handlePreviewColors(partialColors) {
    setSettingsMsg('')
    setSettingsError('')
    setThemeColors((previous) => normalizeThemeColors({ ...previous, ...partialColors }))
  }

  function handlePreviewBlogSettings(partialBlog) {
    setSettingsMsg('')
    setSettingsError('')
    setBlogSettings((previous) => normalizeBlogSettings({ ...previous, ...partialBlog }))
  }

  async function handleSaveColors(nextColors) {
    const normalized = normalizeThemeColors(nextColors)
    setThemeColors(normalized)
    setSettingsSaving(true)
    setSettingsMsg('')
    setSettingsError('')

    try {
      const payloadText = serializeSettingsPayload({ theme: normalized, blog: blogSettings })
      if (settingsRowId) {
        const { error } = await supabase
          .from('settings')
          .update({ theme: normalized, blog: blogSettings, theme_color: payloadText })
          .eq('id', settingsRowId)
        if (error) throw error
        setSettingsMsg('Theme updated')
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert({ theme: normalized, blog: blogSettings, theme_color: payloadText })
          .select('id')
          .single()
        if (error) throw error
        if (data?.id) setSettingsRowId(data.id)
        setSettingsMsg('Theme saved')
      }
    } catch (error) {
      setSettingsError(error.message || 'Could not save theme settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  async function handleSaveBlogSettings(nextBlog) {
    const normalized = normalizeBlogSettings(nextBlog)
    setBlogSettings(normalized)
    setSettingsSaving(true)
    setSettingsMsg('')
    setSettingsError('')

    try {
      const payloadText = serializeSettingsPayload({ theme: themeColors, blog: normalized })
      if (settingsRowId) {
        const { error } = await supabase
          .from('settings')
          .update({ theme: themeColors, blog: normalized, theme_color: payloadText })
          .eq('id', settingsRowId)
        if (error) throw error
        setSettingsMsg('Blog settings updated')
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert({ theme: themeColors, blog: normalized, theme_color: payloadText })
          .select('id')
          .single()
        if (error) throw error
        if (data?.id) setSettingsRowId(data.id)
        setSettingsMsg('Blog settings saved')
      }
    } catch (error) {
      setSettingsError(error.message || 'Could not save blog settings')
    } finally {
      setSettingsSaving(false)
    }
  }

  function handleResetColors() {
    const defaults = { ...DEFAULT_THEME_COLORS }
    setThemeColors(defaults)
    setSettingsMsg('')
    setSettingsError('')
  }

  function handleResetBlog() {
    const defaults = { ...DEFAULT_BLOG_SETTINGS }
    setBlogSettings(defaults)
    setSettingsMsg('')
    setSettingsError('')
  }

  function handleThemeSelection(nextTheme) {
    setTheme(nextTheme)
  }

  const adminConfigured = useMemo(() => allowedAdminEmails.length > 0, [])

  if (!session || !isSessionAuthorized) {
    const isError = msg.toLowerCase().includes('could not') || msg.toLowerCase().includes('not authorized') || msg.toLowerCase().includes('not configured')
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-md border border-white/15 p-8 rounded-2xl text-white shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <img src={logo} alt="Portfolio logo" className="w-16 h-16 mb-4 rounded-2xl border border-white/20 shadow-lg" />
            <h1 className="text-2xl font-light tracking-[0.2em] uppercase">Admin Login</h1>
            <p className="mt-3 text-sm font-light text-white/80 max-w-xs">Enter your email to receive a magic login link.</p>
            {!allowedAdminEmails.length && (
              <p className="mt-4 text-xs text-amber-200/80">
                Admin access is disabled until VITE_ADMIN_EMAILS is configured with your authorized address.
              </p>
            )}
          </div>
          <label className="text-xs uppercase tracking-wide text-white/60 mb-2 block">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/15 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/20 transition-all"
            autoFocus
          />
          <button
            disabled={!email || sending || !allowedAdminEmails.length}
            onClick={sendMagicLink}
            className="mt-6 w-full px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 transition-colors disabled:bg-sky-500/40 disabled:cursor-not-allowed font-medium tracking-wide uppercase"
          >
            {sending ? 'Sending...' : 'Send link'}
          </button>
          {msg && (
            <div className={`mt-6 text-sm font-light text-center ${isError ? 'text-rose-300' : 'text-emerald-300'}`}>{msg}</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${themeStyles.shell}`}
      style={{
        ...accent.cssVars,
        backgroundColor: theme === 'light' ? accent.lightShell : accent.darkShell,
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[260px,1fr] lg:px-8">
        <aside className={`hidden h-full rounded-3xl p-6 lg:flex lg:flex-col lg:gap-8 ${themeStyles.sidebar}`}>
          <div className="flex items-center gap-3">
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border p-2 shadow-sm ${themeStyles.logoRing}`}
              style={{ background: accent.logoGradient, boxShadow: accent.logoShadow }}
            >
              <img src={logo} alt="logo" className="h-full w-full object-contain opacity-90" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">Admin Console</p>
              <p className={`text-sm ${themeStyles.muted}`}>Manage your portfolio content</p>
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navigationItems.map(({ key, label }) => {
              const isActive = tab === key
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 ${themeStyles.sidebarNavButton}`}
                  style={{
                    '--tw-ring-color': accent.soft,
                    backgroundColor: isActive ? accent.base : undefined,
                    color: isActive ? accent.baseContrast : undefined,
                    boxShadow: isActive ? accent.cardGlow : undefined,
                    borderColor: isActive ? accent.border : undefined,
                  }}
                >
                  <span>{label}</span>
                  {isActive && (
                    <span style={{ color: accent.baseContrast, opacity: 0.8, fontSize: '0.7rem', letterSpacing: '0.2em' }}>Active</span>
                  )}
                </button>
              )
            })}
          </nav>
          <div className={`mt-auto rounded-2xl p-4 text-xs ${themeStyles.signedInPanel}`}>
            <p className="font-semibold">Signed in</p>
            <p className="mt-1 truncate">{session?.user?.email}</p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col gap-6">
          <header className={`rounded-3xl p-6 ${themeStyles.header}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Admin Console</h1>
                <p className={`mt-1 text-sm ${themeStyles.headerDescription}`}>A focused workspace to curate your portfolio content.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div
                  className={`flex items-center gap-1 rounded-full border px-1 py-1 text-xs font-medium shadow-sm transition ${themeStyles.segmented}`}
                  style={{ '--tw-ring-color': accent.soft }}
                >
                  {[
                    { key: 'light', label: 'Light mode', icon: 'sun' },
                    { key: 'dark', label: 'Dark mode', icon: 'moon' },
                  ].map(({ key, label, icon }) => {
                    const isActive = theme === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleThemeSelection(key)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${themeStyles.segmentedButton}`}
                        style={{
                          backgroundColor: isActive ? accent.base : 'transparent',
                          color: isActive ? accent.baseContrast : undefined,
                        }}
                        aria-pressed={isActive}
                      >
                        {icon === 'sun' ? (
                          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="5" />
                            <path d="M12 1v2m0 18v2m11-11h-2M5 12H3m15.95 7.95-1.41-1.41M6.46 6.46 5.05 5.05m12.9 0-1.41 1.41M6.46 17.54l-1.41 1.41" />
                          </svg>
                        ) : (
                          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                        )}
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="text-left text-xs sm:text-right">
                  <p className={`uppercase tracking-wide ${themeStyles.headerDescription}`}>Signed in as</p>
                  <p className="font-semibold">{session?.user?.email}</p>
                </div>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center justify-center rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <div className="lg:hidden">
            <label className={`mb-2 block text-sm font-medium ${themeStyles.headerDescription}`} htmlFor="admin-section">Navigate</label>
            <select
              id="admin-section"
              value={tab}
              onChange={(event) => setTab(event.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 ${themeStyles.mobileSelect}`}
              style={{ '--tw-ring-color': accent.soft }}
            >
              {navigationItems.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <main className="flex-1 space-y-6 pb-10">
            {tab === 'dashboard' ? (
              <section className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {dashboardPanels.map(({ key, title, description }) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => setTab(key)}
                      className={`group flex h-full flex-col justify-between rounded-3xl border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 ${themeStyles.card}`}
                      style={{ '--tw-ring-color': accent.soft }}
                    >
                      <div>
                        <p className="text-sm font-medium uppercase tracking-wide" style={{ color: accent.base }}>{navigationItems.find((item) => item.key === key)?.label}</p>
                        <h2 className={`mt-2 text-lg font-semibold ${themeStyles.cardTitle}`}>{title}</h2>
                        <p className={`mt-1 text-sm ${themeStyles.cardDescription}`}>{description}</p>
                      </div>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: accent.base }}>
                        Open
                        <svg aria-hidden="true" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ) : (
              <section className={`rounded-3xl p-6 ${themeStyles.contentPanel}`}>
                {tab === 'settings' ? (
                  <AdminSettings
                    themeColors={themeColors}
                    blogSettings={blogSettings}
                    accent={accent}
                    loading={settingsLoading}
                    saving={settingsSaving}
                    message={settingsMsg}
                    error={settingsError}
                    onPreviewTheme={handlePreviewColors}
                    onPreviewBlog={handlePreviewBlogSettings}
                    onSaveTheme={handleSaveColors}
                    onSaveBlog={handleSaveBlogSettings}
                    onResetTheme={handleResetColors}
                    onResetBlog={handleResetBlog}
                  />
                ) : (
                  sectionComponents[tab] ?? null
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
