import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

function NavButton({ to, children }) {
  return (
    <Button color="inherit" component={RouterLink} to={to}>
      {children}
    </Button>
  )
}

export default function Layout() {
  const { authed, logout } = useAuth()

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 800, mr: 2 }}
          >
            Marketplace
          </Typography>
          <NavButton to="/">Browse</NavButton>
          {authed && <NavButton to="/my-listings">My listings</NavButton>}
          {authed && <NavButton to="/orders">Orders</NavButton>}
          <Box sx={{ flexGrow: 1 }} />
          {authed ? (
            <>
              <NavButton to="/sell">Sell an item</NavButton>
              <Button color="inherit" onClick={logout}>Log out</Button>
            </>
          ) : (
            <NavButton to="/login">Log in</NavButton>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </>
  )
}
