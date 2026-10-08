import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'
import { api } from './api'
import { useApi } from './useApi'

const EMPTY = { title: '', description: '', price: '', condition: 'USED', category: '', image_url: '' }

function ListingForm({ initial, submitLabel, onSubmit }) {
  const categories = useApi('/categories/')
  const [form, setForm] = useState(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit({ ...form, category: form.category || null })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 640 }}>
      <Box component="form" onSubmit={submit}>
        <Stack spacing={2}>
          <TextField label="Title" value={form.title} onChange={set('title')} required slotProps={{ htmlInput: { maxLength: 200 } }} />
          <TextField label="Description" value={form.description} onChange={set('description')} multiline minRows={3} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Price" type="number" value={form.price} onChange={set('price')} required fullWidth slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }} />
            <TextField select label="Condition" value={form.condition} onChange={set('condition')} fullWidth>
              <MenuItem value="NEW">New</MenuItem>
              <MenuItem value="USED">Used</MenuItem>
            </TextField>
          </Stack>
          <TextField select label="Category" value={form.category} onChange={set('category')}>
            <MenuItem value="">No category</MenuItem>
            {(categories.data ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
          <TextField label="Photo URL" type="url" value={form.image_url} onChange={set('image_url')} helperText="Optional. Paste a link to an image." />
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="submit" variant="contained" disableElevation disabled={busy}>{submitLabel}</Button>
        </Stack>
      </Box>
    </Paper>
  )
}

export default function ListingFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useApi(id ? `/listings/${id}/` : null)

  async function save(body) {
    const saved = await api(id ? `/listings/${id}/` : '/listings/', {
      method: id ? 'PATCH' : 'POST',
      body,
    })
    navigate(`/listings/${saved.id}`)
  }

  let content
  if (id && existing.loading) {
    content = <CircularProgress />
  } else if (id && existing.error) {
    content = <Alert severity="error">{existing.error}</Alert>
  } else if (id && !existing.data?.is_mine) {
    content = <Alert severity="warning">You can only edit your own listings.</Alert>
  } else {
    const l = existing.data
    const initial = l
      ? { title: l.title, description: l.description, price: l.price, condition: l.condition, category: l.category ?? '', image_url: l.image_url }
      : EMPTY
    content = <ListingForm initial={initial} submitLabel={id ? 'Save changes' : 'Publish listing'} onSubmit={save} />
  }

  return (
    <>
      <Typography variant="h4" component="h1" mb={3}>{id ? 'Edit listing' : 'Sell an item'}</Typography>
      {content}
    </>
  )
}
