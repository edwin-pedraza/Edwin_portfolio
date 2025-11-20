import { useEffect, useMemo, useState } from 'react'
import ImageUploader from './ImageUploader'
import RichTextEditor from './RichTextEditor'
import {
  DEFAULT_ACCENT,
  DEFAULT_THEME_COLORS,
  DEFAULT_BLOG_SETTINGS,
  normalizeHexColor,
  normalizeThemeColors,
  normalizeBlogSettings,
  isValidHexCandidate,
} from './themeUtils'

const presetColors = ['#38bdf8', '#6366f1', '#0ea5e9', '#22c55e', '#f97316', '#ef4444', '#d946ef', '#14b8a6', '#eab308']
const initialThemeInputs = {
  base: DEFAULT_ACCENT,
  button: '',
  logo: '',
  lightShell: DEFAULT_THEME_COLORS.lightShell,
  darkShell: DEFAULT_THEME_COLORS.darkShell,
  heroOverlay: DEFAULT_THEME_COLORS.heroOverlay,
  heroCard: DEFAULT_THEME_COLORS.heroCard,
  heroChip: DEFAULT_THEME_COLORS.heroChip,
}

function ThemeForm({ themeColors, accent, loading, saving, message, error, onPreview, onSave, onReset }) {
  const [inputs, setInputs] = useState(initialThemeInputs)
  const [buttonCustom, setButtonCustom] = useState(false)
  const [logoCustom, setLogoCustom] = useState(false)

  useEffect(() => {
    setInputs({
      base: themeColors.base,
      button: themeColors.button || '',
      logo: themeColors.logo || '',
      lightShell: themeColors.lightShell,
      darkShell: themeColors.darkShell,
      heroOverlay: themeColors.heroOverlay,
      heroCard: themeColors.heroCard,
      heroChip: themeColors.heroChip,
    })
    setButtonCustom(Boolean(themeColors.button))
    setLogoCustom(Boolean(themeColors.logo))
  }, [themeColors])

  const baseValid = useMemo(() => isValidHexCandidate(inputs.base), [inputs.base])
  const buttonValid = useMemo(() => (!buttonCustom) || isValidHexCandidate(inputs.button), [buttonCustom, inputs.button])
  const logoValid = useMemo(() => (!logoCustom) || isValidHexCandidate(inputs.logo), [logoCustom, inputs.logo])
  const lightShellValid = useMemo(() => isValidHexCandidate(inputs.lightShell), [inputs.lightShell])
  const darkShellValid = useMemo(() => isValidHexCandidate(inputs.darkShell), [inputs.darkShell])
  const heroOverlayValid = useMemo(() => isValidHexCandidate(inputs.heroOverlay), [inputs.heroOverlay])
  const heroCardValid = useMemo(() => isValidHexCandidate(inputs.heroCard), [inputs.heroCard])
  const heroChipValid = useMemo(() => isValidHexCandidate(inputs.heroChip), [inputs.heroChip])
  const canSave = baseValid && buttonValid && logoValid && lightShellValid && darkShellValid && heroOverlayValid && heroCardValid && heroChipValid && !loading

  function preview(partial = {}, flagOverrides = {}) {
    const nextButtonCustom = flagOverrides.buttonCustom ?? buttonCustom
    const nextLogoCustom = flagOverrides.logoCustom ?? logoCustom

    const baseCandidate = partial.base ?? inputs.base
    if (!isValidHexCandidate(baseCandidate)) return

    const normalizedBase = normalizeHexColor(baseCandidate, DEFAULT_ACCENT)
    const normalized = {
      base: normalizedBase,
      button: '',
      logo: '',
      lightShell: normalizeHexColor(partial.lightShell ?? inputs.lightShell, DEFAULT_THEME_COLORS.lightShell),
      darkShell: normalizeHexColor(partial.darkShell ?? inputs.darkShell, DEFAULT_THEME_COLORS.darkShell),
    }

    if (nextButtonCustom) {
      const value = partial.button ?? inputs.button
      if (isValidHexCandidate(value)) normalized.button = normalizeHexColor(value, normalizedBase)
    }

    if (nextLogoCustom) {
      const value = partial.logo ?? inputs.logo
      if (isValidHexCandidate(value)) normalized.logo = normalizeHexColor(value, normalizedBase)
    }

    normalized.heroOverlay = normalizeHexColor(partial.heroOverlay ?? inputs.heroOverlay, DEFAULT_THEME_COLORS.heroOverlay)
    normalized.heroCard = normalizeHexColor(partial.heroCard ?? inputs.heroCard, normalized.heroOverlay)
    normalized.heroChip = normalizeHexColor(partial.heroChip ?? inputs.heroChip, normalizedBase)

    onPreview(normalized)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSave) return
    onSave({
      base: normalizeHexColor(inputs.base, DEFAULT_ACCENT),
      button: buttonCustom ? normalizeHexColor(inputs.button, inputs.base || DEFAULT_ACCENT) : '',
      logo: logoCustom ? normalizeHexColor(inputs.logo, inputs.base || DEFAULT_ACCENT) : '',
      lightShell: normalizeHexColor(inputs.lightShell, DEFAULT_THEME_COLORS.lightShell),
      darkShell: normalizeHexColor(inputs.darkShell, DEFAULT_THEME_COLORS.darkShell),
      heroOverlay: normalizeHexColor(inputs.heroOverlay, DEFAULT_THEME_COLORS.heroOverlay),
      heroCard: normalizeHexColor(inputs.heroCard, inputs.heroOverlay || DEFAULT_THEME_COLORS.heroCard),
      heroChip: normalizeHexColor(inputs.heroChip, inputs.base || DEFAULT_THEME_COLORS.heroChip),
    })
  }

  function handleHeroColorChange(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }))
    preview({ [key]: value })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[160px,1fr] sm:items-center">
          <label htmlFor="theme-base" className="text-sm font-medium text-slate-600 dark:text-slate-300">Primary accent</label>
          <div className="flex flex-wrap items-center gap-4">
            <input
              id="theme-base"
              type="color"
              value={normalizeHexColor(inputs.base, DEFAULT_ACCENT)}
              onChange={(event) => {
                setInputs((prev) => ({ ...prev, base: event.target.value }))
                preview({ base: event.target.value })
              }}
              className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
              aria-label="Pick primary accent color"
            />
            <input
              type="text"
              value={inputs.base}
              onChange={(event) => {
                setInputs((prev) => ({ ...prev, base: event.target.value }))
                preview({ base: event.target.value })
              }}
              placeholder="#38bdf8"
              className="min-w-[160px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
              style={{ '--tw-ring-color': accent.soft }}
              aria-invalid={!baseValid}
            />
            <button
              type="button"
              onClick={() => {
                setInputs({ ...initialThemeInputs })
                setButtonCustom(false)
                setLogoCustom(false)
                onReset()
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              style={{ '--tw-ring-color': accent.soft }}
            >
              Reset to default
            </button>
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">Quick picks</p>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setInputs((prev) => ({ ...prev, base: color }))
                  preview({ base: color })
                }}
                className="h-9 w-9 rounded-full border border-white/60 shadow-sm transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ backgroundColor: color, '--tw-ring-color': color }}
                aria-label={`Use ${color}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Hero spotlight</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Control the tint, card, and chip colors used on featured post overlays.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Overlay tint</label>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.heroOverlay, DEFAULT_THEME_COLORS.heroOverlay)}
                onChange={(event) => handleHeroColorChange('heroOverlay', event.target.value)}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick hero overlay color"
              />
              <input
                type="text"
                value={inputs.heroOverlay}
                onChange={(event) => handleHeroColorChange('heroOverlay', event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!heroOverlayValid}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Card background</label>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.heroCard, DEFAULT_THEME_COLORS.heroCard)}
                onChange={(event) => handleHeroColorChange('heroCard', event.target.value)}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick hero card color"
              />
              <input
                type="text"
                value={inputs.heroCard}
                onChange={(event) => handleHeroColorChange('heroCard', event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!heroCardValid}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Chip background</label>
            <div className="mt-3 flex items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.heroChip, DEFAULT_THEME_COLORS.heroChip)}
                onChange={(event) => handleHeroColorChange('heroChip', event.target.value)}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick hero chip color"
              />
              <input
                type="text"
                value={inputs.heroChip}
                onChange={(event) => handleHeroColorChange('heroChip', event.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!heroChipValid}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Buttons & call-to-actions</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Override the primary accent just for buttons.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={buttonCustom}
                onChange={(event) => {
                  setButtonCustom(event.target.checked)
                  if (event.target.checked) {
                    const value = inputs.button || inputs.base || DEFAULT_ACCENT
                    setInputs((prev) => ({ ...prev, button: value }))
                    preview({ button: value }, { buttonCustom: true })
                  } else {
                    setInputs((prev) => ({ ...prev, button: '' }))
                    preview({ button: '' }, { buttonCustom: false })
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 accent-[var(--admin-accent-base)] focus:ring-[var(--admin-accent-soft)]"
              />
              Use custom color
            </label>
          </div>
          {buttonCustom && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.button, inputs.base || DEFAULT_ACCENT)}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, button: event.target.value }))
                  preview({ button: event.target.value })
                }}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick button accent color"
              />
              <input
                type="text"
                value={inputs.button}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, button: event.target.value }))
                  preview({ button: event.target.value })
                }}
                placeholder={inputs.base}
                className="min-w-[160px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!buttonValid}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Logo halo</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Adjust the glow behind your logo badge.</p>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={logoCustom}
                onChange={(event) => {
                  setLogoCustom(event.target.checked)
                  if (event.target.checked) {
                    const value = inputs.logo || inputs.base || DEFAULT_ACCENT
                    setInputs((prev) => ({ ...prev, logo: value }))
                    preview({ logo: value }, { logoCustom: true })
                  } else {
                    setInputs((prev) => ({ ...prev, logo: '' }))
                    preview({ logo: '' }, { logoCustom: false })
                  }
                }}
                className="h-4 w-4 rounded border-slate-300 accent-[var(--admin-accent-base)] focus:ring-[var(--admin-accent-soft)]"
              />
              Use custom color
            </label>
          </div>
          {logoCustom && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.logo, inputs.base || DEFAULT_ACCENT)}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, logo: event.target.value }))
                  preview({ logo: event.target.value })
                }}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick logo accent color"
              />
              <input
                type="text"
                value={inputs.logo}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, logo: event.target.value }))
                  preview({ logo: event.target.value })
                }}
                placeholder={inputs.base}
                className="min-w-[160px] flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!logoValid}
              />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300">Page background</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Light mode</p>
            <div className="mt-4 flex items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.lightShell, DEFAULT_THEME_COLORS.lightShell)}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, lightShell: event.target.value }))
                  preview({ lightShell: event.target.value })
                }}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick light mode background color"
              />
              <input
                type="text"
                value={inputs.lightShell}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, lightShell: event.target.value }))
                  preview({ lightShell: event.target.value })
                }}
                placeholder={DEFAULT_THEME_COLORS.lightShell}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!lightShellValid}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Dark mode</p>
            <div className="mt-4 flex items-center gap-4">
              <input
                type="color"
                value={normalizeHexColor(inputs.darkShell, DEFAULT_THEME_COLORS.darkShell)}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, darkShell: event.target.value }))
                  preview({ darkShell: event.target.value })
                }}
                className="h-12 w-12 cursor-pointer rounded-xl border border-slate-200 bg-transparent p-1 shadow-sm dark:border-slate-700"
                aria-label="Pick dark mode background color"
              />
              <input
                type="text"
                value={inputs.darkShell}
                onChange={(event) => {
                  setInputs((prev) => ({ ...prev, darkShell: event.target.value }))
                  preview({ darkShell: event.target.value })
                }}
                placeholder={DEFAULT_THEME_COLORS.darkShell}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                style={{ '--tw-ring-color': accent.soft }}
                aria-invalid={!darkShellValid}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={!canSave || saving}
          className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: accent.button, color: accent.buttonContrast, '--tw-ring-color': accent.soft, opacity: canSave ? 1 : 0.6 }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
        <span className="text-xs text-slate-400 dark:text-slate-500">Changes apply instantly, saving keeps them for next time.</span>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${error ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          {error || message}
        </div>
      )}
    </form>
  )
}

function BlogLinksEditor({ links, onChange }) {
  function update(index, key, value) {
    const next = links.map((item, idx) => (idx === index ? { ...item, [key]: value } : item))
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {links.map((item, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={item.label}
            onChange={(event) => update(index, 'label', event.target.value)}
            placeholder="Label (LinkedIn, Portfolio, etc.)"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
          <div className="flex gap-2">
            <input
              value={item.url}
              onChange={(event) => update(index, 'url', event.target.value)}
              placeholder="https://"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            />
            <button
              type="button"
              onClick={() => onChange(links.filter((_, idx) => idx !== index))}
              className="rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...links, { label: '', url: '' }])}
        className="rounded-full border border-dashed border-slate-300 px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        Add link
      </button>
    </div>
  )
}

function BlogForm({ blogSettings, saving, accent, onPreview, onSave, onReset }) {
  const [inputs, setInputs] = useState(DEFAULT_BLOG_SETTINGS)

  useEffect(() => {
    setInputs(blogSettings)
  }, [blogSettings])

  function update(partial) {
    const next = { ...inputs, ...partial }
    setInputs(next)
    onPreview(next)
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(normalizeBlogSettings(inputs))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Blog hero</h3>
        <ImageUploader
          label="Banner image"
          bucket="Postimg"
          pathPrefix="blog-banner"
          value={inputs.bannerUrl}
          deletePrevious
          onChange={(value) => update({ bannerUrl: value })}
        />
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="blog-hero-heading">Banner heading</label>
          <input
            id="blog-hero-heading"
            value={inputs.bannerHeading}
            onChange={(event) => update({ bannerHeading: event.target.value })}
            placeholder="Banner heading"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            style={{ '--tw-ring-color': accent.soft }}
          />
        </div>
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400" htmlFor="blog-hero-subheading">Banner subheading</label>
          <textarea
            id="blog-hero-subheading"
            value={inputs.bannerSubheading}
            onChange={(event) => update({ bannerSubheading: event.target.value })}
            placeholder="Banner subheading"
            rows={2}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            style={{ '--tw-ring-color': accent.soft }}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Author block</h3>
        <ImageUploader
          label="Author avatar"
          bucket="Postimg"
          pathPrefix="author"
          value={inputs.authorAvatarUrl}
          deletePrevious
          onChange={(value) => update({ authorAvatarUrl: value })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={inputs.authorName}
            onChange={(event) => update({ authorName: event.target.value })}
            placeholder="Author name"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
          <input
            value={inputs.authorTitle}
            onChange={(event) => update({ authorTitle: event.target.value })}
            placeholder="Author title"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
        </div>
        <textarea
          value={inputs.authorBio}
          onChange={(event) => update({ authorBio: event.target.value })}
          placeholder="Short author bio"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          rows={4}
        />
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="categoryStrategy"
              value="tag"
              checked={inputs.categoryStrategy === 'tag'}
              onChange={(event) => update({ categoryStrategy: event.target.value })}
            />
            Use post tag for categories
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="categoryStrategy"
              value="title"
              checked={inputs.categoryStrategy === 'title'}
              onChange={(event) => update({ categoryStrategy: event.target.value })}
            />
            Derive from post title
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">About page</h3>
        <input
          value={inputs.aboutTitle}
          onChange={(event) => update({ aboutTitle: event.target.value })}
          placeholder="About page heading"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
        />
        <RichTextEditor
          value={inputs.aboutContent}
          onChange={(html) => update({ aboutContent: html })}
          accent={accent}
          placeholder="Tell your story — format with the toolbar above"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <ImageUploader
              label="About image (optional)"
              bucket="Postimg"
              pathPrefix="about"
              value={inputs.aboutImageUrl}
              deletePrevious
              onChange={(value) => update({ aboutImageUrl: value })}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Emphasis keywords (comma separated)</label>
            <input
              value={(inputs.aboutEmphasis || []).join(', ')}
              onChange={(event) => update({ aboutEmphasis: event.target.value.split(',').map((s)=>s.trim()).filter(Boolean) })}
              placeholder="Power BI, React, Supabase"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
            />
            <div className="flex gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(inputs.aboutLargeText)}
                  onChange={(e)=>update({ aboutLargeText: e.target.checked })}
                />
                Large intro text
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(inputs.aboutAccentBackground)}
                  onChange={(e)=>update({ aboutAccentBackground: e.target.checked })}
                />
                Accent background
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Contact</h3>
        <input
          value={inputs.contactHeadline}
          onChange={(event) => update({ contactHeadline: event.target.value })}
          placeholder="Headline"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={inputs.contactEmail}
            onChange={(event) => update({ contactEmail: event.target.value })}
            placeholder="Contact email"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
          <input
            value={inputs.contactLocation}
            onChange={(event) => update({ contactLocation: event.target.value })}
            placeholder="Location"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
          />
        </div>
        <BlogLinksEditor
          links={inputs.contactLinks || []}
          onChange={(next) => update({ contactLinks: next })}
        />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ backgroundColor: accent.button, color: accent.buttonContrast, '--tw-ring-color': accent.soft }}
        >
          {saving ? 'Saving...' : 'Save blog settings'}
        </button>
        <button
          type="button"
          onClick={() => {
            setInputs(DEFAULT_BLOG_SETTINGS)
            onReset()
          }}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Revert to default
        </button>
      </div>
    </form>
  )
}

export default function AdminSettings({
  themeColors,
  blogSettings,
  accent,
  loading,
  saving,
  message,
  error,
  onPreviewTheme,
  onPreviewBlog,
  onSaveTheme,
  onSaveBlog,
  onResetTheme,
  onResetBlog,
}) {
  const [tab, setTab] = useState('theme')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Fine-tune the blog experience and the admin theme.</p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200 bg-white/70 p-1 text-xs font-medium shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full transition ${tab === 'theme' ? 'bg-blue-500 text-white' : 'text-slate-500 dark:text-slate-300'}`}
            onClick={() => setTab('theme')}
          >
            Theme
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-full transition ${tab === 'blog' ? 'bg-blue-500 text-white' : 'text-slate-500 dark:text-slate-300'}`}
            onClick={() => setTab('blog')}
          >
            Blog
          </button>
        </div>
      </div>

      {tab === 'theme' ? (
        <ThemeForm
          themeColors={themeColors}
          accent={accent}
          loading={loading}
          saving={saving}
          message={message}
          error={error}
          onPreview={onPreviewTheme}
          onSave={onSaveTheme}
          onReset={onResetTheme}
        />
      ) : (
        <BlogForm
          blogSettings={blogSettings}
          saving={saving}
          accent={accent}
          onPreview={onPreviewBlog}
          onSave={onSaveBlog}
          onReset={() => {
            onResetBlog()
            onPreviewBlog(DEFAULT_BLOG_SETTINGS)
          }}
        />
      )}

      {(message || error) && tab === 'blog' && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${error ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          {error || message}
        </div>
      )}
    </div>
  )
}
