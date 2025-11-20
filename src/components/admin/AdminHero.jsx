import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { DEFAULT_BLOG_SETTINGS, normalizeBlogSettings } from './themeUtils'

const MODES = ['laptop', 'donut', 'scatter', 'logo']

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
        <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Portfolio desk labels</h4>
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
  const empty = {
    default_mode: 'laptop',
    logo_text: 'EDWIN - DEV - DATA',
    headline_words: 'Professional Coder.\nFull Stack Developer.\nUI Designer.',
  }
  const [row, setRow] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deskLabels, setDeskLabels] = useState(DEFAULT_BLOG_SETTINGS.deskLabels)
  const [deskLabelsSaving, setDeskLabelsSaving] = useState(false)
  const [deskLabelsMsg, setDeskLabelsMsg] = useState('')
  const [deskLabelsError, setDeskLabelsError] = useState('')
  const [settingsRowId, setSettingsRowId] = useState(null)
  const [blogSettings, setBlogSettings] = useState(DEFAULT_BLOG_SETTINGS)

  async function fetchData() {
    setLoading(true)
    const [{ data: heroData }, { data: settingsData }] = await Promise.all([
      supabase.from('hero_config').select('*').order('created_at').limit(1),
      supabase.from('settings').select('id, blog').limit(1).maybeSingle(),
    ])
    const first = (heroData && heroData[0]) || null
    setRow(first)
    setForm({
      default_mode: first?.default_mode || empty.default_mode,
      logo_text: first?.logo_text || empty.logo_text,
      headline_words: Array.isArray(first?.headline_words)
        ? first.headline_words.join('\n')
        : first?.headline_words || empty.headline_words,
    })
    const normalizedBlog = normalizeBlogSettings(settingsData?.blog || DEFAULT_BLOG_SETTINGS)
    setBlogSettings(normalizedBlog)
    setDeskLabels(normalizedBlog.deskLabels || [])
    setSettingsRowId(settingsData?.id || null)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      default_mode: form.default_mode,
      logo_text: form.logo_text || null,
      headline_words: form.headline_words ? form.headline_words.split('\n').map((s) => s.trim()).filter(Boolean) : null,
    }
    if (row?.id) {
      const { error } = await supabase.from('hero_config').update(payload).eq('id', row.id)
      if (error) setMsg(`Update failed: ${error.message}`)
      else {
        setMsg('Updated')
        fetchData()
      }
    } else {
      const { error } = await supabase.from('hero_config').insert(payload)
      if (error) setMsg(`Insert failed: ${error.message}`)
      else {
        setMsg('Inserted')
        fetchData()
      }
    }
    setSaving(false)
  }

  async function handleSaveDeskLabels(event) {
    event.preventDefault()
    setDeskLabelsSaving(true)
    setDeskLabelsMsg('')
    setDeskLabelsError('')
    const normalized = normalizeBlogSettings({ ...blogSettings, deskLabels })
    try {
      if (settingsRowId) {
        const { error } = await supabase.from('settings').update({ blog: normalized }).eq('id', settingsRowId)
        if (error) throw error
        setDeskLabelsMsg('Desk labels updated')
      } else {
        const { data, error } = await supabase
          .from('settings')
          .insert({ blog: normalized })
          .select('id')
          .single()
        if (error) throw error
        if (data?.id) setSettingsRowId(data.id)
        setDeskLabelsMsg('Desk labels saved')
      }
      setBlogSettings(normalized)
      setDeskLabels(normalized.deskLabels)
    } catch (error) {
      setDeskLabelsError(error.message || 'Could not save desk labels')
    } finally {
      setDeskLabelsSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Hero</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm"
          >
            <div>
              <label className="block text-sm opacity-80 mb-1">Default 3D mode</label>
              <select
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                value={form.default_mode}
                onChange={(e) => setForm({ ...form, default_mode: e.target.value })}
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <input
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              placeholder="Logo text (for 'logo' mode)"
              value={form.logo_text}
              onChange={(e) => setForm({ ...form, logo_text: e.target.value })}
            />
            <div className="md:col-span-2">
              <label className="block text-sm opacity-80 mb-1">Headline words (typewriter) - one per line</label>
              <textarea
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
                rows={5}
                value={form.headline_words}
                onChange={(e) => setForm({ ...form, headline_words: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded"
                type="submit"
              >
                {saving ? 'Saving...' : row?.id ? 'Update' : 'Create'}
              </button>
              {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
            </div>
          </form>

          <section className="bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Portfolio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Map GLTF mesh names to your hover labels for the hero workspace. Names are case-insensitive.
              </p>
            </div>
            <DeskLabelsEditor items={deskLabels} onChange={setDeskLabels} />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDeskLabels}
                disabled={deskLabelsSaving}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400"
              >
                {deskLabelsSaving ? 'Saving labels...' : 'Save desk labels'}
              </button>
              {(deskLabelsMsg || deskLabelsError) && (
                <span className={`text-sm ${deskLabelsError ? 'text-rose-500' : 'text-emerald-600'}`}>
                  {deskLabelsError || deskLabelsMsg}
                </span>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
