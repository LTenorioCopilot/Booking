import { Link } from 'react-router-dom'
import { useCustomers, useEliminarCustomer } from '../hooks/useCustomers'

export function CustomersListPage() {
  const { data: customers, isLoading, isError } = useCustomers()
  const eliminarCustomer = useEliminarCustomer()

  const manejarEliminar = (id: number, nombreCompleto: string) => {
    if (confirm(`¿Eliminar al cliente ${nombreCompleto}?`)) {
      eliminarCustomer.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Clientes</h1>
        <Link
          to="/customers/nuevo"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      {isLoading && <p className="text-slate-500">Cargando clientes...</p>}
      {isError && (
        <p className="text-red-600">
          No se pudo conectar con el API. ¿Está corriendo el mock (npm run mock-api)?
        </p>
      )}

      {customers && customers.length === 0 && (
        <p className="text-slate-500">Todavía no hay clientes registrados.</p>
      )}

      {customers && customers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre completo</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {customers.map((customer) => (
                <tr key={customer.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3">
                    {customer.nombres} {customer.apellidos}
                  </td>
                  <td className="px-4 py-3">
                    {customer.documentType} {customer.numeroDocumento}
                  </td>
                  <td className="px-4 py-3">{customer.email}</td>
                  <td className="px-4 py-3">{customer.telefono}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/customers/${customer.id}/editar`}
                      className="mr-3 text-indigo-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => manejarEliminar(customer.id, `${customer.nombres} ${customer.apellidos}`)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
