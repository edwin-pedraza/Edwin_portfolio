import { useEffect, useState } from 'react'
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
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed
  } catch (_) {}
  if (typeof value === 'string') return value.split('\n').map((s) => s.trim()).filter(Boolean)
  return []
}

