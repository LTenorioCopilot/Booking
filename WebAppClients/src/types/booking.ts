export type BookingStatus = 'Pending' | 'Confirmed' | 'CheckedIn'

export interface Booking {
  id: number
  roomId: string
  guestName: string
  status: BookingStatus
  startHour: number
  endHour: number
  checkInDate: string
  checkOutDate: string
}

export type BookingInput = Omit<Booking, 'id'>
