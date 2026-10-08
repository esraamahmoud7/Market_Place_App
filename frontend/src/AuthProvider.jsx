import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { api, tokenStore } from './api'

export default function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => Boolean(tokenStore.get()?.access))

  // api.js fires this when the refresh token is rejected.
  useEffect(() => {
    const onExpired = () => setAuthed(false)
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  async function login(username, password) {
    const tokens = await api('/auth/login/', {
      method: 'POST',
      body: { username, password },
      auth: false,
    })
    tokenStore.set(tokens)
    setAuthed(true)
  }

  async function register(username, email, password) {
    await api('/auth/register/', {
      method: 'POST',
      body: { username, email, password },
      auth: false,
    })
    await login(username, password)
  }

  function logout() {
    tokenStore.clear()
    setAuthed(false)
  }

  return (
    <AuthContext.Provider value={{ authed, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
