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

// Centralized section metadata used by sidebar and dashboard
const SECTION_META = [
  { key: 'dashboard', label: 'Dashboard', description: 'Overview & quick access', category: 'both', actions: ['Jump to section'] },
  { key: 'profile', label: 'Profile', description: 'Personal and contact info', category: 'portfolio', actions: ['Edit profile', 'Social links'] },
  { key: 'hero', label: 'Hero', description: 'Landing headline and CTA', category: 'portfolio', actions: ['Edit headline', 'Change image'] },
  { key: 'education', label: 'Education', description: 'Resume - Education', category: 'portfolio', actions: ['Add school', 'Reorder items'] },
  { key: 'experience', label: 'Experience', description: 'Resume - Experience', category: 'portfolio', actions: ['Add role', 'Reorder items'] },
  { key: 'service', label: 'Services', description: 'What you do', category: 'portfolio', actions: ['Add service', 'Edit copy'] },
  { key: 'technology', label: 'Technologies', description: 'Manage tech icons', category: 'portfolio', actions: ['Add icon', 'Reorder grid'] },
  { key: 'project', label: 'Projects', description: 'Manage and update projects', category: 'portfolio', actions: ['Add project', 'Update links'] },
  { key: 'posts', label: 'Blog Posts', description: 'Write and publish posts', category: 'blog', actions: ['Write post', 'Manage tags'] },
  { key: 'testimonial', label: 'Testimonials', description: 'Client feedback', category: 'portfolio', actions: ['Add testimonial', 'Reorder items'] },
  { key: 'settings', label: 'Settings', description: 'Adjust branding colors', category: 'both', actions: ['Theme colors', 'Blog settings'] },
]

