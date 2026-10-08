const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
const KEY = 'market-tokens'

export const tokenStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY))
    } catch {
      return null
    }
  },
  set(tokens) {
    localStorage.setItem(KEY, JSON.stringify(tokens))
  },
  clear() {
    localStorage.removeItem(KEY)
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Turns a DRF / SimpleJWT error body into one readable sentence.
function errorMessage(data, status) {
  if (Array.isArray(data)) return data.join(' ')
  if (data && typeof data.detail === 'string') return data.detail
  if (data && typeof data === 'object') {
    const [field, msg] = Object.entries(data)[0] ?? []
    if (field) return `${field}: ${[].concat(msg).join(' ')}`
  }
  return `Request failed (${status})`
}

function send(path, { method = 'GET', body, token } = {}) {
  return fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function refreshAccess() {
  const tokens = tokenStore.get()
  if (!tokens?.refresh) return null
  const res = await send('/auth/refresh/', { method: 'POST', body: { refresh: tokens.refresh } })
  if (!res.ok) return null
  const data = await res.json()
  tokenStore.set({ ...tokens, ...data })
  return data.access
}

export async function api(path, { auth = true, ...options } = {}) {
  let res = await send(path, { ...options, token: auth ? tokenStore.get()?.access : null })

  if (res.status === 401 && auth) {
    const access = await refreshAccess()
    if (access) {
      res = await send(path, { ...options, token: access })
    } else {
      // Session is over. Browsing is public, so retry once as a guest.
      tokenStore.clear()
      window.dispatchEvent(new Event('auth:expired'))
      res = await send(path, { ...options, token: null })
    }
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(errorMessage(data, res.status), res.status)
  return data
}
