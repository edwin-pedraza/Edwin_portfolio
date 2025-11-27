const rawBase = import.meta.env.BASE_URL || '/'
const trimmedBase = rawBase.endsWith('/') && rawBase !== '/' ? rawBase.slice(0, -1) : rawBase

// Returns a path prefixed with the Vite/GitHub Pages base.
export function withBase(path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`
  if (trimmedBase === '/') return normalized
  return `${trimmedBase}${normalized}`
}

export const basePath = trimmedBase
