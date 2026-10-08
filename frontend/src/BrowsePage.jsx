import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert, Box, Button, CircularProgress, MenuItem, Pagination, Paper, Stack, TextField, Typography,
} from '@mui/material'
import ListingCard from './ListingCard'
import { PAGE_SIZE } from './format'
import { useApi } from './useApi'

export default function BrowsePage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const min = params.get('min') ?? ''
  const max = params.get('max') ?? ''
  const ordering = params.get('ordering') ?? '-created_at'
  const page = Number(params.get('page') ?? 1)

  const [draft, setDraft] = useState({ q, min, max })

  const update = (changes) => {
    const next = new URLSearchParams(params)
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)))
    if (!('page' in changes)) next.delete('page')
    setParams(next)
  }

  const query = new URLSearchParams({ ordering, page })
  if (q) query.set('search', q)
  if (category) query.set('category', category)
  if (min) query.set('min_price', min)
  if (max) query.set('max_price', max)

  const listings = useApi(`/listings/?${query}`)
  const categories = useApi('/categories/')

  const onSearch = (e) => {
    e.preventDefault()
    update({ q: draft.q.trim(), min: draft.min, max: draft.max })
  }
  const setDraftField = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  const results = listings.data?.results ?? []
  const pageCount = Math.ceil((listings.data?.count ?? 0) / PAGE_SIZE)

  return (
    <>
      <Typography variant="h4" component="h1" mb={3}>Browse listings</Typography>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box component="form" onSubmit={onSearch}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="Search" size="small" value={draft.q} onChange={setDraftField('q')} sx={{ flex: 2 }} />
            <TextField select label="Category" size="small" value={category} onChange={(e) => update({ category: e.target.value })} sx={{ flex: 1, minWidth: 150 }}>
              <MenuItem value="">All categories</MenuItem>
              {(categories.data ?? []).map((c) => <MenuItem key={c.id} value={c.slug}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="Min price" type="number" size="small" value={draft.min} onChange={setDraftField('min')} sx={{ width: { md: 110 } }} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField label="Max price" type="number" size="small" value={draft.max} onChange={setDraftField('max')} sx={{ width: { md: 110 } }} slotProps={{ htmlInput: { min: 0 } }} />
            <TextField select label="Sort" size="small" value={ordering} onChange={(e) => update({ ordering: e.target.value === '-created_at' ? '' : e.target.value })} sx={{ minWidth: 160 }}>
              <MenuItem value="-created_at">Newest first</MenuItem>
              <MenuItem value="price">Price: low to high</MenuItem>
              <MenuItem value="-price">Price: high to low</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" disableElevation>Search</Button>
          </Stack>
        </Box>
      </Paper>

      {listings.error && <Alert severity="error">{listings.error}</Alert>}
      {listings.loading && <Box textAlign="center" py={6}><CircularProgress /></Box>}

      {!listings.loading && !listings.error && results.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No listings match. Try a different search or clear the filters.
        </Typography>
      )}

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {results.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </Box>

      {pageCount > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={pageCount} page={page} onChange={(_, value) => update({ page: value > 1 ? String(value) : '' })} />
        </Box>
      )}
    </>
  )
}
