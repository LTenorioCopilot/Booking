import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientesListPage } from './pages/ClientesListPage'
import { ClienteFormPage } from './pages/ClienteFormPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/clientes" replace />} />
      <Route path="/clientes" element={<ClientesListPage />} />
      <Route path="/clientes/nuevo" element={<ClienteFormPage />} />
      <Route path="/clientes/:id/editar" element={<ClienteFormPage />} />
    </Routes>
  )
}

export default App
