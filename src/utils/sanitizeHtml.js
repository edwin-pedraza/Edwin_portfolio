import DOMPurify from 'dompurify'

export default function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(String(html), {
    ALLOWED_TAGS: [
      'h1','h2','h3','h4','h5','h6','p','br','hr',
      'strong','em','b','i','u','s','mark','code','pre','blockquote',
      'ul','ol','li','a','img','table','thead','tbody','tr','th','td',
    ],
    ALLOWED_ATTR: ['href','src','alt','title','target','rel','class','id'],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: false,
  })
}
