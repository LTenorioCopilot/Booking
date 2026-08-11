import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCustomers, useEliminarCustomer } from '../hooks/useCustomers'

const SIN_DATO = '—'

const FILTROS_INICIALES = {
  busqueda: '',
  documentType: '',
  nationality: '',
}

export function CustomersListPage() {
  const { data: customers, isLoading, isError } = useCustomers()
  const eliminarCustomer = useEliminarCustomer()

  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  const nationalities = useMemo(
    () =>
      Array.from(new Set((customers ?? []).map((c) => c.nationality).filter((n): n is string => Boolean(n)))).sort(),
    [customers],
  )

  const customersFiltrados = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return (customers ?? []).filter((c) => {
      const coincideBusqueda =
        !q ||
        c.nombres.toLowerCase().includes(q) ||
        c.apellidos.toLowerCase().includes(q) ||
        c.numeroDocumento.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.telefono.toLowerCase().includes(q)

      return (
        coincideBusqueda &&
        (!filtros.documentType || c.documentType === filtros.documentType) &&
        (!filtros.nationality || c.nationality === filtros.nationality)
      )
    })
  }, [customers, filtros])

  const actualizarFiltro = <K extends keyof typeof FILTROS_INICIALES>(
    campo: K,
    valor: (typeof FILTROS_INICIALES)[K],
  ) => setFiltros((previo) => ({ ...previo, [campo]: valor }))

  const manejarEliminar = (id: number, nombreCompleto: string) => {
    if (confirm(`¿Eliminar al cliente ${nombreCompleto}?`)) {
      eliminarCustomer.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Clientes</h1>
        <Link
          to="/customers/nuevo"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          + Nuevo cliente
        </Link>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block lg:col-span-1">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Buscar
            </span>
            <input
              type="text"
              placeholder="Nombre, documento, teléfono o correo"
              value={filtros.busqueda}
              onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tipo de documento
            </span>
            <select
              value={filtros.documentType}
              onChange={(e) => actualizarFiltro('documentType', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              <option value="DNI">DNI</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="CE">Carné de extranjería</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Nacionalidad
            </span>
            <select
              value={filtros.nationality}
              onChange={(e) => actualizarFiltro('nationality', e.target.value)}
              className={inputClass}
            >
              <option value="">Todas</option>
              {nationalities.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {customersFiltrados.length} de {customers?.length ?? 0} clientes
          </p>
          <button
            type="button"
            onClick={() => setFiltros(FILTROS_INICIALES)}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Limpiar filtros
          </button>
        </div>
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

      {customers && customers.length > 0 && customersFiltrados.length === 0 && (
        <p className="text-slate-500">Ningún cliente coincide con los filtros aplicados.</p>
      )}

      {customersFiltrados.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Nombre completo</th>
                <th className="px-4 py-3 whitespace-nowrap">Fecha nacimiento</th>
                <th className="px-4 py-3 whitespace-nowrap">Nacionalidad</th>
                <th className="px-4 py-3 whitespace-nowrap">Documento</th>
                <th className="px-4 py-3 whitespace-nowrap">Dirección</th>
                <th className="px-4 py-3 whitespace-nowrap">Email</th>
                <th className="px-4 py-3 whitespace-nowrap">Teléfono</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {customersFiltrados.map((customer) => (
                <tr key={customer.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {customer.nombres} {customer.apellidos}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{customer.fechaNacimiento}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{customer.nationality ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {customer.documentType} {customer.numeroDocumento}
                  </td>
                  <td className="max-w-[16rem] truncate px-4 py-3" title={customer.direccion}>
                    {customer.direccion}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{customer.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{customer.telefono}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
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

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white'
