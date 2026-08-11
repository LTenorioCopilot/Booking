import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBookings, useEliminarBooking } from '../hooks/useBookings'
import { useRooms } from '../hooks/useRooms'
import { useSequences } from '../hooks/useSequences'
import { RESERVATION_SOURCE_LABELS } from '../constants/reservationSource'
import type { Booking } from '../types/booking'

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  CheckedIn: 'Check-in',
}

const SIN_DATO = '—'

function formatearDocumento(booking: Booking) {
  if (!booking.idDocumentType && !booking.idDocumentNumber) return SIN_DATO
  return [booking.idDocumentType, booking.idDocumentNumber].filter(Boolean).join(' ')
}

function formatearHuespedes(booking: Booking) {
  return `${booking.adultsCount} adulto${booking.adultsCount === 1 ? '' : 's'}${
    booking.minorsCount > 0
      ? ` / ${booking.minorsCount} menor${booking.minorsCount === 1 ? '' : 'es'}`
      : ''
  }`
}

const FILTROS_INICIALES = {
  busqueda: '',
  origen: '',
  estado: '',
  tipoHabitacion: '',
  checkInDesde: '',
  checkInHasta: '',
}

export function UnassignedReservationsPage() {
  const { data: bookings, isLoading, isError } = useBookings()
  const { data: rooms } = useRooms()
  const { data: sequences } = useSequences()
  const eliminarBooking = useEliminarBooking()

  const [filtros, setFiltros] = useState(FILTROS_INICIALES)

  const roomTypes = useMemo(
    () => Array.from(new Set((rooms ?? []).map((room) => room.type))).sort(),
    [rooms],
  )

  const todasSinAsignar = useMemo(() => bookings?.filter((b) => b.roomId === null) ?? [], [bookings])

  const sinAsignar = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return todasSinAsignar.filter((b) => {
      const coincideBusqueda =
        !q ||
        b.guestName.toLowerCase().includes(q) ||
        (b.folio ?? '').toLowerCase().includes(q) ||
        (b.idDocumentNumber ?? '').toLowerCase().includes(q) ||
        (b.email ?? '').toLowerCase().includes(q) ||
        (b.phoneNumber ?? '').toLowerCase().includes(q)

      return (
        coincideBusqueda &&
        (!filtros.origen || b.reservationSource === filtros.origen) &&
        (!filtros.estado || b.status === filtros.estado) &&
        (!filtros.tipoHabitacion || b.roomType === filtros.tipoHabitacion) &&
        (!filtros.checkInDesde || b.checkInDate >= filtros.checkInDesde) &&
        (!filtros.checkInHasta || b.checkInDate <= filtros.checkInHasta)
      )
    })
  }, [todasSinAsignar, filtros])

  const actualizarFiltro = <K extends keyof typeof FILTROS_INICIALES>(
    campo: K,
    valor: (typeof FILTROS_INICIALES)[K],
  ) => setFiltros((previo) => ({ ...previo, [campo]: valor }))

  const manejarEliminar = (id: number, guestName: string) => {
    if (confirm(`¿Cancelar la reserva de ${guestName}?`)) {
      eliminarBooking.mutate(id)
    }
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-6">
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

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block xl:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Buscar
            </span>
            <input
              type="text"
              placeholder="Huésped, folio, documento, teléfono o correo"
              value={filtros.busqueda}
              onChange={(e) => actualizarFiltro('busqueda', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Origen
            </span>
            <select
              value={filtros.origen}
              onChange={(e) => actualizarFiltro('origen', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {(sequences ?? []).map((s) => (
                <option key={s.origin} value={s.origin}>
                  {RESERVATION_SOURCE_LABELS[s.origin] ?? s.origin}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado
            </span>
            <select
              value={filtros.estado}
              onChange={(e) => actualizarFiltro('estado', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Tipo de habitación
            </span>
            <select
              value={filtros.tipoHabitacion}
              onChange={(e) => actualizarFiltro('tipoHabitacion', e.target.value)}
              className={inputClass}
            >
              <option value="">Todos</option>
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Check-in desde
            </span>
            <input
              type="date"
              value={filtros.checkInDesde}
              onChange={(e) => actualizarFiltro('checkInDesde', e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Check-in hasta
            </span>
            <input
              type="date"
              value={filtros.checkInHasta}
              onChange={(e) => actualizarFiltro('checkInHasta', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {sinAsignar.length} de {todasSinAsignar.length} reservas
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

      {isLoading && <p className="text-slate-500">Cargando reservas...</p>}
      {isError && <p className="text-red-600">No se pudo conectar con el API.</p>}

      {bookings && todasSinAsignar.length === 0 && (
        <p className="text-slate-500">No hay reservas pendientes de asignar habitación.</p>
      )}

      {bookings && todasSinAsignar.length > 0 && sinAsignar.length === 0 && (
        <p className="text-slate-500">Ninguna reserva coincide con los filtros aplicados.</p>
      )}

      {sinAsignar.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">Folio</th>
                <th className="px-4 py-3 whitespace-nowrap">Origen</th>
                <th className="px-4 py-3 whitespace-nowrap">Huésped</th>
                <th className="px-4 py-3 whitespace-nowrap">Fecha nacimiento</th>
                <th className="px-4 py-3 whitespace-nowrap">Nacionalidad</th>
                <th className="px-4 py-3 whitespace-nowrap">Documento</th>
                <th className="px-4 py-3 whitespace-nowrap">Domicilio</th>
                <th className="px-4 py-3 whitespace-nowrap">Teléfono</th>
                <th className="px-4 py-3 whitespace-nowrap">Correo</th>
                <th className="px-4 py-3 whitespace-nowrap">Huéspedes</th>
                <th className="px-4 py-3 whitespace-nowrap">Motivo de viaje</th>
                <th className="px-4 py-3 whitespace-nowrap">Tipo de habitación</th>
                <th className="px-4 py-3 whitespace-nowrap">Check-in</th>
                <th className="px-4 py-3 whitespace-nowrap">Check-out</th>
                <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {sinAsignar.map((booking) => (
                <tr key={booking.id} className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-3 font-mono whitespace-nowrap">{booking.folio ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {RESERVATION_SOURCE_LABELS[booking.reservationSource] ?? booking.reservationSource}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.guestName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.dateOfBirth ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.nationality ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearDocumento(booking)}</td>
                  <td
                    className="max-w-[16rem] truncate px-4 py-3"
                    title={booking.address ?? undefined}
                  >
                    {booking.address ?? SIN_DATO}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.phoneNumber ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.email ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatearHuespedes(booking)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelPurpose ?? SIN_DATO}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.roomType ?? 'Sin preferencia'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.checkInDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.checkOutDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{STATUS_LABELS[booking.status]}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
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

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white'
