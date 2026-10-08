import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Alert, Box, Button, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useAuth } from './useAuth'

export default function AuthPage() {
  const { authed, login, register } = useAuth()
  const from = useLocation().state?.from ?? '/'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (authed) return <Navigate to={from} replace />

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(form.username, form.password)
      else await register(form.username, form.email, form.password)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" component="h1" mb={3}>
        {mode === 'login' ? 'Log in' : 'Create your account'}
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Tabs value={mode} onChange={(_, v) => { setMode(v); setError('') }} sx={{ mb: 2 }}>
          <Tab value="login" label="Log in" />
          <Tab value="register" label="Create account" />
        </Tabs>
        <Box component="form" onSubmit={submit}>
          <Stack spacing={2}>
            <TextField label="Username" value={form.username} onChange={set('username')} required autoFocus />
            {mode === 'register' && (
              <TextField label="Email" type="email" value={form.email} onChange={set('email')} required />
            )}
            <TextField label="Password" type="password" value={form.password} onChange={set('password')} required />
            {error && <Alert severity="error">{error}</Alert>}
            <Button type="submit" variant="contained" disableElevation disabled={busy}>
              {mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  )
}
