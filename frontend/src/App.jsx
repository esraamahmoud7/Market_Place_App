import { Route, Routes } from 'react-router-dom'
import { Typography } from '@mui/material'
import AuthPage from './AuthPage'
import BrowsePage from './BrowsePage'
import Layout from './Layout'
import ListingFormPage from './ListingFormPage'
import ListingPage from './ListingPage'
import MyListingsPage from './MyListingsPage'
import OrdersPage from './OrdersPage'
import RequireAuth from './RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<BrowsePage />} />
        <Route path="listings/:id" element={<ListingPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route element={<RequireAuth />}>
          <Route path="sell" element={<ListingFormPage />} />
          <Route path="listings/:id/edit" element={<ListingFormPage />} />
          <Route path="my-listings" element={<MyListingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
        <Route path="*" element={<Typography>Page not found.</Typography>} />
      </Route>
    </Routes>
  )
}
