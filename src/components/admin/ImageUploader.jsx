import { useState } from 'react'
import { getToken } from '../../api/client'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function ImageUploader({ label = 'Image', bucket = 'portfolio', pathPrefix = 'uploads', value, onChange, deletePrevious = false }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleUpload() {
    if (!file) return
    setBusy(true)
    setMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${API_URL}/upload/${bucket}/${pathPrefix}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + getToken() },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      if (onChange) onChange(data.url)
      setMsg('Uploaded — remember to click Update to save')
    } catch (err) {
      setMsg('Upload failed: ' + err.message)
    } finally {
      setBusy(false)
      setFile(null)
    }
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
        <button type="button" disabled={!file || busy} onClick={handleUpload} className="rounded-full bg-emerald-600 px-3 py-1.5 text-white shadow-sm disabled:bg-emerald-600/50">{busy ? 'Uploading…' : 'Upload'}</button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  )
}
