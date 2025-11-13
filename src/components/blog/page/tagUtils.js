export function splitTagString(value) {
  if (!value || typeof value !== 'string') return []
  return value
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean)
}

export function buildTechTagList(techTags, excluded = []) {
  if (!Array.isArray(techTags)) return []
  const seen = new Set(excluded.map((tag) => tag.toLowerCase()))
  const unique = []
  techTags.forEach((tag) => {
    const clean = String(tag || '').trim()
    if (!clean) return
    const key = clean.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    unique.push(clean)
  })
  return unique
}

export function combineTagSources(tagString, techTags) {
  const base = splitTagString(tagString)
  const extras = buildTechTagList(techTags, base)
  return [...base, ...extras]
}
