export const DEFAULT_ACCENT = '#38bdf8'

const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export const DEFAULT_THEME_COLORS = Object.freeze({
  base: DEFAULT_ACCENT,
  button: '',
  logo: '',
  lightShell: '#f1f5f9',
  darkShell: '#0f172a',
})

export const DEFAULT_BLOG_SETTINGS = Object.freeze({
  bannerUrl: '',
  bannerHeading: 'Edwin Pedraza - Blog',
  bannerSubheading: 'Insights & updates on design, engineering and strategy.',
  authorName: 'Edwin Pedraza',
  authorTitle: 'Author',
  authorBio: 'Thoughts on web, data and product. Tutorials, notes and experiments.',
  authorAvatarUrl: '',
  categoryStrategy: 'tag',
  aboutTitle: 'About this blog',
  aboutContent: 'I share detailed write-ups on front-end craft, system design, and the lessons I learn while building products.',
  aboutImageUrl: '',
  aboutLargeText: true,
  aboutAccentBackground: false,
  aboutEmphasis: [],
  contactHeadline: 'Let\'s build something great together.',
  contactEmail: 'hello@example.com',
  contactLocation: 'Based in Australia. Working worldwide.',
  contactLinks: [
    { label: 'Portfolio', url: '/react/' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/edwinpedraza' },
  ],
})

export function normalizeHexColor(value, fallback = DEFAULT_ACCENT) {
  if (!value || typeof value !== 'string') return fallback
  let hex = value.trim()
  if (!HEX_PATTERN.test(hex)) return fallback
  if (!hex.startsWith('#')) hex = `#${hex}`
  if (hex.length === 4) {
    const [, r, g, b] = hex
    hex = `#${r}${r}${g}${g}${b}${b}`
  }
  return hex.toLowerCase()
}

export function isValidHexCandidate(value) {
  if (!value || typeof value !== 'string') return false
  return HEX_PATTERN.test(value.trim())
}

export function normalizeThemeColors(colors = DEFAULT_THEME_COLORS) {
  const base = normalizeHexColor(colors?.base ?? DEFAULT_ACCENT, DEFAULT_ACCENT)
  const button = colors?.button ? normalizeHexColor(colors.button, base) : ''
  const logo = colors?.logo ? normalizeHexColor(colors.logo, base) : ''
  const lightShell = normalizeHexColor(colors?.lightShell ?? DEFAULT_THEME_COLORS.lightShell, DEFAULT_THEME_COLORS.lightShell)
  const darkShell = normalizeHexColor(colors?.darkShell ?? DEFAULT_THEME_COLORS.darkShell, DEFAULT_THEME_COLORS.darkShell)
  return { base, button, logo, lightShell, darkShell }
}

export function normalizeContactLinks(links) {
  if (!Array.isArray(links)) return DEFAULT_BLOG_SETTINGS.contactLinks
  return links
    .map((item) => ({
      label: String(item?.label ?? '').trim(),
      url: String(item?.url ?? '').trim(),
    }))
    .filter((item) => item.label && item.url)
}

export function normalizeBlogSettings(input = DEFAULT_BLOG_SETTINGS) {
  const normalized = {
    bannerUrl: input?.bannerUrl ? String(input.bannerUrl).trim() : '',
    bannerHeading: input?.bannerHeading ? String(input.bannerHeading).trim() : DEFAULT_BLOG_SETTINGS.bannerHeading,
    bannerSubheading: input?.bannerSubheading ? String(input.bannerSubheading).trim() : DEFAULT_BLOG_SETTINGS.bannerSubheading,
    authorName: input?.authorName ? String(input.authorName).trim() : DEFAULT_BLOG_SETTINGS.authorName,
    authorTitle: input?.authorTitle ? String(input.authorTitle).trim() : DEFAULT_BLOG_SETTINGS.authorTitle,
    authorBio: input?.authorBio ? String(input.authorBio).trim() : DEFAULT_BLOG_SETTINGS.authorBio,
    authorAvatarUrl: input?.authorAvatarUrl ? String(input.authorAvatarUrl).trim() : '',
    categoryStrategy: input?.categoryStrategy === 'title' ? 'title' : 'tag',
    aboutTitle: input?.aboutTitle ? String(input.aboutTitle).trim() : DEFAULT_BLOG_SETTINGS.aboutTitle,
    aboutContent: input?.aboutContent ? String(input.aboutContent).trim() : DEFAULT_BLOG_SETTINGS.aboutContent,
    aboutImageUrl: input?.aboutImageUrl ? String(input.aboutImageUrl).trim() : '',
    aboutLargeText: Boolean(input?.aboutLargeText),
    aboutAccentBackground: Boolean(input?.aboutAccentBackground),
    aboutEmphasis: Array.isArray(input?.aboutEmphasis)
      ? input.aboutEmphasis.map((s) => String(s).trim()).filter(Boolean)
      : typeof input?.aboutEmphasis === 'string'
        ? String(input.aboutEmphasis)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    contactHeadline: input?.contactHeadline ? String(input.contactHeadline).trim() : DEFAULT_BLOG_SETTINGS.contactHeadline,
    contactEmail: input?.contactEmail ? String(input.contactEmail).trim() : DEFAULT_BLOG_SETTINGS.contactEmail,
    contactLocation: input?.contactLocation ? String(input.contactLocation).trim() : DEFAULT_BLOG_SETTINGS.contactLocation,
    contactLinks: normalizeContactLinks(input?.contactLinks),
  }
  return normalized
}

export function parseThemeColors(value) {
  if (!value) return DEFAULT_THEME_COLORS

  if (typeof value === 'object' && !Array.isArray(value)) {
    return normalizeThemeColors(value)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return DEFAULT_THEME_COLORS

    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        return normalizeThemeColors(parsed)
      } catch (_) {
        return DEFAULT_THEME_COLORS
      }
    }

    return normalizeThemeColors({ base: trimmed })
  }

  return DEFAULT_THEME_COLORS
}

