import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import ImageUploader from './ImageUploader'

export default function AdminProfile() {
  const emptyProfile = { full_name: '', github_url: '', linkedin_url: '', about_text: '', photo_url: '' }
  const [row, setRow] = useState(null)
  const [form, setForm] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  async function fetchData() {
    setLoading(true)
    const { data: profileData } = await supabase.from('profile').select('*').order('id').limit(1)

    const firstProfile = Array.isArray(profileData) && profileData.length > 0 ? profileData[0] : null
    setRow(firstProfile)
    setForm({
      full_name: firstProfile?.full_name || '',
      github_url: firstProfile?.github_url || '',
      linkedin_url: firstProfile?.linkedin_url || '',
      about_text: firstProfile?.about_text || '',
      photo_url: firstProfile?.photo_url || '',
    })

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setMsg('')
    const payload = {
      full_name: form.full_name || null,
      github_url: form.github_url || null,
      linkedin_url: form.linkedin_url || null,
      about_text: form.about_text || null,
      photo_url: form.photo_url || null,
    }
    try {
      if (row?.id) {
        const { error } = await supabase.from('profile').update(payload).eq('id', row.id)
        if (error) throw error
        setMsg('Updated')
      } else {
        const { error } = await supabase.from('profile').insert(payload)
        if (error) throw error
        setMsg('Inserted')
      }
      fetchData()
    } catch (error) {
      setMsg(`Save failed: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Profile</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/60 p-5 rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="md:col-span-2">
            <ImageUploader
              label="Photo"
              pathPrefix="profile"
              value={form.photo_url}
              onChange={(url) => setForm({ ...form, photo_url: url })}
            />
          </div>
          <textarea
            className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 md:col-span-2 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            rows={6}
            placeholder="About text (one paragraph per line)"
            value={form.about_text}
            onChange={(event) => setForm({ ...form, about_text: event.target.value })}
          />
          <div className="md:col-span-2 flex gap-2">
            <button
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-4 py-2 rounded"
              type="submit"
            >
              {saving ? 'Saving...' : row?.id ? 'Update' : 'Create'}
            </button>
            {msg && <div className="self-center text-sm opacity-80">{msg}</div>}
          </div>
        </form>
      )}
    </div>
  )
}
