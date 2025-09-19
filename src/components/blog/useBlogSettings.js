import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/client'
import { parseSettingsPayload, DEFAULT_THEME_COLORS, DEFAULT_BLOG_SETTINGS } from '../admin/themeUtils'

export default function useBlogSettings() {
  const [state, setState] = useState({ theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS, loading: true })

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from('settings')
        .select('theme_color')
        .limit(1)
        .maybeSingle()

      if (cancelled) return

      if (error) {
        console.warn('Could not load settings', error)
        setState({ theme: DEFAULT_THEME_COLORS, blog: DEFAULT_BLOG_SETTINGS, loading: false })
        return
      }

      const parsed = parseSettingsPayload(data?.theme_color)
      setState({ theme: parsed.theme, blog: parsed.blog, loading: false })
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return state
}