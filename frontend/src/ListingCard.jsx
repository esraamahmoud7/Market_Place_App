import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { CONDITIONS, money } from './format'

export default function ListingCard({ listing }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={`/listings/${listing.id}`}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {listing.image_url ? (
          <CardMedia
            component="img"
            image={listing.image_url}
            alt={listing.title}
            loading="lazy"
            sx={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ aspectRatio: '4 / 3', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', color: 'text.secondary' }}>
            No photo
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2">{money(listing.price)}</Typography>
          <Typography noWrap>{listing.title}</Typography>
          <Stack direction="row" spacing={1} mt={1}>
            <Chip size="small" variant="outlined" label={CONDITIONS[listing.condition]} />
            {listing.category_name && <Chip size="small" variant="outlined" label={listing.category_name} />}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
