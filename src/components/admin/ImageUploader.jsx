import { useState } from 'react'
import { supabase } from '../../supabase/client'

const DEFAULT_BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || 'portfolio'

export default function ImageUploader({ label = 'Image', bucket = DEFAULT_BUCKET, pathPrefix = 'uploads', value, onChange, deletePrevious = false }) {
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
      // Only delete if it belongs to the same bucket
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
    const { error: upErr } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true, cacheControl: '0' })
    if (upErr) {
      setMsg(`Upload failed: ${upErr.message}`)
      setBusy(false)
      return
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
    const url = data?.publicUrl
    const cacheBusted = url ? `${url}?v=${Date.now()}` : url
    if (cacheBusted && onChange) onChange(cacheBusted)

    // Optionally delete previous object in this bucket
    if (deletePrevious && value) {
      const prevPath = extractObjectPathFromPublicUrl(value)
      if (prevPath) {
        await supabase.storage.from(bucket).remove([prevPath])
      }
    }
    setMsg('Uploaded — remember to click Update to save')
    setBusy(false)
    setFile(null)
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm opacity-80">{label}</label>
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="preview" className="h-12 w-12 rounded object-cover ring-1 ring-slate-200" />
          <input className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2" value={value} onChange={e=>onChange?.(e.target.value)} placeholder="Image URL" />
        </div>
      ) : (
        <input className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2" value={value || ''} onChange={e=>onChange?.(e.target.value)} placeholder="Image URL (optional)" />
      )}
      <div className="flex items-center gap-2">
        <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="text-sm" />
        <button type="button" disabled={!file || busy} onClick={handleUpload} className="rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm disabled:bg-emerald-600/50">{busy ? 'Uploading…' : 'Upload to Storage'}</button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
      <div className="text-xs opacity-70">Uses Supabase Storage bucket "{bucket}". Ensure it exists and is public (or add policies).</div>
    </div>
  )
}
