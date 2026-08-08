import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { ClientesListPage } from './pages/ClientesListPage'
import { ClienteFormPage } from './pages/ClienteFormPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/clientes" element={<ClientesListPage />} />
        <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
