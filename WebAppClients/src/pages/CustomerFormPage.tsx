import { useNavigate, useParams } from 'react-router-dom'
import { CustomerForm } from '../components/CustomerForm'
import { useActualizarCustomer, useCustomer, useCrearCustomer } from '../hooks/useCustomers'
import type { CustomerInput } from '../types/customer'

export function CustomerFormPage() {
  const { id } = useParams<{ id: string }>()
  const customerId = id ? Number(id) : undefined
  const esEdicion = customerId !== undefined

  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomer(customerId)
  const crearCustomer = useCrearCustomer()
  const actualizarCustomer = useActualizarCustomer()

  const enviando = crearCustomer.isPending || actualizarCustomer.isPending

  const manejarSubmit = (valores: CustomerInput) => {
    if (esEdicion && customerId !== undefined) {
      actualizarCustomer.mutate(
        { id: customerId, customer: valores },
        { onSuccess: () => navigate('/customers') },
      )
    } else {
      crearCustomer.mutate(valores, { onSuccess: () => navigate('/customers') })
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
          onClick={() => navigate('/customers')}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Regresar
        </button>
      </div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900 dark:text-white">
        {esEdicion ? 'Editar cliente' : 'Nuevo cliente'}
      </h1>
      <CustomerForm customerInicial={customer} onSubmit={manejarSubmit} enviando={enviando} />
    </div>
  )
}
