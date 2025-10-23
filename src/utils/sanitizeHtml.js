export default function sanitizeHtml(html) {
  if (!html) return ''
  return String(html)
    // Strip script/style tags entirely
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    // Remove inline event handlers and javascript: urls
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\sjavascript:[^'"]*/gi, '')
}
