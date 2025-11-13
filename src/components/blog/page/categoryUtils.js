const FALLBACK_CATEGORY = 'General'

function addUnique(list, seen, value) {
  const clean = String(value || '').trim()
  if (!clean) return
  const key = clean.toLowerCase()
  if (seen.has(key)) return
  seen.add(key)
  list.push(clean)
}

function addFromString(list, seen, value) {
  const text = String(value || '')
  if (!text.trim()) return
  text.split(',').forEach((chunk) => addUnique(list, seen, chunk))
}

export function deriveCategories(post, strategy = 'tag') {
  if (!post) return [FALLBACK_CATEGORY]

  if (strategy === 'title') {
    const firstWord = post?.title ? post.title.split(' ')[0] : ''
    return firstWord ? [firstWord] : [FALLBACK_CATEGORY]
  }

  const collected = []
  const seen = new Set()

  if (Array.isArray(post?.tech_tags)) {
    post.tech_tags.forEach((tag) => {
      if (typeof tag === 'string' && tag.includes(',')) {
        addFromString(collected, seen, tag)
      } else {
        addUnique(collected, seen, tag)
      }
    })
  }

  if (typeof post?.tag === 'string' && post.tag.trim()) {
    addFromString(collected, seen, post.tag)
  }

  return collected.length ? collected : [FALLBACK_CATEGORY]
}
