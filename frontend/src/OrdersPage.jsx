import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Alert, Box, CircularProgress, Pagination, Paper, Stack, Typography } from '@mui/material'
import { PAGE_SIZE, money } from './format'
import { useApi } from './useApi'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const { data, error, loading } = useApi(`/orders/?page=${page}`)

  const results = data?.results ?? []
  const pageCount = Math.ceil((data?.count ?? 0) / PAGE_SIZE)

  return (
    <>
      <Typography variant="h4" component="h1" mb={3}>Your orders</Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {loading && <Box textAlign="center" py={6}><CircularProgress /></Box>}
      {!loading && !error && results.length === 0 && (
        <Typography color="text.secondary">
          You haven't bought anything yet. <RouterLink to="/">Browse listings</RouterLink>
        </Typography>
      )}

      <Stack spacing={1}>
        {results.map((order) => (
          <Paper key={order.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            {order.image_url && (
              <Box component="img" src={order.image_url} alt="" sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>{order.listing_title}</Typography>
              <Typography variant="body2" color="text.secondary">
                From {order.seller} · {new Date(order.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Typography fontWeight={600}>{money(order.price)}</Typography>
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
