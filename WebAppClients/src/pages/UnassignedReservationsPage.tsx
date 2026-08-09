import { Link } from 'react-router-dom'
import { useBookings, useEliminarBooking } from '../hooks/useBookings'

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  CheckedIn: 'Check-in',
}

export function UnassignedReservationsPage() {
  const { data: bookings, isLoading, isError } = useBookings()
  const eliminarBooking = useEliminarBooking()

  const sinAsignar = bookings?.filter((b) => b.roomId === null) ?? []

  const manejarEliminar = (id: number, guestName: string) => {
    if (confirm(`¿Cancelar la reserva de ${guestName}?`)) {
      eliminarBooking.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reservas sin asignar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Reservas creadas sin una habitación específica todavía.
          </p>
        </div>
        <Link
          to="/reservas-sin-asignar/nueva"
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          + Nueva reserva
        </Link>
      </div>

      {isLoading && <p className="text-slate-500">Cargando reservas...</p>}
      {isError && <p className="text-red-600">No se pudo conectar con el API.</p>}

      {bookings && sinAsignar.length === 0 && (
        <p className="text-slate-500">No hay reservas pendientes de asignar habitación.</p>
      )}

      {sinAsignar.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Huésped</th>
                <th className="px-4 py-3">Tipo de habitación</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Check-out</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sinAsignar.map((booking) => (
                <tr key={booking.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3">{booking.guestName}</td>
                  <td className="px-4 py-3">{booking.roomType ?? 'Sin preferencia'}</td>
                  <td className="px-4 py-3">{booking.checkInDate}</td>
                  <td className="px-4 py-3">{booking.checkOutDate}</td>
                  <td className="px-4 py-3">{STATUS_LABELS[booking.status]}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/reservas-sin-asignar/${booking.id}/editar`}
                      className="mr-3 text-indigo-600 hover:underline"
                    >
                      Asignar / Editar
                    </Link>
                    <button
                      onClick={() => manejarEliminar(booking.id, booking.guestName)}
                      className="text-red-600 hover:underline"
                    >
                      Cancelar
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
