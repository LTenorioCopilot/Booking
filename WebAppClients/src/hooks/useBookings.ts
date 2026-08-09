import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bookingApi } from '../api/bookingApi'
import type { BookingInput } from '../types/booking'

const BOOKINGS_KEY = ['bookings']

export function useBookings() {
  return useQuery({
    queryKey: BOOKINGS_KEY,
    queryFn: bookingApi.listar,
  })
}

export function useCrearBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (booking: BookingInput) => bookingApi.crear(booking),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useActualizarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, booking }: { id: number; booking: BookingInput }) =>
      bookingApi.actualizar(id, booking),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}

export function useEliminarBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => bookingApi.eliminar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY }),
  })
}
