import { httpClient } from './httpClient'
import type { Booking, BookingInput } from '../types/booking'

const RESOURCE = '/bookings'

export const bookingApi = {
  listar: async (): Promise<Booking[]> => {
    const { data } = await httpClient.get<Booking[]>(RESOURCE)
    return data
  },

  obtener: async (id: number): Promise<Booking> => {
    const { data } = await httpClient.get<Booking>(`${RESOURCE}/${id}`)
    return data
  },

  crear: async (booking: BookingInput): Promise<Booking> => {
    const { data } = await httpClient.post<Booking>(RESOURCE, booking)
    return data
  },

  actualizar: async (id: number, booking: BookingInput): Promise<Booking> => {
    const { data } = await httpClient.put<Booking>(`${RESOURCE}/${id}`, booking)
    return data
  },

  eliminar: async (id: number): Promise<void> => {
    await httpClient.delete(`${RESOURCE}/${id}`)
  },
}