function SectionIcon({ name, className }) {
  const common = 'h-5 w-5'
  switch (name) {
    case 'dashboard':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13h8V3H3v10zM13 21h8v-8h-8v8zM13 3v6h8V3h-8zM3 21h8v-6H3v6z"/></svg>
      )
    case 'profile':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      )
    case 'hero':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="6" rx="2"/><path d="M3 14h10M3 18h7"/></svg>
      )
    case 'education':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 1.5 9 1.5 12 0v-5"/></svg>
      )
    case 'experience':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
      )
    case 'service':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
      )
    case 'technology':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M2 13h20M6 21v-4M18 21v-4"/></svg>
      )
    case 'project':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
      )
    case 'posts':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h18M3 8h18M7 12h14M7 16h10M7 20h6"/></svg>
      )
    case 'testimonial':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
      )
    case 'settings':
      return (
        <svg className={`${common} ${className || ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06A2 2 0 1 1 7.04 3.7l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.39 1.26 1 1.51.3.12.62.18.95.18H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      )
    default:
      return null
  }
}

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
  const [space, setSpace] = useState(() => localStorage.getItem('admin-space') || 'portfolio')
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
  const [sectionStats, setSectionStats] = useState({})

  const sessionEmail = session?.user?.email?.toLowerCase() || ''
  const isSessionAuthorized = allowedAdminEmails.includes(sessionEmail)
  const themeStyles = themeConfig[theme]

  const accent = useMemo(() => createAccentPalette(themeColors, theme), [themeColors, theme])
  const openButtonArrowStyle = useMemo(() => {
    const rgb = hexToRgb(accent.buttonContrast)
    if (!rgb) return { color: accent.buttonContrast }
    return {
      color: accent.buttonContrast,
      borderColor: toRgba(rgb, theme === 'light' ? 0.35 : 0.45),
      backgroundColor: toRgba(rgb, theme === 'light' ? 0.14 : 0.25),
    }
  }, [accent.buttonContrast, theme])

  const filteredSections = useMemo(() => SECTION_META.filter((s) =>
    space === 'portfolio'
      ? (s.category === 'portfolio' || s.category === 'both')
      : (s.category === 'blog' || s.category === 'both')
  ), [space])
  const navigationItems = useMemo(() => filteredSections.map(({ key, label }) => ({ key, label })), [filteredSections])
  const dashboardPanels = useMemo(() => filteredSections.filter((s) => s.key !== 'dashboard'), [filteredSections])

  const sectionComponents = {
    profile: <AdminProfile />,
    hero: <AdminHero />,
    education: <AdminEducation />,
    experience: <AdminExperience />,
    service: <AdminService />,
    technology: <AdminTechnology />,
    project: <AdminProject />,
    posts: <AdminPost accent={accent} />,
    testimonial: <AdminTestimonial />,
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    localStorage.setItem('admin-space', space)
    if (!filteredSections.some((s) => s.key === tab)) setTab('dashboard')
  }, [space, filteredSections, tab])

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
    if (!session || !isSessionAuthorized) return
    let canceled = false
    async function countRows(table) {
      try {
        const { count } = await supabase.from(table).select('id', { count: 'exact', head: true })
        return count || 0
      } catch (_) { return 0 }
    }
    async function firstImage(table, columns = 'image_url') {
      try {
        const { data } = await supabase
          .from(table)
          .select(`id, ${columns}`)
          .order('created_at', { ascending: false })
          .limit(1)
        const row = data?.[0]
        if (!row) return ''
        // prefer first non-empty field among possible names
        const field = ['image_url','cover_url','icon_url','photo_url','banner_url']
          .find((k) => Object.prototype.hasOwnProperty.call(row, k) && row[k])
        return (field && row[field]) || ''
      } catch (_) { return '' }
    }
    async function loadOverviewStats() {
      const [
        profileRow,
        projectsCount, projectsPreview,
        postsCount, postsPreview,
        techCount, techPreview,
        serviceCount, servicePreview,
        eduCount,
        expCount,
        testiCount,
      ] = await Promise.all([
        supabase.from('profile').select('full_name, photo_url').limit(1).maybeSingle(),
        countRows('project'), firstImage('project'),
        countRows('post'), firstImage('post', 'cover_url'),
        countRows('technology'), firstImage('technology', 'icon_url'),
        countRows('service'), firstImage('service', 'icon_url'),
        countRows('education'),
        countRows('experience'),
        countRows('testimonial'),
      ])

      if (canceled) return
      const profile = profileRow?.data || null
      setSectionStats({
        profile: { count: profile ? 1 : 0, previewUrl: profile?.photo_url || '', subtitle: profile?.full_name || '' },
        project: { count: projectsCount, previewUrl: projectsPreview },
        posts: { count: postsCount, previewUrl: postsPreview },
        technology: { count: techCount, previewUrl: techPreview },
        service: { count: serviceCount, previewUrl: servicePreview },
        education: { count: eduCount },
        experience: { count: expCount },
        testimonial: { count: testiCount },
      })
    }
    loadOverviewStats()
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

  function getUserAvatarInfo() {
    const meta = session?.user?.user_metadata || {}
    const emailVal = session?.user?.email || ''
    const display = meta.full_name || meta.name || emailVal
    const initials = (display || '')
      .replace(/[^a-zA-Z ]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join('') || 'EP'
    return { avatarUrl: meta.avatar_url || meta.picture || '', initials, email: emailVal }
  }

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
        <aside className={`hidden h-full rounded-3xl p-6 lg:flex lg:flex-col lg:gap-8 lg:sticky lg:top-10 ${themeStyles.sidebar}`}>
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
          <nav className="flex flex-col gap-2" role="navigation" aria-label="Admin sections">
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
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl" style={{ background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent', color: isActive ? accent.baseContrast : undefined }}>
                      <SectionIcon name={key} />
                    </span>
                    {label}
                  </span>
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
                        aria-label={label}
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
                <div
                  className={`flex items-center gap-1 rounded-full border px-1 py-1 text-xs font-medium shadow-sm transition ${themeStyles.segmented}`}
                  style={{ '--tw-ring-color': accent.soft }}
                >
                  {[
                    { key: 'portfolio', label: 'Portfolio' },
                    { key: 'blog', label: 'Blog' },
                  ].map(({ key, label }) => {
                    const isActive = space === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSpace(key)}
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 transition ${themeStyles.segmentedButton}`}
                        style={{
                          backgroundColor: isActive ? accent.base : 'transparent',
                          color: isActive ? accent.baseContrast : undefined,
                        }}
                        aria-pressed={isActive}
                        aria-label={label}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                {(() => {
                  const { email } = getUserAvatarInfo()
                  return (
                    <div className="flex items-center gap-4">
                      <div className="text-left text-xs sm:text-right">
                        <p className={`uppercase tracking-wide ${themeStyles.headerDescription}`}>Signed in as</p>
                        <p className="font-semibold truncate max-w-[200px] sm:max-w-[260px]" title={email}>{email}</p>
                      </div>
                      <button
                        onClick={() => supabase.auth.signOut()}
                        className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2"
                        style={{
                          backgroundColor: accent.button,
                          color: accent.buttonContrast,
                          boxShadow: accent.cardGlow,
                        }}
                        aria-label="Sign out"
                      >
                        <svg aria-hidden="true" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'currentColor' }}>
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <path d="M16 17l5-5-5-5" />
                          <path d="M21 12H9" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )
                })()}
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
              <section className={`rounded-3xl p-0 ${themeStyles.contentPanel}`}>
                <div className="border-b px-6 py-5">
                  <h2 className="text-lg font-semibold">Overview</h2>
                  <p className={`mt-1 text-sm ${themeStyles.cardDescription}`}>Quick access to every section, with actions.</p>
                </div>
                <div className="divide-y">
                  {dashboardPanels.map(({ key, label, description, actions }) => {
                    const stats = sectionStats[key] || {}
                    const hasPreview = Boolean(stats.previewUrl)
                    return (
                    <div key={key} className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-[1fr,220px,auto] sm:items-center">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: accent.softer, color: accent.base }}>
                          <SectionIcon name={key} />
                        </span>
                        <div>
                          <div className="text-sm font-medium uppercase tracking-wide" style={{ color: accent.base }}>{label}</div>
                          <div className={`text-base font-semibold ${themeStyles.cardTitle}`}>{label}</div>
                          <p className={`mt-0.5 text-sm ${themeStyles.cardDescription}`}>{description}</p>
                          {typeof stats.count === 'number' && (
                            <div className="mt-1 text-xs opacity-70">{stats.count} item{stats.count === 1 ? '' : 's'}</div>
                          )}
                          {Array.isArray(actions) && actions.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {actions.slice(0, 4).map((action) => (
                                <span
                                  key={action}
                                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
                                  style={{ borderColor: accent.border, color: accent.base }}
                                  title={action}
                                >
                                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 5v14M5 12h14" />
                                  </svg>
                                  {action}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {hasPreview ? (
                          <img src={stats.previewUrl} alt={`${label} preview`} className="h-24 w-36 rounded-xl object-cover shadow" />
                        ) : (
                          <div className="h-24 w-36 rounded-xl border border-dashed flex items-center justify-center text-xs opacity-60">No preview</div>
                        )}
                      </div>
                      <div className="sm:text-right">
                        <button
                          type="button"
                          onClick={() => setTab(key)}
                          className="group inline-flex items-center gap-3 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus-visible:ring-2"
                          style={{ backgroundColor: accent.button, color: accent.buttonContrast, boxShadow: accent.cardGlow, '--tw-ring-color': accent.soft }}
                        >
                          <span>Open</span>
                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:shadow-md"
                            style={openButtonArrowStyle}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path d="M5 12h14" />
                              <path d="M12 5l7 7-7 7" />
                            </svg>
                          </span>
                        </button>
                      </div>
                    </div>
                  )})}
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
