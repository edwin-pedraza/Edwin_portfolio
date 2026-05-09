import { api, getToken, clearToken } from './client'

const API_URL = import.meta.env.VITE_API_URL || '/api'

function fromBuilder(table) {
  let _method = 'GET'
  let _payload = null
  let _eqCol = null; let _eqVal = null
  let _neqCol = null; let _neqVal = null
  let _ltCol = null; let _ltVal = null
  let _gtCol = null; let _gtVal = null
  let _orderCol = null; let _orderAsc = true
  let _limitN = null
  let _single = false; let _maybeSingle = false
  let _count = null; let _head = false
  let _returnData = false

  async function exec() {
    try {
      if (_method === 'POST') {
        const data = await api.post(`/${table}`, _payload)
        return { data, error: null }
      }
      if (_method === 'PUT' && _eqCol === 'id') {
        await api.put(`/${table}/${_eqVal}`, _payload)
        return { data: null, error: null }
      }
      if (_method === 'DELETE' && _eqCol === 'id') {
        await api.delete(`/${table}/${_eqVal}`)
        return { data: null, error: null }
      }

      // GET — fetch all then filter client-side
      if (_eqCol === 'id' && (_single || _maybeSingle)) {
        const data = await api.get(`/${table}/${_eqVal}`)
        return { data, error: null }
      }

      let rows = await api.get(`/${table}`)
      if (!Array.isArray(rows)) rows = []
      if (_eqCol)  rows = rows.filter(r => String(r[_eqCol])  === String(_eqVal))
      if (_neqCol) rows = rows.filter(r => String(r[_neqCol]) !== String(_neqVal))
      if (_ltCol)  rows = rows.filter(r => r[_ltCol] < _ltVal)
      if (_gtCol)  rows = rows.filter(r => r[_gtCol] > _gtVal)
      if (_orderCol) rows.sort((a, b) => {
        const [av, bv] = [a[_orderCol], b[_orderCol]]
        if (av < bv) return _orderAsc ? -1 : 1
        if (av > bv) return _orderAsc ? 1 : -1
        return 0
      })
      if (_limitN) rows = rows.slice(0, _limitN)
      if (_count)  return { count: rows.length, data: null, error: null }
      if (_single || _maybeSingle) return { data: rows[0] || null, error: null }
      return { data: rows, error: null }
    } catch (err) {
      return { data: null, error: { message: err?.error || err?.message || 'Request failed' } }
    }
  }

  const obj = {
    select(cols, opts = {}) {
      if (opts.count) _count = opts.count
      if (opts.head) _head = opts.head
      return obj
    },
    order(col, opts = {}) { _orderCol = col; _orderAsc = opts.ascending !== false; return obj },
    limit(n)               { _limitN = n; return obj },
    eq(col, val)           { _eqCol  = col; _eqVal  = val; return obj },
    neq(col, val)          { _neqCol = col; _neqVal = val; return obj },
    lt(col, val)           { _ltCol  = col; _ltVal  = val; return obj },
    gt(col, val)           { _gtCol  = col; _gtVal  = val; return obj },
    update(payload)        { _method = 'PUT';    _payload = payload; return obj },
    insert(payload)        { _method = 'POST';   _payload = Array.isArray(payload) ? payload[0] : payload; return obj },
    upsert(payload)        { _method = 'POST';   _payload = Array.isArray(payload) ? payload[0] : payload; return obj },
    delete()               { _method = 'DELETE'; return obj },
    single()               { _single = true; return exec() },
    maybeSingle()          { _maybeSingle = true; return exec() },
    then(resolve, reject)  { return exec().then(resolve, reject) },
  }
  return obj
}

function storageBuilder(bucket) {
  return {
    upload(filePath, file, opts = {}) {
      const form = new FormData()
      form.append('file', file)
      const parts = filePath.split('/')
      const folder = parts.slice(0, -1).join('/') || 'misc'
      return fetch(`${API_URL}/upload/${bucket}/${folder}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + getToken() },
        body: form,
      }).then(r => r.json()).then(d => ({
        data: d,
        error: d.error ? { message: d.error } : null,
      }))
    },
    getPublicUrl(filePath) {
      return { data: { publicUrl: `${API_URL.replace('/api', '')}/uploads/${bucket}/${filePath}` } }
    },
    remove(paths) {
      return Promise.all(paths.map(p =>
        api.delete(`/upload/${bucket}/${p}`).catch(() => null)
      )).then(() => ({ error: null }))
    },
  }
}

export const supabase = {
  from: (table) => fromBuilder(table),
  storage: { from: (bucket) => storageBuilder(bucket) },
  auth: {
    getSession: () => {
      const token = getToken()
      if (!token) return Promise.resolve({ data: { session: null } })
      return api.get('/auth/me').then(({ user }) => ({
        data: { session: user ? { user } : null }
      })).catch(() => ({ data: { session: null } }))
    },
    onAuthStateChange: (cb) => {
      const token = getToken()
      if (token) {
        api.get('/auth/me').then(({ user }) => {
          if (user) cb('SIGNED_IN', { user })
        }).catch(() => {})
      }
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signOut: () => { clearToken(); return Promise.resolve({ error: null }) },
    signInWithOtp: () => Promise.resolve({ error: { message: 'Use the Admin panel to sign in' } }),
  },
}
