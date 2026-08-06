import { Link } from 'react-router-dom'
import { useClientes, useEliminarCliente } from '../hooks/useClientes'

export function ClientesListPage() {
  const { data: clientes, isLoading, isError } = useClientes()
  const eliminarCliente = useEliminarCliente()

  const manejarEliminar = (id: number, nombreCompleto: string) => {
    if (confirm(`¿Eliminar al cliente ${nombreCompleto}?`)) {
      eliminarCliente.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Clientes</h1>
        <Link
          to="/clientes/nuevo"
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

      {clientes && clientes.length === 0 && (
        <p className="text-slate-500">Todavía no hay clientes registrados.</p>
      )}

      {clientes && clientes.length > 0 && (
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
              {clientes.map((cliente) => (
                <tr key={cliente.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3">
                    {cliente.nombres} {cliente.apellidos}
                  </td>
                  <td className="px-4 py-3">
                    {cliente.tipoDocumento} {cliente.numeroDocumento}
                  </td>
                  <td className="px-4 py-3">{cliente.email}</td>
                  <td className="px-4 py-3">{cliente.telefono}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/clientes/${cliente.id}/editar`}
                      className="mr-3 text-indigo-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => manejarEliminar(cliente.id, `${cliente.nombres} ${cliente.apellidos}`)}
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
