import { useCallback, useEffect, useRef, useState } from 'react'
import { api, clearToken } from './client'

export function useQuery(path, options = {}) {
  const { enabled = true } = options
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!enabled) return
    let canceled = false
    setLoading(true)
    setError(null)
    api.get(path)
      .then(d => { if (!canceled) setData(d) })
      .catch(e => { if (!canceled) setError(e) })
      .finally(() => { if (!canceled) setLoading(false) })
    return () => { canceled = true }
  }, [path, enabled])

  return { data, loading, error }
}

export function parseList(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  try { const p = JSON.parse(value); if (Array.isArray(p)) return p } catch (_) {}
  if (typeof value === 'string') return value.split('\n').map(s => s.trim()).filter(Boolean)
  return []
}

export function useAutoLogout({ timeoutMs = 30 * 60 * 1000, redirectTo, isEnabled = true } = {}) {
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const handleLogout = useCallback(async () => {
    clearToken()
    if (redirectTo) window.location.href = redirectTo
  }, [redirectTo])

  const resetTimer = useCallback(() => {
    if (!isEnabled) return
    clearTimer()
    timerRef.current = window.setTimeout(handleLogout, timeoutMs)
  }, [clearTimer, handleLogout, isEnabled, timeoutMs])

  useEffect(() => {
    if (!isEnabled) { clearTimer(); return }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    resetTimer()
    return () => { events.forEach(e => window.removeEventListener(e, resetTimer)); clearTimer() }
  }, [clearTimer, resetTimer, isEnabled])

  return { resetTimer }
}