import { useState } from 'react'
import { supabase } from '../../supabase/client'

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'portfolio'

export default function FileUploader({ label = 'File', bucket = DEFAULT_BUCKET, pathPrefix = 'downloads', value, onChange }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  function extractObjectPathFromPublicUrl(url) {
    try {
      const u = new URL(url)
      const marker = '/object/public/'
      const i = u.pathname.indexOf(marker)
      if (i === -1) return null
      const rest = u.pathname.slice(i + marker.length)
      const parts = rest.split('/')
      const bkt = parts.shift()
      if (!bkt || parts.length === 0) return null
      if (bucket && bkt !== bucket) return null
      return parts.join('/')
    } catch (_) {
      return null
    }
  }

  async function handleUpload() {
    if (!file) return
    setBusy(true)
    setMsg('')
    const ext = file.name.split('.').pop()
    const filePath = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true, cacheControl: '0' })
    if (error) {
      setMsg(`Upload failed: ${error.message}`)
      setBusy(false)
      return
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    const url = data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : ''
    if (url && onChange) onChange(url)
    setMsg('Uploaded - paste link into your post or save the record')
    setFile(null)
    setBusy(false)
  }

  async function handleRemove() {
    if (!value) {
      onChange?.('')
      return
    }
    setBusy(true)
    setMsg('')
    const objectPath = extractObjectPathFromPublicUrl(value)
    if (objectPath) {
      await supabase.storage.from(bucket).remove([objectPath])
    }
    onChange?.('')
    setMsg('Removed')
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm opacity-80">{label}</label>
      <input
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2"
        placeholder="https://example.com/download.pdf"
        value={value || ''}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input type="file" onChange={(event) => setFile(event.target.files?.[0] || null)} />
        <button
          type="button"
          disabled={!file || busy}
          onClick={handleUpload}
          className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:bg-slate-400"
        >
          {busy ? 'Uploading...' : 'Upload to Storage'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleRemove}
          className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:bg-rose-400"
        >
          {busy ? 'Removing...' : 'Delete file'}
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  )
}
