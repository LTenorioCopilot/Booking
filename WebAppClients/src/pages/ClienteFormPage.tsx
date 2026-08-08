import { useNavigate, useParams } from 'react-router-dom'
import { ClienteForm } from '../components/ClienteForm'
import { useActualizarCliente, useCliente, useCrearCliente } from '../hooks/useClientes'
import type { ClienteInput } from '../types/cliente'

export function ClienteFormPage() {
  const { id } = useParams<{ id: string }>()
  const clienteId = id ? Number(id) : undefined
  const esEdicion = clienteId !== undefined

  const navigate = useNavigate()
  const { data: cliente, isLoading } = useCliente(clienteId)
  const crearCliente = useCrearCliente()
  const actualizarCliente = useActualizarCliente()

  const enviando = crearCliente.isPending || actualizarCliente.isPending

  const manejarSubmit = (valores: ClienteInput) => {
    if (esEdicion && clienteId !== undefined) {
      actualizarCliente.mutate(
        { id: clienteId, cliente: valores },
        { onSuccess: () => navigate('/clientes') },
      )
    } else {
      crearCliente.mutate(valores, { onSuccess: () => navigate('/clientes') })
    }
  }

  if (esEdicion && isLoading) {
    return <p className="p-6 text-slate-500">Cargando cliente...</p>
  }

  return (
    <div className="p-6">
      <div className="mx-auto mb-6 flex max-w-2xl items-center">
        <button
          type="button"
          onClick={() => navigate('/clientes')}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Regresar
        </button>
      </div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900 dark:text-white">
        {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
      </h1>
      <ClienteForm clienteInicial={cliente} onSubmit={manejarSubmit} enviando={enviando} />
    </div>
  )
}
