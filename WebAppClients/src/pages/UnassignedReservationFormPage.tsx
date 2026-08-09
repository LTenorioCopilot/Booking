import { useNavigate, useParams } from 'react-router-dom'
import { BookingForm } from '../components/BookingForm'
import { useActualizarBooking, useBooking, useCrearBooking } from '../hooks/useBookings'
import type { BookingInput } from '../types/booking'

export function UnassignedReservationFormPage() {
  const { id } = useParams<{ id: string }>()
  const bookingId = id ? Number(id) : undefined
  const esEdicion = bookingId !== undefined

  const navigate = useNavigate()
  const { data: booking, isLoading } = useBooking(bookingId)
  const crearBooking = useCrearBooking()
  const actualizarBooking = useActualizarBooking()

  const enviando = crearBooking.isPending || actualizarBooking.isPending

  const manejarSubmit = (valores: BookingInput) => {
    if (esEdicion && bookingId !== undefined) {
      actualizarBooking.mutate(
        { id: bookingId, booking: valores },
        { onSuccess: () => navigate('/reservas-sin-asignar') },
      )
    } else {
      crearBooking.mutate(valores, { onSuccess: () => navigate('/reservas-sin-asignar') })
    }
  }

  if (esEdicion && isLoading) {
    return <p className="p-6 text-slate-500">Cargando reserva...</p>
  }

  return (
    <div className="p-6">
      <div className="mx-auto mb-6 flex max-w-2xl items-center">
        <button
          type="button"
          onClick={() => navigate('/reservas-sin-asignar')}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          ← Regresar
        </button>
      </div>
      <h1 className="mb-6 text-center text-2xl font-semibold text-slate-900 dark:text-white">
        {esEdicion ? 'Editar / asignar reserva' : 'Nueva reserva sin asignar'}
      </h1>
      <BookingForm bookingInicial={booking} onSubmit={manejarSubmit} enviando={enviando} />
    </div>
  )
}
