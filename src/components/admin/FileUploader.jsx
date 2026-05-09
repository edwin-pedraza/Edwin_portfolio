import { useState } from 'react'
import { getToken } from '../../api/client'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export default function FileUploader({ label = 'File', bucket = 'Postimg', pathPrefix = 'downloads', value, onChange }) {
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
      setMsg('Uploaded')
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
      <input
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2"
        placeholder="https://example.com/download.pdf"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="button" disabled={!file || busy} onClick={handleUpload}
          className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:bg-slate-400">
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        {msg && <span className="text-xs text-slate-500">{msg}</span>}
      </div>
    </div>
  )
}
