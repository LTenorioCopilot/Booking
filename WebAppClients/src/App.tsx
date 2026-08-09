import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { CustomersListPage } from './pages/CustomersListPage'
import { CustomerFormPage } from './pages/CustomerFormPage'
import { RoomsListPage } from './pages/RoomsListPage'
import { RoomFormPage } from './pages/RoomFormPage'
import { Reservations } from './pages/Reservations'
import { UnassignedReservationsPage } from './pages/UnassignedReservationsPage'
import { UnassignedReservationFormPage } from './pages/UnassignedReservationFormPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/customers/nuevo" element={<CustomerFormPage />} />
        <Route path="/customers/:id/editar" element={<CustomerFormPage />} />
        <Route path="/rooms" element={<RoomsListPage />} />
        <Route path="/rooms/nuevo" element={<RoomFormPage />} />
        <Route path="/rooms/:id/editar" element={<RoomFormPage />} />
        <Route path="/reservas" element={<Reservations />} />
        <Route path="/reservas-sin-asignar" element={<UnassignedReservationsPage />} />
        <Route path="/reservas-sin-asignar/nueva" element={<UnassignedReservationFormPage />} />
        <Route path="/reservas-sin-asignar/:id/editar" element={<UnassignedReservationFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