export function serializeThemeColors(colors) {
  const normalized = normalizeThemeColors(colors)
  return JSON.stringify(normalized)
}

export function parseSettingsPayload(value) {
  if (!value) {
    return { theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS }
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return { theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS }
    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && (parsed.theme || parsed.blog)) {
        return {
          theme: normalizeThemeColors(parsed.theme || DEFAULT_THEME_COLORS),
          blog: normalizeBlogSettings(parsed.blog || DEFAULT_BLOG_SETTINGS),
        }
      }
      // Fallback for legacy payload storing raw theme object
      if (parsed && parsed.base) {
        return { theme: normalizeThemeColors(parsed), blog: DEFAULT_BLOG_SETTINGS }
      }
    } catch (_) {
      return { theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS }
    }
  }

  if (typeof value === 'object') {
    if (value.theme || value.blog) {
      return {
        theme: normalizeThemeColors(value.theme || DEFAULT_THEME_COLORS),
        blog: normalizeBlogSettings(value.blog || DEFAULT_BLOG_SETTINGS),
      }
    }
    if (value.base) {
      return { theme: normalizeThemeColors(value), blog: DEFAULT_BLOG_SETTINGS }
    }
  }

  return { theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS }
}

export function serializeSettingsPayload({ theme, blog }) {
  return JSON.stringify({
    theme: normalizeThemeColors(theme),
    blog: normalizeBlogSettings(blog),
  })
}

export function hexToRgb(hexValue) {
  const hex = normalizeHexColor(hexValue)
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!match) return null
  const intVal = parseInt(match[1], 16)
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  }
}

function relativeLuminanceFromRgb({ r, g, b }) {
  const srgb = [r, g, b].map((value) => {
    const channel = value / 255
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

export function getReadableTextColor(hexValue, { light = '#f8fafc', dark = '#0f172a' } = {}) {
  const rgb = hexToRgb(hexValue)
  if (!rgb) return dark
  const luminance = relativeLuminanceFromRgb(rgb)
  return luminance > 0.5 ? dark : light
}

export function toRgba({ r, g, b }, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function buildAccentPalette(themeColors, mode = 'light') {
  const normalized = normalizeThemeColors(themeColors)
  const fallbackRgb = { r: 56, g: 189, b: 248 }

  const base = normalized.base
  const button = normalized.button || base
  const logo = normalized.logo || base

  const baseRgb = hexToRgb(base) || fallbackRgb
  const buttonRgb = hexToRgb(button) || baseRgb
  const logoRgb = hexToRgb(logo) || baseRgb

  const baseContrast = getReadableTextColor(base)
  const buttonContrast = getReadableTextColor(button)

  const soft = toRgba(baseRgb, mode === 'light' ? 0.18 : 0.3)
  const softer = toRgba(baseRgb, mode === 'light' ? 0.08 : 0.18)
  const border = toRgba(baseRgb, mode === 'light' ? 0.35 : 0.45)

  const cardGlow = mode === 'light'
    ? `0 22px 45px -28px ${toRgba(baseRgb, 0.18)}`
    : `0 26px 55px -30px ${toRgba(baseRgb, 0.28)}`

  const logoGradient = mode === 'light'
    ? `linear-gradient(135deg, ${toRgba(logoRgb, 1)} 0%, ${toRgba(baseRgb, 0.6)} 60%, ${toRgba(buttonRgb, 1)} 100%)`
    : `linear-gradient(135deg, ${toRgba(logoRgb, 1)} 0%, ${toRgba(baseRgb, 0.55)} 55%, ${toRgba(buttonRgb, 1)} 100%)`

  const logoShadow = mode === 'light'
    ? `0 20px 45px -26px ${toRgba(baseRgb, 0.12)}`
    : `0 22px 55px -32px ${toRgba(baseRgb, 0.18)}`

  return {
    base,
    button,
    logo,
    lightShell: normalized.lightShell,
    darkShell: normalized.darkShell,
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
      '--admin-accent-button': button,
      '--admin-accent-button-contrast': buttonContrast,
      '--admin-accent-soft': soft,
      '--admin-accent-softer': softer,
      '--admin-shell-light': normalized.lightShell,
      '--admin-shell-dark': normalized.darkShell,
    },
  }
}
