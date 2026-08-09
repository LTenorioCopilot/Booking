import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { CustomersListPage } from './pages/CustomersListPage'
import { CustomerFormPage } from './pages/CustomerFormPage'
import { Reservations } from './pages/Reservations'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/customers/nuevo" element={<CustomerFormPage />} />
        <Route path="/customers/:id/editar" element={<CustomerFormPage />} />
        <Route path="/reservas" element={<Reservations />} />
      </Route>
    </Routes>
  )
}

export default App
