import type { Booking } from '../types/booking'

export function hasDateOverlap(
  bookings: Booking[],
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: number,
) {
  return bookings.some(
    (b) =>
      b.roomId === roomId &&
      b.id !== excludeBookingId &&
      checkInDate < b.checkOutDate &&
      checkOutDate > b.checkInDate,
  )
}
