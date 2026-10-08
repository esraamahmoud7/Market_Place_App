import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Button, Chip, CircularProgress, Pagination, Paper, Stack, Typography } from '@mui/material'
import { api } from './api'
import { PAGE_SIZE, money } from './format'
import { useApi } from './useApi'

export default function MyListingsPage() {
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useApi(`/listings/?mine=true&page=${page}`)
  const [actionError, setActionError] = useState('')

  async function remove(listing) {
    if (!window.confirm(`Delete "${listing.title}"?`)) return
    setActionError('')
    try {
      await api(`/listings/${listing.id}/`, { method: 'DELETE' })
      reload()
    } catch (e) {
      setActionError(e.message)
    }
  }

  const results = data?.results ?? []
  const pageCount = Math.ceil((data?.count ?? 0) / PAGE_SIZE)

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">My listings</Typography>
        <Button variant="contained" disableElevation component={RouterLink} to="/sell">Sell an item</Button>
      </Stack>

      {(error || actionError) && <Alert severity="error" sx={{ mb: 2 }}>{error || actionError}</Alert>}
      {loading && <Box textAlign="center" py={6}><CircularProgress /></Box>}
      {!loading && !error && results.length === 0 && (
        <Typography color="text.secondary">You haven't listed anything yet.</Typography>
      )}

      <Stack spacing={1}>
        {results.map((listing) => (
          <Paper key={listing.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography component={RouterLink} to={`/listings/${listing.id}`} sx={{ color: 'inherit', fontWeight: 600 }}>
                {listing.title}
              </Typography>
              <Typography color="text.secondary">{money(listing.price)}</Typography>
            </Box>
            <Chip size="small" label={listing.status === 'SOLD' ? 'Sold' : 'Active'} color={listing.status === 'SOLD' ? 'default' : 'success'} />
            <Button size="small" component={RouterLink} to={`/listings/${listing.id}/edit`} disabled={listing.status === 'SOLD'}>Edit</Button>
            <Button size="small" color="error" onClick={() => remove(listing)} disabled={listing.status === 'SOLD'}>Delete</Button>
          </Paper>
        ))}
      </Stack>

      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} />
        </Box>
      )}
    </>
  )
}
