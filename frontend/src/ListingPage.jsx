import { useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { api } from './api'
import { CONDITIONS, money } from './format'
import { useApi } from './useApi'
import { useAuth } from './useAuth'

export default function ListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { authed } = useAuth()
  const { data: listing, error, loading } = useApi(`/listings/${id}/`)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  async function act(action) {
    setBusy(true)
    setActionError('')
    try {
      await action()
    } catch (e) {
      setActionError(e.message)
      setBusy(false)
    }
  }

  const buy = () =>
    act(async () => {
      await api(`/listings/${id}/buy/`, { method: 'POST' })
      navigate('/orders')
    })

  const remove = () => {
    if (!window.confirm('Delete this listing?')) return
    act(async () => {
      await api(`/listings/${id}/`, { method: 'DELETE' })
      navigate('/my-listings')
    })
  }

  if (loading) return <Box textAlign="center" py={6}><CircularProgress /></Box>
  if (error) return <Alert severity="error">{error}</Alert>
  if (!listing) return null

  const sold = listing.status === 'SOLD'

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
      <Box sx={{ flex: 3 }}>
        {listing.image_url ? (
          <Box component="img" src={listing.image_url} alt={listing.title} sx={{ width: '100%', borderRadius: 2, maxHeight: 520, objectFit: 'cover' }} />
        ) : (
          <Box sx={{ aspectRatio: '4 / 3', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', borderRadius: 2, color: 'text.secondary' }}>
            No photo
          </Box>
        )}
      </Box>

      <Paper variant="outlined" sx={{ flex: 2, p: 3, alignSelf: 'flex-start' }}>
        <Typography variant="h4" component="h1">{listing.title}</Typography>
        <Typography variant="h5" color="primary" mt={1}>{money(listing.price)}</Typography>

        <Stack direction="row" spacing={1} my={2}>
          <Chip size="small" label={CONDITIONS[listing.condition]} variant="outlined" />
          {listing.category_name && <Chip size="small" label={listing.category_name} variant="outlined" />}
          {sold && <Chip size="small" label="Sold" color="error" />}
        </Stack>

        {listing.description && <Typography sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>{listing.description}</Typography>}
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sold by {listing.seller} · listed {new Date(listing.created_at).toLocaleDateString()}
        </Typography>

        {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}

        {listing.is_mine ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" component={RouterLink} to={`/listings/${id}/edit`} disabled={sold}>Edit</Button>
            <Button color="error" onClick={remove} disabled={busy || sold}>Delete</Button>
          </Stack>
        ) : sold ? (
          <Alert severity="info">This item has been sold.</Alert>
        ) : authed ? (
          <Button variant="contained" size="large" fullWidth disableElevation onClick={buy} disabled={busy}>
            Buy now for {money(listing.price)}
          </Button>
        ) : (
          <Button variant="contained" size="large" fullWidth disableElevation component={RouterLink} to="/login" state={{ from: `/listings/${id}` }}>
            Log in to buy
          </Button>
        )}
      </Paper>
    </Stack>
  )
}
