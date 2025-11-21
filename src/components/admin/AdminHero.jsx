import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { DEFAULT_BLOG_SETTINGS, normalizeBlogSettings } from './themeUtils'

const HERO_DEFAULTS = {
  headline_words: 'Professional Coder.\nFull Stack Developer.\nUI Designer.',
}

const emptyProfile = {
  full_name: '',
  github_url: '',
  linkedin_url: '',
}

function DeskLabelsEditor({ items, onChange }) {
  function update(index, key, value) {
    const next = (items || []).map((it, idx) => (idx === index ? { ...it, [key]: value } : it))
    onChange(next)
  }

  function add() {
    onChange([...(items || []), { mesh: '', label: '' }])
  }

  function remove(index) {
    onChange((items || []).filter((_, idx) => idx !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Desk labels</h4>
        <button
          type="button"
          onClick={add}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Add label
        </button>
      </div>
      {(items || []).map((it, idx) => (
        <div key={`${it.mesh || 'mesh'}-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
          <input
            className="md:col-span-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            placeholder="GLTF mesh name (exact e.g., plane002_1)"
            value={it.mesh}
            onChange={(e) => update(idx, 'mesh', e.target.value)}
          />
          <input
            className="md:col-span-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            placeholder="Label text (shown on hover)"
            value={it.label}
            onChange={(e) => update(idx, 'label', e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )
}

export default function AdminHero() {
  const [loading, setLoading] = useState(true)
  const [deskLabels, setDeskLabels] = useState(DEFAULT_BLOG_SETTINGS.deskLabels)
  const [settingsRowId, setSettingsRowId] = useState(null)
  const [blogSettings, setBlogSettings] = useState(DEFAULT_BLOG_SETTINGS)
  const [deskSaveState, setDeskSaveState] = useState({ saving: false, message: '', error: '' })

  const [heroRow, setHeroRow] = useState(null)
  const [heroForm, setHeroForm] = useState({ headline_words: HERO_DEFAULTS.headline_words })
  const [heroMessage, setHeroMessage] = useState('')
  const [heroError, setHeroError] = useState('')
  const [heroSaving, setHeroSaving] = useState(false)

  const [profileRow, setProfileRow] = useState(null)
  const [profileForm, setProfileForm] = useState(emptyProfile)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const [{ data, error }, { data: heroData, error: heroErr }, { data: profileData, error: profileErr }] = await Promise.all([
        supabase.from('settings').select('id, blog').limit(1).maybeSingle(),
        supabase.from('hero_config').select('*').order('created_at').limit(1),
        supabase.from('profile').select('*').order('id').limit(1),
      ])
      if (cancelled) return
      if (error) {
        setDeskSaveState((prev) => ({ ...prev, error: error.message || 'Could not load desk labels' }))
        setLoading(false)
        return
      }
      if (heroErr) {
        setHeroError(heroErr.message || 'Could not load hero settings')
        setLoading(false)
        return
      }
      if (profileErr) {
        setProfileError(profileErr.message || 'Could not load profile info')
        setLoading(false)
        return
      }
      const normalized = normalizeBlogSettings(data?.blog || DEFAULT_BLOG_SETTINGS)
      setBlogSettings(normalized)
      setDeskLabels(normalized.deskLabels || [])
      setSettingsRowId(data?.id || null)
      const heroRowVal = Array.isArray(heroData) && heroData.length > 0 ? heroData[0] : null
      setHeroRow(heroRowVal)
      setHeroForm({
        headline_words: Array.isArray(heroRowVal?.headline_words)
          ? heroRowVal.headline_words.join('\n')
          : heroRowVal?.headline_words || HERO_DEFAULTS.headline_words,
      })
      const profileVal = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : null
      setProfileRow(profileVal)
      setProfileForm({
        full_name: profileVal?.full_name || '',
        github_url: profileVal?.github_url || '',
        linkedin_url: profileVal?.linkedin_url || '',
      })
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSave(event) {
    event.preventDefault()
    setDeskSaveState({ saving: true, message: '', error: '' })
    const nextBlog = normalizeBlogSettings({ ...blogSettings, deskLabels })
    try {
      if (settingsRowId) {
        const { error } = await supabase.from('settings').update({ blog: nextBlog }).eq('id', settingsRowId)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('settings').insert({ blog: nextBlog }).select('id').single()
        if (error) throw error
        if (data?.id) setSettingsRowId(data.id)
      }
      setBlogSettings(nextBlog)
      setDeskSaveState({ saving: false, message: 'Desk labels saved', error: '' })
    } catch (err) {
      setDeskSaveState({ saving: false, message: '', error: err.message || 'Could not save desk labels' })
    }
  }

  async function handleHeroSave(event) {
    event.preventDefault()
    setHeroSaving(true)
    setHeroMessage('')
    setHeroError('')
    const payload = {
      headline_words: heroForm.headline_words
        ? heroForm.headline_words.split('\n').map((line) => line.trim()).filter(Boolean)
        : null,
    }
    try {
      if (heroRow?.id) {
        const { error } = await supabase.from('hero_config').update(payload).eq('id', heroRow.id)
        if (error) throw error
        setHeroMessage('Hero settings updated')
      } else {
        const { data, error } = await supabase.from('hero_config').insert(payload).select('*').single()
        if (error) throw error
        setHeroRow(data)
        setHeroMessage('Hero settings saved')
      }
    } catch (err) {
      setHeroError(err.message || 'Could not save hero settings')
    } finally {
      setHeroSaving(false)
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')
    setProfileError('')
    const payload = {
      full_name: profileForm.full_name || null,
      github_url: profileForm.github_url || null,
      linkedin_url: profileForm.linkedin_url || null,
    }
    try {
      if (profileRow?.id) {
        const { error } = await supabase.from('profile').update(payload).eq('id', profileRow.id)
        if (error) throw error
        setProfileMessage('Profile links updated')
      } else {
        const { data, error } = await supabase.from('profile').insert(payload).select('*').single()
        if (error) throw error
        setProfileRow(data)
        setProfileMessage('Profile links saved')
      }
    } catch (err) {
      setProfileError(err.message || 'Could not save profile links')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Hero</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleProfileSave} className="space-y-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={profileForm.full_name}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, full_name: event.target.value }))}
                placeholder="Name"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              />
              <input
                value={profileForm.github_url}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, github_url: event.target.value }))}
                placeholder="GitHub URL"
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              />
            </div>
            <input
              value={profileForm.linkedin_url}
              onChange={(event) => setProfileForm((prev) => ({ ...prev, linkedin_url: event.target.value }))}
              placeholder="LinkedIn URL"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-600/50"
              >
                {profileSaving ? 'Saving…' : 'Save hero links'}
              </button>
              {(profileMessage || profileError) && (
                <span className={`text-sm ${profileError ? 'text-rose-500' : 'text-emerald-600'}`}>{profileError || profileMessage}</span>
              )}
            </div>
          </form>

          <form onSubmit={handleHeroSave} className="space-y-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Headline words (typewriter) — one per line</label>
              <textarea
                rows={4}
                value={heroForm.headline_words}
                onChange={(event) => setHeroForm((prev) => ({ ...prev, headline_words: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                placeholder="Business Analytics\nProcess Automation"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={heroSaving}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-600/50"
              >
                {heroSaving ? 'Saving…' : 'Save hero settings'}
              </button>
              {(heroMessage || heroError) && (
                <span className={`text-sm ${heroError ? 'text-rose-500' : 'text-emerald-600'}`}>{heroError || heroMessage}</span>
              )}
            </div>
          </form>

          <form onSubmit={handleSave} className="space-y-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-600">
              Map the GLTF mesh names from your 3D desk model to the hover labels that appear in the hero section. Use the
              same mesh names you see in Blender or the GLB inspector.
            </p>
            <DeskLabelsEditor items={deskLabels} onChange={setDeskLabels} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={deskSaveState.saving}
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:bg-blue-600/50"
              >
                {deskSaveState.saving ? 'Saving…' : 'Save desk labels'}
              </button>
              {(deskSaveState.message || deskSaveState.error) && (
                <span className={`text-sm ${deskSaveState.error ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {deskSaveState.error || deskSaveState.message}
                </span>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
