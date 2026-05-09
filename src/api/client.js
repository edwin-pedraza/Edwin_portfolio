const API_URL = import.meta.env.VITE_API_URL || '/api'

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('portfolio_token')
  const res = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw data
  return data
}

export const api = {
  get:    (path)        => apiFetch(path),
  post:   (path, body)  => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)  => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)        => apiFetch(path, { method: 'DELETE' }),
}

export function getToken()        { return localStorage.getItem('portfolio_token') }
export function setToken(token)   { localStorage.setItem('portfolio_token', token) }
export function clearToken()      { localStorage.removeItem('portfolio_token') }
export function isAuthenticated() { return !!getToken() }