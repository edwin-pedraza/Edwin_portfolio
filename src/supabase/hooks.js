import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './client'

export function useSupabaseQuery(table, { select = '*', orderBy, ascending = true } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let canceled = false
    async function run() {
      try {
        setLoading(true)
        setError(null)
        let query = supabase.from(table).select(select)
        if (orderBy) query = query.order(orderBy, { ascending })
        const { data, error } = await query
        if (error) throw error
        if (!canceled) setData(data)
      } catch (err) {
        if (!canceled) setError(err)
      } finally {
        if (!canceled) setLoading(false)
      }
    }
    run()
    return () => { canceled = true }
  }, [table, select, orderBy, ascending])

  return { data, loading, error }
}

export function parseList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  let parsed = null
  try {
    parsed = JSON.parse(value)
  } catch (_) {
    parsed = null
  }
  if (Array.isArray(parsed)) return parsed
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean)
  return []
}

// Signs the user out after a period of inactivity to keep the admin session short-lived.
export function useAutoLogout({ timeoutMs = 30 * 60 * 1000, redirectTo, isEnabled = true } = {}) {
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    if (redirectTo) {
      window.location.href = redirectTo
    }
  }, [redirectTo])

  const resetTimer = useCallback(() => {
    if (!isEnabled) return
    clearTimer()
    timerRef.current = window.setTimeout(handleLogout, timeoutMs)
  }, [clearTimer, handleLogout, isEnabled, timeoutMs])

  useEffect(() => {
    if (!isEnabled) {
      clearTimer()
      return undefined
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach((event) => window.addEventListener(event, resetTimer))

    resetTimer()

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer))
      clearTimer()
    }
  }, [clearTimer, resetTimer, isEnabled])

  return { resetTimer }
}
